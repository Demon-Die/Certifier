-- 007_fix_user_id_types.sql
-- Fixes type mismatch: profiles.id is TEXT (stores GitHub user IDs),
-- but contributions/badge_claims.user_id were created as UUID.
-- This prevents webhook from inserting contributions or calling increment_points.
--
-- Must drop dependent policies/indexes/constraints first, alter columns,
-- then recreate them.

-- ============================================================================
-- STEP 1: Drop RLS policies that reference user_id columns
-- ============================================================================
DROP POLICY IF EXISTS "contributions_select_own_or_maintainer" ON public.contributions;
DROP POLICY IF EXISTS "badge_claims_select_own_or_maintainer" ON public.badge_claims;
DROP POLICY IF EXISTS "badge_claims_insert_own_available" ON public.badge_claims;
DROP POLICY IF EXISTS "badge_claims_update_own_claim_or_admin" ON public.badge_claims;
DROP POLICY IF EXISTS "special_nominations_select_own_or_maintainer" ON public.special_nominations;

-- ============================================================================
-- STEP 2: Drop indexes that reference user_id columns
-- ============================================================================
DROP INDEX IF EXISTS idx_contributions_unique;
DROP INDEX IF EXISTS idx_contributions_user_merged;
DROP INDEX IF EXISTS idx_badge_claims_unique;
DROP INDEX IF EXISTS idx_badge_claims_user_family;
DROP INDEX IF EXISTS idx_badge_claims_available;

-- ============================================================================
-- STEP 3: Drop foreign key constraints that reference user_id columns
--          (they'll be recreated after type change)
-- ============================================================================
ALTER TABLE public.contributions
  DROP CONSTRAINT IF EXISTS contributions_user_id_fkey;

ALTER TABLE public.badge_claims
  DROP CONSTRAINT IF EXISTS badge_claims_user_id_fkey;

ALTER TABLE public.maintainer_settings
  DROP CONSTRAINT IF EXISTS maintainer_settings_updated_by_fkey;

ALTER TABLE public.special_badges
  DROP CONSTRAINT IF EXISTS special_badges_awarded_to_fkey;

ALTER TABLE public.special_nominations
  DROP CONSTRAINT IF EXISTS special_nominations_nominee_id_fkey;

ALTER TABLE public.special_nominations
  DROP CONSTRAINT IF EXISTS special_nominations_nominated_by_fkey;

-- ============================================================================
-- STEP 4: Alter column types from uuid → text
-- ============================================================================
ALTER TABLE public.contributions
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE public.badge_claims
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE public.maintainer_settings
  ALTER COLUMN updated_by TYPE text USING updated_by::text;

ALTER TABLE public.special_badges
  ALTER COLUMN awarded_to TYPE text USING awarded_to::text;

ALTER TABLE public.special_nominations
  ALTER COLUMN nominee_id TYPE text USING nominee_id::text;

ALTER TABLE public.special_nominations
  ALTER COLUMN nominated_by TYPE text USING nominated_by::text;

-- ============================================================================
-- STEP 5: Recreate foreign key constraints
-- ============================================================================
ALTER TABLE public.contributions
  ADD CONSTRAINT contributions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.badge_claims
  ADD CONSTRAINT badge_claims_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.maintainer_settings
  ADD CONSTRAINT maintainer_settings_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES public.profiles(id);

ALTER TABLE public.special_badges
  ADD CONSTRAINT special_badges_awarded_to_fkey
  FOREIGN KEY (awarded_to) REFERENCES public.profiles(id);

ALTER TABLE public.special_nominations
  ADD CONSTRAINT special_nominations_nominee_id_fkey
  FOREIGN KEY (nominee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.special_nominations
  ADD CONSTRAINT special_nominations_nominated_by_fkey
  FOREIGN KEY (nominated_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 6: Recreate indexes
-- ============================================================================
CREATE UNIQUE INDEX idx_contributions_unique
  ON public.contributions(user_id, repo, pr_number);
CREATE INDEX idx_contributions_user_merged
  ON public.contributions(user_id, merged_at DESC);
CREATE UNIQUE INDEX idx_badge_claims_unique
  ON public.badge_claims(user_id, family, tier);
CREATE INDEX idx_badge_claims_user_family
  ON public.badge_claims(user_id, family);
CREATE INDEX idx_badge_claims_available
  ON public.badge_claims(user_id, status)
  WHERE status = 'available';

-- ============================================================================
-- STEP 7: Recreate RLS policies
-- ============================================================================
CREATE POLICY "contributions_select_own_or_maintainer"
  ON public.contributions FOR SELECT
  USING (auth.uid()::text = user_id OR public.is_maintainer_or_admin());

CREATE POLICY "badge_claims_select_own_or_maintainer"
  ON public.badge_claims FOR SELECT
  USING (auth.uid()::text = user_id OR public.is_maintainer_or_admin());

CREATE POLICY "badge_claims_insert_own_available"
  ON public.badge_claims FOR INSERT
  WITH CHECK (auth.uid()::text = user_id AND status = 'available');

CREATE POLICY "badge_claims_update_own_claim_or_admin"
  ON public.badge_claims FOR UPDATE
  USING (auth.uid()::text = user_id OR public.is_admin())
  WITH CHECK (
    (auth.uid()::text = user_id AND status = 'claimed' AND certifier_credential_id IS NOT NULL)
    OR public.is_admin()
  );

CREATE POLICY "special_nominations_select_own_or_maintainer"
  ON public.special_nominations FOR SELECT
  USING (
    auth.uid()::text = nominee_id
    OR auth.uid()::text = nominated_by
    OR public.is_maintainer_or_admin()
  );

-- ============================================================================
-- STEP 8: Fix increment_points RPC to accept text p_user_id
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_points(
  p_user_id TEXT,
  p_column TEXT,
  p_points INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_column NOT IN ('points_frontend', 'points_backend', 'points_docs', 'points_ideas', 'points_community') THEN
    RAISE EXCEPTION 'Invalid column name: %', p_column;
  END IF;

  EXECUTE format(
    'UPDATE profiles SET %I = COALESCE(%I, 0) + $1, updated_at = now() WHERE id = $2',
    p_column, p_column
  ) USING p_points, p_user_id;
END;
$$;

-- ============================================================================
-- STEP 9: Fix check_and_create_badge_claims RPC to accept text p_user_id
-- ============================================================================
CREATE OR REPLACE FUNCTION check_and_create_badge_claims(p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fam TEXT;
  pts INTEGER;
  thresholds CONSTANT INTEGER[] := ARRAY[5, 15, 45, 135];
  tier_names CONSTANT TEXT[] := ARRAY['imp', 'fiend', 'overlord', 'demon king'];
  i INTEGER;
BEGIN
  FOR fam IN SELECT unnest(ARRAY['frontend', 'backend', 'docs', 'ideas', 'community'])
  LOOP
    EXECUTE format('SELECT %I FROM profiles WHERE id = $1', 'points_' || fam)
    INTO pts USING p_user_id;

    FOR i IN 1..array_length(thresholds, 1)
    LOOP
      IF pts >= thresholds[i] THEN
        INSERT INTO badge_claims (user_id, family, tier, status)
        VALUES (p_user_id, fam, tier_names[i], 'available')
        ON CONFLICT (user_id, family, tier) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
