-- 001_initial_schema.sql
-- Complete database schema for Contributor Badge Program
-- 6 tables: profiles, contributions, badge_claims, maintainer_settings, special_badges, special_nominations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. profiles
-- ============================================================================
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    github_username text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'contributor'
        CHECK (role IN ('contributor', 'maintainer', 'admin')),
    points_frontend integer NOT NULL DEFAULT 0,
    points_backend integer NOT NULL DEFAULT 0,
    points_docs integer NOT NULL DEFAULT 0,
    points_ideas integer NOT NULL DEFAULT 0,
    points_community integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. contributions
-- ============================================================================
CREATE TABLE public.contributions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    repo text NOT NULL,
    pr_number integer NOT NULL,
    pr_title text NOT NULL,
    pr_url text NOT NULL,
    merged_at timestamptz NOT NULL,
    family text NOT NULL
        CHECK (family IN ('frontend', 'backend', 'docs', 'ideas', 'community')),
    tier text NOT NULL
        CHECK (tier IN ('imp', 'fiend', 'overlord', 'demon king')),
    points_awarded integer NOT NULL,
    label_used text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one contribution per user per repo per PR
CREATE UNIQUE INDEX idx_contributions_unique
    ON public.contributions(user_id, repo, pr_number);

-- Index for user's contributions ordered by merge date
CREATE INDEX idx_contributions_user_merged
    ON public.contributions(user_id, merged_at DESC);

-- Index for repo-based queries
CREATE INDEX idx_contributions_repo ON public.contributions(repo);

-- ============================================================================
-- 3. badge_claims
-- ============================================================================
CREATE TABLE public.badge_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    family text NOT NULL
        CHECK (family IN ('frontend', 'backend', 'docs', 'ideas', 'community')),
    tier text NOT NULL
        CHECK (tier IN ('imp', 'fiend', 'overlord', 'demon king')),
    status text NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'claimed')),
    certifier_credential_id text,
    claimed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one badge claim per user per family per tier
CREATE UNIQUE INDEX idx_badge_claims_unique
    ON public.badge_claims(user_id, family, tier);

-- Index for user's badge claims by family
CREATE INDEX idx_badge_claims_user_family
    ON public.badge_claims(user_id, family);

-- Index for available claims
CREATE INDEX idx_badge_claims_available
    ON public.badge_claims(user_id, status)
    WHERE status = 'available';

-- ============================================================================
-- 4. maintainer_settings (single row)
-- ============================================================================
CREATE TABLE public.maintainer_settings (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    github_org_name text NOT NULL,
    tracked_repos jsonb NOT NULL DEFAULT '[]'::jsonb,
    webhook_secret text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES public.profiles(id)
);

CREATE TRIGGER maintainer_settings_updated_at
    BEFORE UPDATE ON public.maintainer_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. special_badges (fixed 5 rows)
-- ============================================================================
CREATE TABLE public.special_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    quota integer NOT NULL DEFAULT 1,
    awarded_to uuid REFERENCES public.profiles(id),
    awarded_at timestamptz,
    certifier_credential_id text
);

-- ============================================================================
-- 6. special_nominations
-- ============================================================================
CREATE TABLE public.special_nominations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id uuid NOT NULL REFERENCES public.special_badges(id) ON DELETE CASCADE,
    nominee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nominated_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    votes integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'voting', 'awarded', 'rejected')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for badge nominations by status
CREATE INDEX idx_special_nominations_badge_status
    ON public.special_nominations(badge_id, status);

-- Index for user's nominations
CREATE INDEX idx_special_nominations_nominee
    ON public.special_nominations(nominee_id);

-- Index for nominator's nominations
CREATE INDEX idx_special_nominations_nominator
    ON public.special_nominations(nominated_by);
