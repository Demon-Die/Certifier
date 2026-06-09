# DemonDie · Contributor Badge Program

> Automatically award badges to contributors when PRs merge — turn contributions
> into verifiable credentials. Built for open-source communities that want to
> recognize their contributors meaningfully.

[![Deployed on Vercel](https://img.shields.io/badge/deployed-vercel-000?logo=vercel)](https://certifier-demondie.vercel.app/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Live Demo

**→ [View the Live Demo](https://certifier-demondie.vercel.app/)**

Sign in with GitHub to see your dashboard, track points, and claim badges.

---

## Quick Start for Newcomers

New to the project? Get up and running in three steps:

1. **Visit the app** at [certifier-demondie.vercel.app](https://certifier-demondie.vercel.app/)
2. **Click "Sign in with GitHub"** — no forms, no passwords, just one click
3. **You're in!** Your dashboard shows your points, progress, and available badges

That's it. Your profile is created automatically, and you're ready to start earning badges as your PRs get merged.

> **Already signed in?** Head to the [dashboard](https://certifier-demondie.vercel.app/dashboard) to check your progress.
>
> 📖 **Read the guides:** [Registration Guide](docs/guides/registration.md) ·
> [Claiming Badges](docs/guides/claiming-badges.md) ·
> [Maintainer Labels](docs/guides/maintainer-labels.md) ·
> [Ideas Contributions](docs/guides/ideas-contributions.md)

---

## Table of Contents

- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
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

## Points & Tiers

Badges are earned by accumulating points within each family. Points come from
merged PRs — the label determines the family and tier.

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
| **Community** | 🤝 | Support, reviews, feature proposals, CI/CD, UX research |

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
| `/api/github/webhook` | POST | GitHub PR merge webhook |
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
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute, PR workflow, and label conventions |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community standards and enforcement |
| [Registration Guide](docs/guides/registration.md) | How contributors sign up and create a profile |
| [Claiming Badges Guide](docs/guides/claiming-badges.md) | Step-by-step for claiming your earned badges |
| [Maintainer Labels Guide](docs/guides/maintainer-labels.md) | Label format, setup, and point award system |
| [Ideas Contributions Guide](docs/guides/ideas-contributions.md) | How to submit ideas as community contributions |
| [Idea Template](docs/guides/idea-template.md) | Template for submitting a structured idea proposal |
| [LICENSE](LICENSE) | MIT license |

## License

MIT © DemonDie
