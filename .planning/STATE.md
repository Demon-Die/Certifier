# Planning State

## Current Position

- **Phase:** 02-auth-profiles
- **Plan:** 01 (02-01-PLAN.md)
- **Status:** COMPLETE
- **Wave:** 1

## Progress Bar

```
Phase 01: Foundation ██████████ 100% (3/3 plans)
  [x] 01-01-PLAN.md - Scaffold Next.js + shadcn/ui + dark theme
  [x] 01-02-PLAN.md - Supabase schema, migrations, RLS, Realtime
  [x] 01-03-PLAN.md - NextAuth.js GitHub provider, session, middleware

Phase 02: Authentication & Profiles █████░░░░░ 50% (1/2 plans)
  [x] 02-01-PLAN.md - Sign-in page, user menu, auth UI
  [ ] 02-02-PLAN.md - Profile page, role management, avatar upload

Phase 03: Admin Configuration ░░░░░░░░░░ 0% (0/1 plans)
Phase 04: GitHub Webhook & Points Engine ░░░░░░░░░░ 0% (0/2 plans)
Phase 05: Contributor Dashboard ░░░░░░░░░░ 0% (0/2 plans)
Phase 06: Badge System & certifier.io ░░░░░░░░░░ 0% (0/2 plans)
Phase 07: Contributions History ░░░░░░░░░░ 0% (0/1 plans)
Phase 08: Special Badges ░░░░░░░░░░ 0% (0/1 plans)
Phase 09: Deployment & Polish ░░░░░░░░░░ 0% (0/2 plans)

Overall: ████░░░░░░░ 19% (3/16 plans)
```

## Decisions

| Date | Decision | Context |
|------|----------|---------|
| 2026-06-06 | shadcn/ui base-nova style with @base-ui/react | Newest shadcn/ui v4+ uses @base-ui/react primitives instead of Radix UI |
| 2026-06-06 | sonner for toast notifications | shadcn/ui toast not yet available in base-nova registry |
| 2026-06-06 | HSL CSS variables over OKLCH | Better browser compatibility and debugging |
| 2026-06-06 | Dark mode default via next-themes | No flash on load with disableTransitionOnChange |
| 2026-06-06 | @supabase/ssr for SSR clients | Replaces legacy @supabase/auth-helpers, supports Next.js App Router |
| 2026-06-06 | RLS helper functions with SECURITY DEFINER | is_maintainer_or_admin(), is_admin() for policy reuse and performance |
| 2026-06-06 | REPLICA IDENTITY FULL on realtime tables | Ensures UPDATE/DELETE events contain old values for subscriptions |
| 2026-06-06 | NextAuth v4 (stable) over v5 (beta) | Production reliability for authentication |
| 2026-06-06 | JWT session strategy with GitHub access token | Store access token server-side for future API calls |
| 2026-06-06 | Combined middleware chain | Supabase session refresh + NextAuth authorization |
| 2026-06-06 | Split auth utilities into server/client files | auth.ts for server (getServerSession), auth-client.ts for client (signOut) |
| 2026-06-06 | Inline SVG for GitHub icon | lucide-react doesn't include GitHub logo |
| 2026-06-06 | Role badge variants: contributor=secondary, maintainer=default, admin=destructive | Visual hierarchy for role display in UserMenu |

## Blockers

None

## Issues

| Date | Plan | Issue | Status |
|------|------|-------|--------|
| 2026-06-06 | 01-01 | `@apply border-border` compilation error | FIXED - used direct CSS |
| 2026-06-06 | 01-01 | eslint-config-prettier missing | FIXED - installed package |
| 2026-06-06 | 01-01 | Prettier formatting mismatch | FIXED - ran prettier --write |
| 2026-06-06 | 01-03 | TypeScript profile callback return type mismatch | FIXED - added default githubAccessToken and role |
| 2026-06-06 | 01-03 | NextAuth middleware Edge Runtime incompatibility | FIXED - used withAuth with internal updateSession call |
| 2026-06-06 | 01-03 | TypeScript nextauth property missing on NextRequest | FIXED - created NextAuthRequest interface |
| 2026-06-06 | 01-03 | account.access_token potentially undefined | FIXED - added explicit check in jwt callback |
| 2026-06-06 | 02-01 | Server/client code mixing in auth.ts | FIXED - created separate auth-client.ts |
| 2026-06-06 | 02-01 | lucide-react missing GitHub icon | FIXED - used inline SVG |
| 2026-06-06 | 02-01 | @base-ui/react DropdownMenuTrigger doesn't support asChild | FIXED - removed asChild prop |
| 2026-06-06 | 02-01 | useSearchParams requires Suspense boundary | FIXED - added Suspense wrapper |

## Session Info

- **Last session:** 2026-06-06T11:45:00Z
- **Completed:** 02-auth-profiles-01-PLAN.md
- **Stopped at:** None (plan complete)
- **Resume file:** None

## Performance Metrics

| Phase | Plan | Duration (s) | Tasks | Files | Commit |
|-------|------|--------------|-------|-------|--------|
| 01-foundation | 01 | 1800 | 3 | 29 | ed0bdbf |
| 01-foundation | 02 | 3600 | 3 | 10 | 47227d7 |
| 01-foundation | 03 | 3635 | 3 | 10 | 9875957, 62664b0 |
| 02-auth-profiles | 01 | 2700 | 3 | 8 | 6044b78, 3ed3d9b, dda7936, 212deb2 |