# Requirements Traceability

## Requirements Mapping

| ID | Description | Status | Phase | Plan | Commit |
|----|-------------|--------|-------|------|--------|
| REQ-01 | Next.js 14 + TypeScript + Tailwind + shadcn/ui scaffolded | ✅ COMPLETE | 01-foundation | 01-01 | ed0bdbf |
| REQ-02 | Supabase project with all tables, RLS policies, Realtime enabled | ⬜ PENDING | 01-foundation | 01-02 | - |
| REQ-03 | NextAuth.js with GitHub provider, session stores GitHub access token | ⬜ PENDING | 01-foundation | 01-03 | - |
| REQ-04 | GitHub OAuth flow works, profiles auto-created on first sign-in | ✅ COMPLETE | 02-auth-profiles | 02-01 | 6044b78, 3ed3d9b, dda7936 |
| REQ-05 | Role-based access: contributor / maintainer / admin | ⬜ PENDING | 02-auth-profiles | 02-02 | - |
| REQ-06 | Admin page: configure org name, tracked repos, webhook secret | ⬜ PENDING | 03-admin-config | 03-01 | - |
| REQ-07 | `/api/webhooks/github` endpoint with HMAC signature verification | ⬜ PENDING | 04-webhook-points | 04-01 | - |
| REQ-08 | Parse `family:tier` labels from merged PRs | ⬜ PENDING | 04-webhook-points | 04-02 | - |
| REQ-09 | Award points to PR author immediately on merge | ⬜ PENDING | 04-webhook-points | 04-02 | - |
| REQ-10 | Log each contribution with full metadata | ⬜ PENDING | 04-webhook-points | 04-02 | - |
| REQ-11 | Dashboard: 5 family cards showing current points per family | ⬜ PENDING | 05-contributor-dashboard | 05-01 | - |
| REQ-12 | Dashboard: Progress bars to next badge tier per family | ⬜ PENDING | 05-contributor-dashboard | 05-02 | - |
| REQ-13 | Dashboard: Claimable badges with "Claim" button, real-time | ⬜ PENDING | 05-contributor-dashboard | 05-02 | - |
| REQ-14 | "Claim Badge" calls certifier.io API, stores credential_id | ⬜ PENDING | 06-badge-system | 06-01 | - |
| REQ-15 | Embeddable badge image displayed after claim | ⬜ PENDING | 06-badge-system | 06-02 | - |
| REQ-16 | certifier.io rate limits handled gracefully | ⬜ PENDING | 06-badge-system | 06-02 | - |
| REQ-17 | Contributions history: paginated, filterable | ⬜ PENDING | 07-contributions-history | 07-01 | - |
| REQ-18 | Special badges: 5 fixed badges, maintainer nomination + voting | ⬜ PENDING | 08-special-badges | 08-01 | - |
| REQ-19 | Special badge awarding: winner gets badge, certifier.io credential | ⬜ PENDING | 08-special-badges | 08-01 | - |
| REQ-20 | Vercel deployment, all env vars, GitHub webhook, E2E verified | ⬜ PENDING | 09-deployment-polish | 09-01/02 | - |

## Traceability Matrix

| Requirement | Implementation Files | Tests | Documentation |
|-------------|---------------------|-------|---------------|
| REQ-01 | package.json, tsconfig.json, next.config.js, tailwind.config.ts, components.json, src/app/*, src/components/ui/*, src/lib/utils.ts | Build + TypeScript | 01-foundation-01-SUMMARY.md |
| REQ-02 | (pending) | (pending) | (pending) |
| REQ-03 | (pending) | (pending) | (pending) |
| REQ-04 | src/app/auth/signin/page.tsx, src/components/auth/sign-in-button.tsx, src/components/auth/user-menu.tsx, src/app/auth/callback/page.tsx, src/lib/auth-options.ts, src/middleware.ts | Build + TypeScript | 02-auth-profiles-01-SUMMARY.md |
| REQ-05 | (pending) | (pending) | (pending) |
| REQ-06 | (pending) | (pending) | (pending) |
| REQ-07 | (pending) | (pending) | (pending) |
| REQ-08 | (pending) | (pending) | (pending) |
| REQ-09 | (pending) | (pending) | (pending) |
| REQ-10 | (pending) | (pending) | (pending) |
| REQ-11 | (pending) | (pending) | (pending) |
| REQ-12 | (pending) | (pending) | (pending) |
| REQ-13 | (pending) | (pending) | (pending) |
| REQ-14 | (pending) | (pending) | (pending) |
| REQ-15 | (pending) | (pending) | (pending) |
| REQ-16 | (pending) | (pending) | (pending) |
| REQ-17 | (pending) | (pending) | (pending) |
| REQ-18 | (pending) | (pending) | (pending) |
| REQ-19 | (pending) | (pending) | (pending) |
| REQ-20 | (pending) | (pending) | (pending) |

## Completion Summary

- **Total Requirements:** 20
- **Completed:** 2 (10%)
- **In Progress:** 0
- **Pending:** 18