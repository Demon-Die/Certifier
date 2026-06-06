# ROADMAP

## Project: Contributor Badge Program

A full-stack web application that automatically awards points when PRs are merged in tracked GitHub repos based on labels, with badge claiming via certifier.io.

**Tech Stack:** Next.js 14 (App Router) + TypeScript, NextAuth.js (GitHub), Supabase (PostgreSQL + RLS + Realtime), GitHub Webhooks, certifier.io REST API, Tailwind CSS + shadcn/ui (dark theme)

---

## Phase 01: Foundation
**Goal:** Scaffold Next.js project with TypeScript, Tailwind, shadcn/ui; set up Supabase project with migrations and RLS; configure NextAuth with GitHub provider.
**Requirements:** REQ-01, REQ-02, REQ-03
**Plans:** 3 plans (Wave 1-3)
- [ ] 01-01-PLAN.md — Scaffold Next.js + shadcn/ui + dark theme
- [ ] 01-02-PLAN.md — Supabase schema, migrations, RLS, Realtime
- [ ] 01-03-PLAN.md — NextAuth.js GitHub provider, session, middleware

---

## Phase 02: Authentication & Profiles
**Goal:** Implement GitHub OAuth flow, auto-create user profiles on first sign-in, role-based access (contributor/maintainer/admin), protected routes.
**Requirements:** REQ-04, REQ-05
**Plans:** 2 plans (Wave 1-2)
- [ ] 02-01-PLAN.md — Sign-in page, user menu, auth UI
- [ ] 02-02-PLAN.md — Role-based access, profile management, route guards

---

## Phase 03: Admin Configuration
**Goal:** Build admin-only page to configure GitHub org name, tracked repo list, webhook secret; store in maintainer_settings table.
**Requirements:** REQ-06
**Plans:** 1 plan (Wave 1)
- [ ] 03-01-PLAN.md — Admin settings page, form, server actions

---

## Phase 04: GitHub Webhook & Points Engine
**Goal:** Create `/api/webhooks/github` endpoint with signature verification; parse `family:tier` labels from merged PRs; award points to PR author; log contributions.
**Requirements:** REQ-07, REQ-08, REQ-09, REQ-10
**Plans:** 2 plans (Wave 1-2)
- [ ] 04-01-PLAN.md — Webhook endpoint with signature verification
- [ ] 04-02-PLAN.md — Points calculation logic and unit tests

---

## Phase 05: Contributor Dashboard
**Goal:** Real-time dashboard showing 5 family cards with points, progress bars to next badge tier, claimable badges; Supabase Realtime subscriptions.
**Requirements:** REQ-11, REQ-12, REQ-13
**Plans:** 2 plans (Wave 1-2)
- [ ] 05-01-PLAN.md — Dashboard layout, family cards, progress bars
- [ ] 05-02-PLAN.md — Realtime subscriptions, claimable badges section

---

## Phase 06: Badge System & certifier.io Integration
**Goal:** "Claim Badge" flow; call certifier.io API to issue credentials; store credential IDs; display embeddable badge images; handle rate limits.
**Requirements:** REQ-14, REQ-15, REQ-16
**Plans:** 2 plans (Wave 1-2)
- [ ] 06-01-PLAN.md — certifier.io client, claim badge API, template IDs
- [ ] 06-02-PLAN.md — Badge display components, rate limit handling

---

## Phase 07: Contributions History
**Goal:** Paginated, filterable history view of all user's contributions (repo, PR title, family, tier, points, date).
**Requirements:** REQ-17
**Plans:** 1 plan (Wave 1)
- [ ] 07-01-PLAN.md — Contributions table, filters, pagination

---

## Phase 08: Special Badges
**Goal:** Maintainer nomination/voting UI for 5 fixed special badges (quota=1 each); nomination tracking, voting, awarding.
**Requirements:** REQ-18, REQ-19
**Plans:** 1 plan (Wave 1)
- [ ] 08-01-PLAN.md — Special badges page, nomination/voting UI

---

## Phase 09: Deployment & Polish
**Goal:** Deploy to Vercel; configure all env vars; register GitHub webhook; end-to-end testing; documentation.
**Requirements:** REQ-20
**Plans:** 2 plans (Wave 1-2)
- [ ] 09-01-PLAN.md — Vercel config, CI pipeline, README, env vars
- [ ] 09-02-PLAN.md — Global error pages, seed data, E2E verification

---

## Requirements Mapping

| ID | Description |
|----|-------------|
| REQ-01 | Next.js 14 + TypeScript + Tailwind + shadcn/ui scaffolded |
| REQ-02 | Supabase project with all tables, RLS policies, Realtime enabled |
| REQ-03 | NextAuth.js with GitHub provider, session stores GitHub access token |
| REQ-04 | GitHub OAuth flow works, profiles auto-created on first sign-in |
| REQ-05 | Role-based access: contributor / maintainer / admin |
| REQ-06 | Admin page: configure org name, tracked repos, webhook secret |
| REQ-07 | `/api/webhooks/github` endpoint with HMAC signature verification |
| REQ-08 | Parse `family:tier` labels from merged PRs (family ∈ {frontend,backend,docs,ideas,community}, tier ∈ {imp,fiend,overlord,demon king}) |
| REQ-09 | Award points to PR author immediately on merge (imp=1, fiend=3, overlord=9, demon king=27) |
| REQ-10 | Log each contribution with full metadata (repo, PR#, title, URL, family, tier, points, label) |
| REQ-11 | Dashboard: 5 family cards showing current points per family |
| REQ-12 | Dashboard: Progress bars to next badge tier per family (Imp=5, Fiend=15, Overlord=45, Demon King=135) |
| REQ-13 | Dashboard: Claimable badges shown with "Claim" button, real-time updates via Supabase Realtime |
| REQ-14 | "Claim Badge" calls certifier.io API, stores returned credential_id |
| REQ-15 | Embeddable badge image displayed after claim |
| REQ-16 | certifier.io rate limits handled gracefully (retry/backoff, user feedback) |
| REQ-17 | Contributions history: paginated, filterable by family/tier/repo/date |
| REQ-18 | Special badges: 5 fixed badges (quota=1), maintainer nomination + voting |
| REQ-19 | Special badge awarding: winner gets badge, certifier.io credential issued |
| REQ-20 | Vercel deployment, all env vars configured, GitHub webhook registered, E2E verified |