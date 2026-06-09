# Guide: Ideas & Feature Proposals

How to submit structured ideas to earn points under the Community family.

> **New here?** If you haven't signed up for the badge program yet, start
> with the [Registration Guide](./registration.md).

---

## Overview

Ideas and feature proposals are now tracked under the **Community family**.
When you submit a well-structured idea via a pull request, a maintainer
reviews it and applies a `community:*` label based on the idea's scope.
Once merged, you earn points toward the Community family.

This means your contributions to shaping the project's direction — not
just code — are formally recognized and rewarded.

---

## How It Works

```
You draft an idea as a markdown file
        │
        ▼
You open a PR adding the file to the repository
        │
        ▼
A maintainer reviews the proposal
        │
        ▼
Maintainer adds community:imp, community:fiend, etc.
        │
        ▼
PR is merged → points awarded to Community family
```

---

## Step-by-Step

### 1. Draft Your Idea

Create a structured markdown file using the
[Idea Template](./idea-template.md). Your proposal should cover:

- **Problem** — What gap or pain point does this address?
- **Proposed Solution** — Describe your idea in detail
- **Expected Impact** — How will this benefit the project or community?
- **Dependencies** — Any prerequisites or related work

Name the file descriptively, for example:
`ideas/add-dark-mode-support.md` or `ideas/performance-benchmark-suite.md`.

### 2. Open a Pull Request

1. Create a new branch for your idea
2. Add your markdown file to the repository
3. Draft a pull request with a clear title and summary of your proposal
4. Submit the PR

### 3. Maintainer Review

A maintainer will review your proposal and:

- Provide feedback or ask clarifying questions
- Assess the scope and potential impact
- Add a `community:*` label matching the idea's tier

### 4. Merge & Earn Points

Once the PR is merged, the system awards points to your **Community**
family progress. See the [Maintainer Labels Guide](./maintainer-labels.md)
for the full breakdown of label values and thresholds.

---

## Label Tiers for Ideas

Ideas are labeled with `community:*` labels:

| Label               | Points | Scope                              |
| ------------------- | :----: | ---------------------------------- |
| `community:imp`     |   1    | Small improvement, minor feature   |
| `community:fiend`   |   3    | Moderate feature, meaningful change|
| `community:overlord`|   9    | Major feature, significant impact  |
| `community:demon king` | 27  | Project-defining direction shift   |

> 💡 **Tip:** The clearer and more thorough your proposal, the easier it
> is for a maintainer to evaluate its scope — and the more likely it
> earns a higher tier.

---

## Tips for a Strong Proposal

- **Be specific.** Vague ideas are hard to evaluate. Include concrete
  examples of how the feature would work.
- **Show you've thought about trade-offs.** Acknowledge potential
  downsides or alternatives. This signals maturity.
- **Link to evidence.** If your idea is inspired by another project's
  approach, link to it. If user requests motivated this, reference them.
- **Keep it scannable.** Use headings, bullets, and short paragraphs.
  Maintainers review many proposals.

---

## What Happens After Merge

1. Points are added to your Community family total
2. You can track progress on the [dashboard](https://certifier-demondie.vercel.app/dashboard)
3. When you cross a threshold, a badge becomes available — see the
   [Claiming Badges Guide](./claiming-badges.md) to claim it

---

## Example

Here's a minimal example to illustrate the flow:

**File:** `ideas/add-keyboard-shortcuts.md`

```markdown
# Idea: Keyboard Shortcuts for Navigation

## Problem
Users navigating the dashboard with keyboard-only input currently need
to click through every section. This slows down power users.

## Proposed Solution
Add a keyboard shortcut system (Ctrl+K to open command palette,
arrow keys for navigation) using the mousetrap.js library.

## Expected Impact
- Improved accessibility for keyboard-only users
- Faster navigation for power users
- Low implementation complexity (~2 days)

## Dependencies
- mousetrap.js library (lightweight, no framework lock-in)
```

**Result:** A maintainer labels the PR `community:imp` and merges it.
You earn +1 Community point.

---

**Questions?** Open an issue in the repository or ask a maintainer.

---

## Related Documents

- [Idea Template](./idea-template.md) — Markdown template to use for proposals
- [Maintainer Labels Guide](./maintainer-labels.md) — Complete label reference and point values
- [Registration Guide](./registration.md) — How to sign up for the badge program
- [Claiming Badges Guide](./claiming-badges.md) — How to claim badges once thresholds are met
- [README.md](../../README.md) — Full project overview and architecture
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Contribution workflow and PR guidelines
