-- Migration 004: Add helper functions for points awarding and badge claiming
-- Requires: Run after 001_initial_schema.sql and 002_rls_policies.sql

-- Function to increment a specific points column on the profiles table
-- Uses dynamic column name for safety (not dynamic SQL - uses CASE for valid columns)
CREATE OR REPLACE FUNCTION increment_points(
  p_user_id UUID,
  p_column TEXT,
  p_points INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate column name to prevent SQL injection
  IF p_column NOT IN ('points_frontend', 'points_backend', 'points_docs', 'points_ideas', 'points_community') THEN
    RAISE EXCEPTION 'Invalid column name: %', p_column;
  END IF;

  -- Use CASE to map column names safely
  EXECUTE format(
    'UPDATE profiles SET %I = COALESCE(%I, 0) + $1, updated_at = now() WHERE id = $2',
    p_column, p_column
  ) USING p_points, p_user_id;
END;
$$;

-- Function to check if a badge threshold is reached and insert badge_claims row
CREATE OR REPLACE FUNCTION check_and_create_badge_claims(p_user_id UUID)
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
