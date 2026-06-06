# Contributor Badge Program

Automatically awards points when PRs are merged in tracked GitHub repos based on labels, with badge claiming via [certifier.io](https://certifier.io).

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Auth:** NextAuth.js (v4) with GitHub OAuth
- **Database:** Supabase (PostgreSQL + RLS + Realtime)
- **UI:** Tailwind CSS + shadcn/ui (dark theme, @base-ui/react)
- **Badges:** certifier.io REST API
- **CI/CD:** GitHub Actions + Vercel

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd contributor-badge-program
npm ci
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `AUTH_SECRET` | Yes | NextAuth encryption key (`openssl rand -base64 32`) |
| `AUTH_GITHUB_ID` | Yes | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | Yes | GitHub OAuth App client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `CERTIFIER_API_KEY` | No | Certifier API access token |
| `CERTIFIER_TEMPLATES` | No | JSON mapping of `family:tier` → group IDs |

### 3. GitHub OAuth App

Create a GitHub OAuth App at **Settings → Developer Settings → OAuth Apps**:
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback`

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
2. An admin must manually set your role to `admin` in Supabase:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE github_username = 'your-username';
   ```
3. Visit `/admin` to configure:
   - GitHub org/username
   - Tracked repos (owner/repo format)
   - Webhook secret

### 7. GitHub webhook

1. Go to your GitHub org/repo **Settings → Webhooks → Add webhook**
2. Payload URL: `https://your-app.vercel.app/api/webhooks/github`
3. Content type: `application/json`
4. Secret: The webhook secret you set in admin settings
5. Events: **Pull requests** (select)
6. Add label `family:tier` (e.g., `frontend:imp`) to merged PRs to award points

### 8. Certifier.io (optional)

1. Create an account at [certifier.io](https://certifier.io)
2. Create 20 badge templates (5 families × 4 tiers) in your Certifier dashboard
3. Create an API access token: **Settings → Developers → Access Tokens**
4. Map each template's group ID in `CERTIFIER_TEMPLATES`:
   ```json
   {
     "frontend:imp": "grp_xxx",
     "frontend:fiend": "grp_yyy",
     ...
   }
   ```

## Points & Tiers

| Tier | Points per PR | Badge threshold |
|------|:------------:|:---------------:|
| Imp | 1 | 5 |
| Fiend | 3 | 15 |
| Overlord | 9 | 45 |
| Demon King | 27 | 135 |

### Families

- 🎨 **Frontend** — UI code, components, accessibility
- ⚙️ **Backend** — Server logic, APIs, databases
- 📚 **Documentation** — Docs, tutorials, translations
- 💡 **Ideas** — Feature proposals, UX research
- 🤝 **Community** — Support, reviews, CI/CD

## Roles

| Role | Permissions |
|------|------------|
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
                    ┌─────────────────────────────┘
                    ▼
          ┌──────────────────┐     ┌──────────────┐
          │  Next.js App     │◀───▶│  certifier.io│
          │  (dashboard)     │     │  (badges)    │
          └──────────────────┘     └──────────────┘
```

## License

MIT
