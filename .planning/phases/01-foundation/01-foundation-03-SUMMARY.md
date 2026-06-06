---
phase: 01-foundation
plan: 03
subsystem: auth
tags:
  - nextauth
  - github-oauth
  - supabase
  - middleware
  - typescript
dependency_graph:
  requires:
    - 01-foundation-01
    - 01-foundation-02
  provides:
    - nextauth-config
    - github-oauth-provider
    - session-management
    - route-protection
  affects:
    - all protected routes
    - user profile creation
tech_stack:
  added:
    - next-auth@4
  patterns:
    - jwt-session-strategy
    - oauth-callback-profile-upsert
    - combined-middleware-chain
key_files:
  created:
    - src/lib/auth-options.ts
    - src/app/api/auth/[...nextauth]/route.ts
    - src/app/providers.tsx
    - src/lib/auth.ts
    - src/middleware.ts
    - src/types/next-auth.d.ts
  modified:
    - package.json
    - package-lock.json
    - src/app/layout.tsx
    - .env.example
decisions:
  - "Use NextAuth v4 (stable) instead of v5 (beta) for production reliability"
  - "Store GitHub access token in JWT (server-side only) for future API calls"
  - "Auto-create/update Supabase profile on every sign-in via signIn callback"
  - "Fetch role from Supabase in jwt callback for authorization"
  - "Use combined middleware chain: Supabase session refresh + NextAuth authorization"
  - "Protect /dashboard, /admin, /api/protected routes via middleware"
  - "Default role 'contributor' with 'maintainer' and 'admin' for elevated access"
  - "Extend TypeScript types via module augmentation for session.user custom fields"
metrics:
  duration_seconds: 3635
  completed_date: "2026-06-06"
  tasks_completed: 3
  files_created: 6
  files_modified: 4
  commits: 2
---

# Phase 01 Plan 03: NextAuth.js GitHub Provider, Session, Middleware Summary

**One-liner:** NextAuth v4 with GitHub OAuth, JWT session storing GitHub access token, auto profile upsert to Supabase, combined middleware for route protection, and full TypeScript type augmentation.

---

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install NextAuth and configure GitHub provider with callbacks | 9875957 | src/lib/auth-options.ts, src/app/api/auth/[...nextauth]/route.ts, package.json |
| 2 | Implement signIn callback to auto-create/update Supabase profile | 62664b0 | src/lib/auth-options.ts (signIn + jwt callbacks) |
| 3 | Create SessionProvider, auth helper, middleware, and TypeScript types | 62664b0 | src/app/providers.tsx, src/lib/auth.ts, src/middleware.ts, src/types/next-auth.d.ts, src/app/layout.tsx |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript profile callback return type mismatch**
- **Found during:** Task 1 build verification
- **Issue:** The GitHub provider's `profile` callback return type must match the extended `User` type including `githubAccessToken` and `role`
- **Fix:** Added default values for `githubAccessToken: ''` and `role: 'contributor'` in profile callback return
- **Files modified:** src/lib/auth-options.ts
- **Commit:** 62664b0

**2. [Rule 1 - Bug] NextAuth middleware Edge Runtime incompatibility**
- **Found during:** Task 3 build verification
- **Issue:** NextAuth v4 uses `regenerator` which is incompatible with Next.js Edge Runtime
- **Fix:** Restructured middleware to use `withAuth` from `next-auth/middleware` which runs in Edge-compatible way, and call `updateSession` inside the authenticated callback
- **Files modified:** src/middleware.ts
- **Commit:** 62664b0

**3. [Rule 1 - Bug] TypeScript `nextauth` property missing on NextRequest**
- **Found during:** Task 3 build verification
- **Issue:** `withAuth` adds `nextauth` property to request but TypeScript doesn't know about it
- **Fix:** Created `NextAuthRequest` interface extending `NextRequest` with `nextauth` property
- **Files modified:** src/middleware.ts
- **Commit:** 62664b0

**4. [Rule 1 - Bug] Unused imports and ESLint errors**
- **Found during:** Multiple build verifications
- **Issue:** ESLint errors for unused imports (`Account`, `User`), explicit `any` usage, Prettier formatting
- **Fix:** Removed unused imports, added eslint-disable comment for necessary `any` cast, ran Prettier on all new files
- **Files modified:** src/lib/auth-options.ts, src/app/providers.tsx, src/lib/auth.ts, src/middleware.ts, src/types/next-auth.d.ts
- **Commit:** 62664b0

**5. [Rule 1 - Bug] `account.access_token` potentially undefined**
- **Found during:** Task 2 build verification
- **Issue:** TypeScript error when assigning `account.access_token` (type `string | undefined`) to `token.githubAccessToken` (type `string`)
- **Fix:** Added explicit check `account.access_token` in jwt callback condition
- **Files modified:** src/lib/auth-options.ts
- **Commit:** 62664b0

---

## Auth Gates

None - GitHub OAuth app creation is documented as manual user setup in `.env.example` and plan frontmatter.

---

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: token_storage | src/lib/auth-options.ts | GitHub access token stored in JWT (signed with NEXTAUTH_SECRET, httpOnly cookie) - mitigated per T-01-12 |
| threat_flag: role_elevation | src/lib/auth-options.ts | Role fetched from Supabase in jwt callback, not client-provided - mitigated per T-01-13 |
| threat_flag: profile_upsert | src/lib/auth-options.ts | Profile upserted on every sign-in with service role key - RLS policies enforce access control |

---

## Known Stubs

None - All implementation is complete with no placeholder code. The auth flow is fully functional pending GitHub OAuth app configuration.

---

## Verification Results

- ✅ `npm run build` passes (TypeScript compilation, ESLint, Prettier)
- ✅ NextAuth v4 installed and configured with GitHub provider
- ✅ GitHub access token stored in JWT (not exposed to client directly)
- ✅ Profile auto-created/updated in Supabase on sign-in via `signIn` callback
- ✅ Role fetched from Supabase and added to token/session via `jwt` callback
- ✅ SessionProvider wraps entire app in `layout.tsx`
- ✅ Middleware protects `/dashboard`, `/admin`, `/api/protected` routes
- ✅ TypeScript types extended for `githubAccessToken`, `role`, `githubId`, `githubUsername`
- ✅ All env vars documented in `.env.example` (NEXTAUTH_URL, NEXTAUTH_SECRET, GITHUB_ID, GITHUB_SECRET)
- ✅ Default role 'contributor' enforced
- ✅ Admin route protection with role check

---

## Self-Check: PASSED

All created files exist, commits verified, build passes, no missing items.