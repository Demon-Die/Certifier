-- 002_rls_policies.sql
-- Row Level Security policies for all tables
-- Enforces: users see own data, maintainers/admins see all, admins manage settings

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintainer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_nominations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper function: is_maintainer_or_admin()
-- Returns true if the current user has role 'maintainer' or 'admin'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_maintainer_or_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('maintainer', 'admin')
    );
END;
$$;

-- ============================================================================
-- Helper function: is_admin()
-- Returns true if the current user has role 'admin'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$;

-- ============================================================================
-- profiles policies
-- ============================================================================

-- SELECT: Users see own profile OR maintainers/admins see all
CREATE POLICY "profiles_select_own_or_maintainer"
    ON public.profiles
    FOR SELECT
    USING (
        auth.uid() = id
        OR public.is_maintainer_or_admin()
    );

-- INSERT: Only via trigger on auth.users (handled in Phase 02)
-- No INSERT policy - only service role / trigger can insert

-- UPDATE: Users update own profile; admins update any
CREATE POLICY "profiles_update_own_or_admin"
    ON public.profiles
    FOR UPDATE
    USING (
        auth.uid() = id
        OR public.is_admin()
    )
    WITH CHECK (
        auth.uid() = id
        OR public.is_admin()
    );

-- DELETE: Admins only
CREATE POLICY "profiles_delete_admin"
    ON public.profiles
    FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- contributions policies
-- ============================================================================

-- SELECT: Users see own contributions; maintainers/admins see all
CREATE POLICY "contributions_select_own_or_maintainer"
    ON public.contributions
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.is_maintainer_or_admin()
    );

-- INSERT: Service role only (webhook handler)
-- No INSERT policy for authenticated users - only service_role can insert

-- UPDATE: Admins only
CREATE POLICY "contributions_update_admin"
    ON public.contributions
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- DELETE: Admins only
CREATE POLICY "contributions_delete_admin"
    ON public.contributions
    FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- badge_claims policies
-- ============================================================================

-- SELECT: Users see own claims; maintainers/admins see all
CREATE POLICY "badge_claims_select_own_or_maintainer"
    ON public.badge_claims
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.is_maintainer_or_admin()
    );

-- INSERT: Users insert own 'available' claims (triggered by points threshold);
-- service role for initial creation
CREATE POLICY "badge_claims_insert_own_available"
    ON public.badge_claims
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND status = 'available'
    );

-- UPDATE: Users update own to 'claimed' with certifier_credential_id; admins any
CREATE POLICY "badge_claims_update_own_claim_or_admin"
    ON public.badge_claims
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR public.is_admin()
    )
    WITH CHECK (
        (auth.uid() = user_id AND status = 'claimed' AND certifier_credential_id IS NOT NULL)
        OR public.is_admin()
    );

-- DELETE: Admins only
CREATE POLICY "badge_claims_delete_admin"
    ON public.badge_claims
    FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- maintainer_settings policies
-- ============================================================================

-- SELECT: Maintainers/admins only
CREATE POLICY "maintainer_settings_select_maintainer"
    ON public.maintainer_settings
    FOR SELECT
    USING (public.is_maintainer_or_admin());

-- UPDATE: Admins only
CREATE POLICY "maintainer_settings_update_admin"
    ON public.maintainer_settings
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- No INSERT/DELETE policies - single row managed by admins via UPDATE

-- ============================================================================
-- special_badges policies
-- ============================================================================

-- SELECT: All authenticated users
CREATE POLICY "special_badges_select_authenticated"
    ON public.special_badges
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- UPDATE: Admins only (awarding)
CREATE POLICY "special_badges_update_admin"
    ON public.special_badges
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- No INSERT/DELETE policies - fixed 5 rows managed by admins

-- ============================================================================
-- special_nominations policies
-- ============================================================================

-- SELECT: Maintainers/admins see all; users see own nominations
CREATE POLICY "special_nominations_select_own_or_maintainer"
    ON public.special_nominations
    FOR SELECT
    USING (
        auth.uid() = nominee_id
        OR auth.uid() = nominated_by
        OR public.is_maintainer_or_admin()
    );

-- INSERT: Maintainers/admins only (nominate)
CREATE POLICY "special_nominations_insert_maintainer"
    ON public.special_nominations
    FOR INSERT
    WITH CHECK (public.is_maintainer_or_admin());

-- UPDATE: Maintainers/admins only (voting)
CREATE POLICY "special_nominations_update_maintainer"
    ON public.special_nominations
    FOR UPDATE
    USING (public.is_maintainer_or_admin())
    WITH CHECK (public.is_maintainer_or_admin());

-- DELETE: Admins only
CREATE POLICY "special_nominations_delete_admin"
    ON public.special_nominations
    FOR DELETE
    USING (public.is_admin());

-- ============================================================================
-- Grant necessary permissions to authenticated role
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- Note: RLS policies will restrict actual access

-- Grant service_role full access (bypasses RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
