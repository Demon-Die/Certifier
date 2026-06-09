# How to Claim Badges

A guide for contributors to understand the badge system and claim their
earned credentials.

---

## Prerequisites

Before you can claim badges, you need a contributor profile. If you
haven't already:

1. Go to [certifier-demondie.vercel.app](https://certifier-demondie.vercel.app)
2. Click **Sign in with GitHub**
3. Your profile is created automatically

See the [Registration Guide](./registration.md) for detailed steps.

## Overview

When you contribute to a tracked repository, your PR merges earn points
across different categories (families). Once you accumulate enough points
in a family, a badge becomes available to claim.

## How Points Work

| Action                                   |    Points    |
| ---------------------------------------- | :----------: |
| Merge a PR labeled `frontend:imp`        | +1 Frontend  |
| Merge a PR labeled `frontend:fiend`      | +3 Frontend  |
| Merge a PR labeled `frontend:overlord`   | +9 Frontend  |
| Merge a PR labeled `frontend:demon king` | +27 Frontend |

(The same pattern applies to all five families: frontend, backend, docs,
ideas, and community.)

### Badge Thresholds

| Tier       | Points Needed |
| ---------- | :-----------: |
| Imp        |       5       |
| Fiend      |      15       |
| Overlord   |      45       |
| Demon King |      135      |

So if you earn 5 Frontend points, you unlock the **Frontend - Imp** badge.
At 15 points, **Frontend - Fiend** unlocks, and so on.

## Checking Your Progress

1. Go to the [dashboard](https://certifier-demondie.vercel.app/dashboard)
2. Sign in with your GitHub account
3. You'll see:
   - **Total Points** and **Active Families** (stats cards)
   - **Family Progress** cards showing points per category with progress bars
   - **Claimable Badges** section listing badges you've unlocked

## Claiming a Badge

1. On the dashboard, find the **Claimable Badges** section
2. Click the **Claim** button next to the badge you want
3. The badge will move from "Claimable" to "Claimed Badges"
4. A **View credential** link will appear — click it to see your
   digital credential on certifier.io

## After Claiming

- The badge appears in your **Claimed Badges** section with the date
  you claimed it
- Your digital credential is viewable and shareable via the
  certifier.io link
- You can share the credential link on LinkedIn, GitHub, or anywhere
  you want to showcase your contribution

## Troubleshooting

### "No badges available to claim"

You haven't accumulated enough points yet in any family. Keep contributing!
Check the Family Progress cards to see how close you are.

### Claim button is disabled

You may have already claimed that badge tier. Each tier (Imp, Fiend, etc.)
can only be claimed once per family.

### "View credential" shows an error

If certifier.io templates are not configured, the badge is still recorded
in the system — it just won't have a digital credential page yet.
The claim still counts and the badge shows on your dashboard.

### Points aren't updating

Points are awarded when a PR with a valid label is merged. Ensure:

- The PR has a label in the format `family:tier` (e.g., `frontend:imp`)
- The webhook is configured and working
- You've refreshed the dashboard

---

**Need help?** Open an issue in the repository or ask a maintainer.

---

## Related Documents

- [Registration Guide](./registration.md) — How to sign up and create your profile
- [Maintainer Labels Guide](./maintainer-labels.md) — How points are earned through PR labels
- [README.md](../../README.md) — Full project overview and architecture
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Contribution workflow and PR guidelines
