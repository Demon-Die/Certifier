# Contributing to the Contributor Badge Program

Thank you for your interest in contributing! This project rewards contributors
with digital badges — so your contributions here directly help us dogfood the
system. This guide walks you through the contribution workflow.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We're Looking For](#what-were-looking-for)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Label Convention](#label-convention)
- [Review Process](#review-process)

## Code of Conduct

All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
Be respectful, constructive, and collaborative.

## What We're Looking For

We welcome contributions across all five family categories:

| Category | Examples |
|----------|----------|
| **Frontend** | UI components, accessibility fixes, responsive design, animations |
| **Backend** | API endpoints, database migrations, auth logic, webhook handlers |
| **Documentation** | README updates, API docs, tutorials, code comments, translations |
| **Ideas** | Feature proposals, user research, design exploration, UX improvements |
| **Community** | Issue triage, code reviews, CI/CD improvements, helping other contributors |

Not sure where to start? Look for issues labeled `good first issue` or
`help wanted` in the repository.

## Getting Started

### 1. Fork the repository

```bash
git clone https://github.com/YOUR_USERNAME/certifier
cd certifier
```

### 2. Set up your development environment

Follow the [local development setup](README.md#setup) in the README.

### 3. Create a branch

```bash
git checkout -b feat/your-feature-name
```

Use a descriptive branch name:

- `feat/` — new features
- `fix/` — bug fixes
- `docs/` — documentation changes
- `refactor/` — code improvements without behavior changes
- `chore/` — tooling, CI, dependencies

### 4. Make your changes

- Write clean, TypeScript-first code
- Follow existing patterns (check similar files for conventions)
- Add types — avoid `any` unless absolutely necessary
- Update or add tests where applicable

### 5. Commit your changes

We use conventional commit messages:

```
type(scope): description

feat(frontend): add badge progress animation
fix(auth): handle expired JWT session gracefully
docs(api): document webhook payload format
```

Valid types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `style`

### 6. Push and open a pull request

```bash
git push origin feat/your-feature-name
```

Then open a pull request on GitHub against the `main` branch.

## Pull Request Guidelines

A good pull request:

1. **Has a clear title** — `feat(frontend): add badge progress animation`
2. **Describes the change** — what, why, and how tested
3. **Keeps scope small** — one feature or fix per PR
4. **Passes CI** — lint and build must succeed
5. **Includes screenshots** for UI changes

### PR Template

```markdown
## Summary
Brief description of the change.

## Type
- [ ] feat
- [ ] fix
- [ ] docs
- [ ] refactor
- [ ] chore

## Testing
- [ ] Lint passes (`npm run lint`)
- [ ] Build passes (`npm run build`)
- [ ] Tested manually in browser

## Screenshots (if applicable)
...
```

## Label Convention

When your PR is merged, a maintainer will add a label to award points:

```
family:tier
```

For example: `frontend:imp` awards 1 point to your Frontend score.
See [Points & Tiers](README.md#points--tiers) for the full breakdown.

> **Note:** Labels are applied by project maintainers after review.
> If your PR isn't labeled within a few days, feel free to ask.

## Review Process

1. **Automated checks** — CI runs lint + build on every PR
2. **Code review** — at least one maintainer will review your changes
3. **Feedback** — you may be asked to make changes
4. **Approval** — once approved, a maintainer will merge your PR

After merge, your contributions page will update automatically, and
you'll earn badges as you accumulate points.

---

Questions? Open a [discussion](https://github.com/YOUR_USERNAME/certifier/discussions)
or reach out to the maintainers.
