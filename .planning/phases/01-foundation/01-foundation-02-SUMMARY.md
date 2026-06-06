---
phase: 01-foundation
plan: 02
subsystem: supabase
tags: [database, migrations, rls, realtime, supabase, nextjs]
dependency_graph:
  requires: [01-foundation-01]
  provides: [database-schema, rls-policies, realtime-config, supabase-clients]
  affects: [auth, webhooks, dashboard, badges]
tech_stack:
  added:
    - "@supabase/supabase-js@2.107.0"
    - "@supabase/ssr@0.10.3"
  patterns:
    - "Supabase SSR client pattern for Next.js App Router"
    - "Row Level Security with helper functions"
    - "Realtime publication for live updates"
key_files:
  created:
    - "supabase/config.toml"
    - "supabase/migrations/001_initial_schema.sql"
    - "supabase/migrations/002_rls_policies.sql"
    - "supabase/migrations/003_realtime.sql"
    - "src/lib/supabase/server.ts"
    - "src/lib/supabase/client.ts"
    - "src/lib/supabase/middleware.ts"
    - "src/lib/supabase/database.types.ts"
    - ".env.example"
  modified:
    - "package.json"
decisions:
  - "Used @supabase/ssr for server/client/middleware clients (not legacy @supabase/auth-helpers)"
  - "Service role key used only in server.ts for admin operations"
  - "RLS helper functions (is_maintainer_or_admin, is_admin) use SECURITY DEFINER for performance"
  - "Replica identity FULL on realtime tables for complete UPDATE/DELETE events"
  - "Database types generated locally as placeholder until Supabase project linked"
metrics:
  duration_seconds: 3600
  completed_date: "2026-06-06"
---

# Phase 01 Plan 02: Supabase Setup with Migrations, RLS, Realtime Summary

**One-liner:** Complete Supabase schema with 6 tables, 18 RLS policies, Realtime on 3 tables, and typed SSR clients for Next.js App Router.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Supabase project and generate TypeScript types | pending | supabase/config.toml, package.json, .env.example, src/lib/supabase/server.ts, src/lib/supabase/client.ts, src/lib/supabase/middleware.ts, src/lib/supabase/database.types.ts |
| 2 | Write complete database schema migration (001_initial_schema.sql) | pending | supabase/migrations/001_initial_schema.sql |
| 3 | Write RLS policies and Realtime migration | pending | supabase/migrations/002_rls_policies.sql, supabase/migrations/003_realtime.sql |

## Verification Results

- ✅ supabase/ directory with config.toml exists
- ✅ src/lib/supabase/ directory with server.ts, client.ts, middleware.ts, database.types.ts
- ✅ 001_initial_schema.sql: 136 lines, 6 CREATE TABLE statements (profiles, contributions, badge_claims, maintainer_settings, special_badges, special_nominations)
- ✅ 002_rls_policies.sql: 18 CREATE POLICY statements covering all tables
- ✅ 003_realtime.sql: 3 ALTER PUBLICATION statements (profiles, contributions, badge_claims)
- ✅ All exports verified: createServerClient, createBrowserClient, updateSession
- ✅ .env.example documents 4 required Supabase env vars
- ✅ TypeScript compiles without errors
- ✅ ESLint passes with no warnings

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed naming conflict in Supabase client imports**
- **Found during:** TypeScript compilation check (Task 1)
- **Issue:** Local function names `createServerClient` and `createBrowserClient` conflicted with imported functions from `@supabase/ssr`
- **Fix:** Renamed imports to `createSupabaseServerClient` and `createSupabaseBrowserClient` using `as` alias
- **Files modified:** src/lib/supabase/server.ts, src/lib/supabase/client.ts
- **Commit:** pending

**2. [Rule 1 - Bug] Fixed Prettier formatting issues**
- **Found during:** ESLint check (Task 1)
- **Issue:** Import statement formatting and Json type definition formatting
- **Fix:** Applied Prettier-compatible formatting (multi-line imports, single-line union type)
- **Files modified:** src/lib/supabase/server.ts, src/lib/supabase/database.types.ts
- **Commit:** pending

## Auth Gates

None encountered. Supabase project creation and linking are manual steps documented in `user_setup` section of the plan. The local config, migrations, and client code are complete and ready for `npx supabase db push` once the user creates and links their project.

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| src/lib/supabase/database.types.ts | 1-310 | Placeholder types | Generated locally; will be replaced by `npx supabase gen types typescript --project-id <ref>` after project linking |

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: rls_bypass | src/lib/supabase/server.ts | Service role key bypasses all RLS - must be kept secret, only used server-side |
| threat_flag: anon_key_exposure | src/lib/supabase/client.ts | Anon key exposed to browser - mitigated by RLS policies on all tables |
| threat_flag: realtime_data_leak | supabase/migrations/003_realtime.sql | Realtime publishes all columns - ensure no sensitive data in published tables |

## Next Steps

1. User creates Supabase project at https://supabase.com/dashboard
2. User runs `npx supabase login` and `npx supabase link --project-ref <ref>`
3. User runs `npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts` to replace placeholder types
4. User runs `npx supabase db push` to apply migrations
5. User enables Realtime for profiles, contributions, badge_claims in Supabase Dashboard → Realtime → Replication
6. Configure all env vars from .env.example in Vercel/local environment

## Self-Check

- [x] All created files exist
- [x] All migration files have correct content (6 tables, 18 policies, 3 realtime tables)
- [x] Client exports match plan requirements
- [x] TypeScript compiles without errors
- [x] ESLint passes
- [x] .env.example has all 4 Supabase env vars

## Files Summary

**Created (10 files):**
- supabase/config.toml (15484 bytes)
- supabase/migrations/001_initial_schema.sql (6198 bytes, 136 lines)
- supabase/migrations/002_rls_policies.sql (7820 bytes)
- supabase/migrations/003_realtime.sql (716 bytes)
- src/lib/supabase/server.ts (1221 bytes)
- src/lib/supabase/client.ts (320 bytes)
- src/lib/supabase/middleware.ts (1545 bytes)
- src/lib/supabase/database.types.ts (9256 bytes)
- .env.example (764 bytes)
- package.json (modified, added @supabase/supabase-js, @supabase/ssr)
