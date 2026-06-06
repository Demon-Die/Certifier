# Planning State

## Current Position

- **All phases:** COMPLETE
- **Status:** SHIPPED

## Progress Bar

```
Phase 01: Foundation              ██████████ 100% (3/3 plans)
Phase 02: Authentication & Auth   ██████████ 100% (2/2 plans)
Phase 03: Admin Configuration     ██████████ 100% (1/1 plans)
Phase 04: Webhook & Points        ██████████ 100% (2/2 plans)
Phase 05: Contributor Dashboard   ██████████ 100% (2/2 plans)
Phase 06: Badge System            ██████████ 100% (2/2 plans)
Phase 07: Contributions History   ██████████ 100% (1/1 plans)
Phase 08: Special Badges          ██████████ 100% (1/1 plans)
Phase 09: Deployment & Polish     ██████████ 100% (2/2 plans)

Overall: ████████████████████ 100% (16/16 plans)
```

## What Was Built

### Routes
| Route | Description |
|-------|------------|
| `/` | Landing page |
| `/auth/signin` | GitHub OAuth sign-in |
| `/auth/callback` | OAuth callback handler |
| `/dashboard` | Contributor dashboard with family cards, progress bars, claimable badges, claimed badges |
| `/admin` | Admin settings (org name, tracked repos, webhook secret) |
| `/contributions` | Paginated/filtered contribution history |
| `/special-badges` | Special badges nomination & voting |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth GitHub OAuth |
| `/api/webhooks/github` | POST | GitHub webhook handler (signature verification, points award) |
| `/api/admin/settings` | GET/PUT | Admin settings CRUD |
| `/api/badges/claim` | POST/GET | Badge claiming via certifier.io |
| `/api/special-badges/nominate` | POST | Special badge nomination |
| `/api/special-badges/vote` | POST | Special badge voting (3 votes = award) |

### Infrastructure
- 6 Supabase tables (profiles, contributions, badge_claims, maintainer_settings, special_badges, special_nominations)
- RLS policies for role-based access
- Realtime enabled for profiles + badge_claims
- 5 SQL migrations including seed data
- CI pipeline (GitHub Actions)
- Vercel deployment config

## Key Decisions

| Date | Decision | Context |
|------|----------|---------|
| 2026-06-06 | shadcn/ui base-nova style with @base-ui/react | Newest shadcn/ui v4+ uses @base-ui/react primitives |
| 2026-06-06 | Dark mode default via next-themes | No flash on load, disableTransitionOnChange |
| 2026-06-06 | NextAuth v4 (stable) over v5 (beta) | Production reliability |
| 2026-06-06 | JWT session strategy with GitHub access token | Store access token for future API calls |
| 2026-06-06 | Split RBAC into edge-compatible and server-only | Avoid Edge Runtime issues in middleware |

## Upcoming / To Do

- Apply SQL migrations to Supabase project (especially `004_helper_functions.sql` for increment_points RPC)
- Create 20 badge templates in certifier.io dashboard
- Set `CERTIFIER_TEMPLATES` env var with template group IDs
- Configure GitHub webhook pointing to deployed app
- E2E verification after deployment
