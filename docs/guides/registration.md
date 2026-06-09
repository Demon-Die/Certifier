# Registration Guide: How to Join the Badge Program

How contributors create their profile and start earning badges by
signing in with GitHub.

---

## What Happens When You Sign In

The badge program uses **GitHub OAuth** to identify you. When you sign in:

1. GitHub authorizes the app to see your public profile (username, avatar)
2. A contributor profile is **automatically created** in the database
3. Your **GitHub username** becomes your identifier in the system
4. You land on your dashboard showing points and badges

You don't need to fill out a form, create a password, or wait for approval.

## Step-by-Step

### 1. Visit the App

Go to **[https://certifier-demondie.vercel.app](https://certifier-demondie.vercel.app)**

### 2. Click "Sign in with GitHub"

You'll see this on the homepage or at `/auth/signin`.

> You can also navigate directly to `/auth/signin` if you're already
> browsing the app.

### 3. Authorize the Application

GitHub will ask you to authorize the OAuth app. It requests read-only
access to your public profile — no private repos, no write access.

Click **Authorize**.

### 4. You're In

You're redirected to your dashboard at `/dashboard` where you'll see:

- **Stats cards** — total points, active families, badges claimed
- **Family Progress** — per-category points with progress bars toward tiers
- **Claimable Badges** — badges you've unlocked and can claim
- **Claimed Badges** — badges you've already claimed
- **Contributions** — recent PRs and their point awards

## What Gets Created

When you sign in for the first time, the system creates a record in the
`profiles` table with:

| Field             | Source                        |
| ----------------- | ----------------------------- |
| `id`              | Your GitHub user ID (numeric) |
| `github_username` | Your GitHub username          |
| `display_name`    | Your GitHub display name      |
| `avatar_url`      | Your GitHub avatar            |
| `created_at`      | Timestamp of first sign-in    |

This same profile is what the webhook looks up when it awards points —
it matches by `github_username` from the PR author's login.

> **Important:** Your GitHub username must match the PR author's login
> for points to be awarded correctly. If you change your GitHub username,
> points from future PRs will still work, but past PRs still reference
> the old username.

## After Sign-In

Once signed in, you can:

- **Merge PRs with labels** to earn points (see [maintainer-labels.md](./maintainer-labels.md))
- **View progress** on your dashboard at `/dashboard`
- **Claim badges** once you hit a tier threshold (see [claiming-badges.md](./claiming-badges.md))
- **View leaderboard** at `/leaderboard` to see top contributors
- **Browse badges** at `/badges` to see all available credentials

## Troubleshooting

### "I signed in but see a blank dashboard"

Refresh the page. If it persists, check that your profile was created:

1. Try visiting `/dashboard` directly
2. If you still see a blank state, it may be a first-load issue — signing
   out and signing in again usually resolves it

### "I signed in but nothing shows up on the leaderboard"

The leaderboard only shows contributors who have earned at least one
point. You'll appear after your first labeled PR is merged.

### "I got a 500 error when signing in"

This is usually a transient issue. Try again. If it persists, let a
maintainer know — they can check the auth callback logs.

### "Can I have multiple accounts?"

No. Each GitHub account creates one profile. Use the same GitHub account
you contribute with.

---

**Need help?** Open an issue in the repository or ask a maintainer.
