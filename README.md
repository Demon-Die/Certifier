# DemonDie · Contributor Badge Program

> Automatically award badges to contributors when PRs merge — turn contributions
> into verifiable credentials. Built for open-source communities that want to
> recognize their contributors meaningfully.

[![Deployed on Vercel](https://img.shields.io/badge/deployed-vercel-000?logo=vercel)](https://certifier-demondie.vercel.app/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Live Demo

**→ https://certifier-demondie.vercel.app/**

Sign in with GitHub to see your dashboard, track points, and claim badges.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Points & Tiers](#points--tiers)
- [Roles & Permissions](#roles--permissions)
- [Architecture](#architecture)
- [API Overview](#api-overview)
- [Documentation](#documentation)
- [License](#license)

---

## How It Works

1. **A contributor merges a PR** in a tracked GitHub repository.
2. **A webhook fires** — the app awards points based on the PR's label
   (e.g., `frontend:imp` → +1 Frontend point).
3. **Points accumulate** — reach a threshold and a badge becomes available.
4. **The contributor claims the badge** from their dashboard — issued as a
   verifiable digital credential via [certifier.io](https://certifier.io).
5. **The credential is shareable** — on LinkedIn, GitHub, or anywhere
   credentials are accepted.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **Auth** | NextAuth.js (v4) with GitHub OAuth |
| **Database** | Supabase (PostgreSQL + RLS + Realtime) |
| **UI** | Tailwind CSS + shadcn/ui + @base-ui/react |
| **Badging** | certifier.io REST API (digital credentials) |
| **CI/CD** | GitHub Actions + Vercel |

## Setup

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [GitHub OAuth App](https://github.com/settings/developers)
- (Optional) A [certifier.io](https://certifier.io) account for digital
  credential issuance

### 1. Clone and install

```bash
git clone https://github.com/DemonDie/certifier
cd certifier
npm ci
```

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | NextAuth encryption key (`openssl rand -base64 32`) |
| `AUTH_GITHUB_ID` | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin operations) |

Optional variables:

| Variable | Description |
|----------|-------------|
| `CERTIFIER_API_KEY` | Certifier API access token |
| `CERTIFIER_TEMPLATES` | JSON mapping of `family:tier` → group IDs |

### 3. GitHub OAuth App

Create a GitHub OAuth App at **Settings → Developer Settings → OAuth Apps**:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback`
- For production, replace `localhost` with your deployed URL

### 4. Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations in order:

   ```bash
   supabase migration up
   ```

   Or apply manually via SQL editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_realtime.sql`
   - `supabase/migrations/004_helper_functions.sql`
   - `supabase/migrations/005_seed_special_badges.sql`

3. Enable Realtime on `profiles` and `badge_claims` tables

### 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

### 6. Admin setup

1. Sign in with your GitHub account
2. Set your role to `admin` in Supabase:

   ```sql
   UPDATE profiles SET role = 'admin' WHERE github_username = 'your-username';
   ```

3. Visit `/admin` to configure:
   - GitHub org / username
   - Tracked repos (`owner/repo` format)
   - Webhook secret

### 7. GitHub webhook

1. Go to your GitHub repo → **Settings → Webhooks → Add webhook**
2. Payload URL: `https://your-app.vercel.app/api/webhooks/github`
3. Content type: `application/json`
4. Secret: The webhook secret you configured in admin settings
5. Events: **Pull requests** (select)
6. Add labels like `frontend:imp` to merged PRs to award points

### 8. Certifier.io (optional)

1. Create an account at [certifier.io](https://certifier.io)
2. Create badge templates (5 families × 4 tiers = 20 templates)
3. Create an API access token: **Settings → Developers → Access Tokens**
4. Map template group IDs in `CERTIFIER_TEMPLATES`:

   ```json
   {
     "frontend:imp": "grp_xxx",
     "frontend:fiend": "grp_yyy",
     ...
   }
   ```

## Points & Tiers

Badges are earned by accumulating points within each family. Points come from
merged PRs — the label determines the family and tier. ONLY LABELS OF PR WILL BE COUNTED!

### Thresholds

| Tier | Per PR | Badge threshold |
|------|:------:|:---------------:|
| Imp | 1 point | 5 |
| Fiend | 3 points | 15 |
| Overlord | 9 points | 45 |
| Demon King | 27 points | 135 |

### Families

| Family | Icon | Focus Area |
|--------|:----:|------------|
| **Frontend** | 🎨 | UI code, components, accessibility |
| **Backend** | ⚙️ | Server logic, APIs, databases |
| **Documentation** | 📚 | Docs, tutorials, translations |
| **Ideas** | 💡 | Feature proposals, UX research |
| **Community** | 🤝 | Support, reviews, CI/CD |

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Contributor** | View dashboard, claim badges, view contributions |
| **Maintainer** | All contributor + nominate/vote for special badges, view admin settings |
| **Admin** | All maintainer + edit admin settings, manage users, full access |

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub     │────▶│  Webhook     │────▶│  Supabase    │
│  (PR merge)  │     │  /api/...    │     │  (database)  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                    ┌──────────────────────────────┘
                    ▼
          ┌──────────────────┐     ┌──────────────┐
          │  Next.js App     │◀───▶│  certifier.io│
          │  (dashboard)     │     │  (badges)    │
          └──────────────────┘     └──────────────┘
```

### Key design decisions

- **Auth is handled by NextAuth.js**, not Supabase Auth — the session's `user.id`
  is mapped to the `profiles` table (text ID, not UUID). All browser-side data
  queries use API routes backed by the Supabase admin client (service role key)
  to bypass RLS, since `auth.uid()` returns null for non-Supabase sessions.
- **RLS policies exist for direct database access** but cast `auth.uid()` to
  `text` for compatibility with the profiles table's text ID column.
- **Badge claims use a unique constraint** on `(user_id, family, tier)` — each
  contributor can claim each badge tier only once.

## API Overview

### Internal API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/profile` | GET | Current user's profile and points |
| `/api/badges/available` | GET | Badges available to claim |
| `/api/badges/claimed` | GET | Badges already claimed |
| `/api/badges/claim` | POST | Claim an available badge |
| `/api/webhooks/github` | POST | GitHub PR merge webhook |
| `/api/admin/settings` | GET/PUT | Admin configuration |
| `/api/special-badges/nominate` | POST | Nominate for a special badge |
| `/api/special-badges/vote` | POST | Vote on a special nomination |

### External Integrations

| Service | Integration |
|---------|-------------|
| **GitHub** | OAuth login + webhook (PR merge events) |
| **Supabase** | Database, RLS, Realtime subscriptions |
| **certifier.io** | Digital credential creation and issuance |

## Documentation

| Document | Description |
|----------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute, PR workflow, label convention |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community standards and enforcement |
| [Guides: Claiming Badges](docs/guides/claiming-badges.md) | Step-by-step for contributors to claim their earned badges |
| [Guides: Maintainer Labels](docs/guides/maintainer-labels.md) | Label format, setup, and point award system for maintainers |
| [LICENSE](LICENSE) | MIT license |

## License

MIT © DemonDie
