# Maintainer Guide: PR Labels & Point Awards

How to configure and use GitHub labels so the badge program automatically
awards points when pull requests are merged.

---

## How Automated Point Awards Work

```
PR merged with label "frontend:imp"
        │
        ▼
GitHub sends webhook to /api/github/webhook
        │
        ▼
App parses the label, identifies family + tier
        │
        ▼
Creates a contribution record + awards points
        │
        ▼
If points cross a threshold → a badge_claim row
  is created with status "available"
```

The system depends on **PR labels** to determine what to award. Without
the right labels, no points are given.

## Label Format

Labels must follow this exact format:

```
family:tier
```

For example:

| Label | Points | Family |
|-------|:------:|--------|
| `frontend:imp` | 1 | Frontend |
| `backend:fiend` | 3 | Backend |
| `docs:overlord` | 9 | Documentation |
| `ideas:demon king` | 27 | Ideas |

### Valid Families

| Family | Label prefix | What it covers |
|--------|:-----------:|----------------|
| Frontend | `frontend` | UI code, components, CSS, accessibility |
| Backend | `backend` | Server logic, APIs, databases |
| Documentation | `docs` | Docs, tutorials, translations, README |
| Ideas | `ideas` | Feature proposals, UX research, design |
| Community | `community` | Issue triage, reviews, CI/CD, support |

### Valid Tiers

| Tier | Label suffix | Points per PR | Badge threshold |
|------|:----------:|:------------:|:---------------:|
| Imp | `imp` | 1 | 5 |
| Fiend | `fiend` | 3 | 15 |
| Overlord | `overlord` | 9 | 45 |
| Demon King | `demon king` | 27 | 135 |

## Setting Up Labels

### 1. Create the labels in your repository

Go to your GitHub repo → **Issues** → **Labels** → **New label**.

Create all 20 label combinations:

```
frontend:imp
frontend:fiend
frontend:overlord
frontend:demon king
backend:imp
backend:fiend
backend:overlord
backend:demon king
docs:imp
docs:fiend
docs:overlord
docs:demon king
ideas:imp
ideas:fiend
ideas:overlord
ideas:demon king
community:imp
community:fiend
community:overlord
community:demon king
```

> 💡 **Tip:** Create labels with a consistent color to make them easy
> to spot — for example, use green for frontend, blue for backend, etc.

### 2. Apply labels to PRs

When reviewing a PR, add the appropriate label based on the contribution.

Examples:

| PR Description | Appropriate Label |
|----------------|-------------------|
| Adds a new button component | `frontend:imp` |
| Fixes responsive layout bug | `frontend:imp` |
| Builds a new API endpoint | `backend:fiend` |
| Writes migration scripts | `backend:imp` |
| Updates README with setup guide | `docs:imp` |
| Writes API documentation | `docs:fiend` |
| Proposes a new feature spec | `ideas:imp` |
| Reviews 10+ PRs thoroughly | `community:fiend` |
| Sets up CI/CD pipeline | `community:overlord` |

### 3. Merge the PR

Once the label is applied, merge the PR. GitHub sends a webhook to
the application, and points are awarded automatically.

## How Points Accumulate

Points are additive within each family. When a contributor's total crosses
a threshold, a badge row is created automatically.

**Example progression for Frontend:**

| Action | Points | Total | Badge unlocked |
|--------|:------:|:-----:|:--------------:|
| Merge PR with `frontend:imp` | +1 | 1 | — |
| Merge PR with `frontend:imp` | +1 | 2 | — |
| Merge PR with `frontend:imp` | +1 | 3 | — |
| Merge PR with `frontend:fiend` | +3 | 6 | ✅ Imp |
| Merge PR with `frontend:fiend` | +3 | 9 | — |
| ... | | | |
| Merge PR with `frontend:overlord` | +9 | 15 | ✅ Fiend |

## Important Notes

- **Labels matter before merge.** Add the label before merging the PR
  — the webhook processes the PR's labels at merge time.
- **One label per PR.** If multiple matching labels exist, the system
  uses the first one it finds.
- **Points are one-time.** If you change a label after merge, points
  are not re-awarded.
- **No retroactive awards.** Merging without a label means no points
  for that PR. You can manually insert contributions via the database
  if needed.

## Manual Award (Database)

If a PR was merged without a label, or you need to correct points,
you can insert a contribution directly:

```sql
INSERT INTO contributions (user_id, repo, pr_number, pr_title, pr_url,
                           merged_at, family, tier, points_awarded, label_used)
VALUES (
  '216678101',
  'owner/repo',
  42,
  'PR title',
  'https://github.com/owner/repo/pull/42',
  '2026-06-01T00:00:00Z',
  'frontend',
  'imp',
  1,
  'frontend:imp'
);
```

> ⚠️ This requires database access. Prefer labeling PRs correctly
> at merge time instead.

## Verifying Awards

After merge:
1. Ask the contributor to check their dashboard at `/dashboard`
2. The contribution appears in their **Contributions** table
3. Points update on their **Family Progress** cards
4. Badges appear in **Claimable Badges** when thresholds are met

---

**Questions?** Reach out to the project admin or open an issue.
