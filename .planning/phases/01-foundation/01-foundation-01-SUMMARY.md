---
phase: 01-foundation
plan: 01
subsystem: frontend-scaffold
tags: [nextjs, typescript, tailwind, shadcn-ui, dark-theme]
dependency_graph:
  requires: []
  provides: [nextjs-app, shadcn-ui-components, theme-provider, dark-mode]
  affects: [all-subsequent-phases]
tech_stack:
  added:
    - next@14.2.35
    - react@18
    - typescript@5
    - tailwindcss@3.4.1
    - shadcn/ui (base-nova style)
    - next-themes@0.3.0
    - sonner@1.x (toast)
    - lucide-react@0.x (icons)
    - @base-ui/react (headless UI primitives)
    - class-variance-authority@0.x
    - clsx@2.x
    - tailwind-merge@2.x
    - eslint-config-prettier@9.x
  patterns:
    - App Router with src/ directory
    - Path aliases (@/* -> ./src/*)
    - CSS variables for theming
    - Dark mode via class strategy
    - Server Components by default
    - Client components for interactive UI
key_files:
  created:
    - package.json
    - tsconfig.json
    - next.config.js
    - tailwind.config.ts
    - postcss.config.mjs
    - .eslintrc.json
    - .prettierrc
    - components.json
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/components/theme-provider.tsx
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - src/components/ui/progress.tsx
    - src/components/ui/label.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/separator.tsx
    - src/components/ui/scroll-area.tsx
    - src/components/ui/avatar.tsx
    - src/components/ui/dropdown-menu.tsx
    - src/components/ui/tooltip.tsx
    - src/components/ui/toast.tsx
    - src/lib/utils.ts
  modified: []
decisions:
  - Used shadcn/ui base-nova style (newest) with OKLCH colors initially, then reverted to HSL CSS variables for compatibility
  - Used sonner for toast notifications instead of shadcn/ui toast (not available in base-nova)
  - Used @base-ui/react primitives instead of Radix UI (shadcn/ui base-nova default)
  - Dark mode as default with no flash via next-themes disableTransitionOnChange
  - Inter font from Google Fonts via next/font
  - ESLint with Prettier for consistent formatting
metrics:
  duration_seconds: 1800
  completed_date: "2026-06-06"
  tasks_completed: 3
  files_created: 29
  lines_added: 10924
---

# Phase 01 Plan 01: Scaffold Next.js + shadcn/ui + Dark Theme Summary

Next.js 14 App Router project scaffolded with TypeScript, Tailwind CSS (dark theme default), and shadcn/ui component library (11 base components). ThemeProvider configured with next-themes for client-side dark mode without flash.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CSS @apply border-border compilation error**
- **Found during:** Task 1 build verification
- **Issue:** `@apply border-border` in `@layer base` failed because Tailwind hadn't generated the utility class yet
- **Fix:** Replaced with direct CSS `border-color: hsl(var(--border))` in `@layer base`
- **Files modified:** src/app/globals.css
- **Commit:** ed0bdbf

**2. [Rule 2 - Missing functionality] Added eslint-config-prettier for Prettier integration**
- **Found during:** Task 1 build verification (ESLint error: Failed to load config "prettier")
- **Issue:** .eslintrc.json extended "prettier" but eslint-config-prettier wasn't installed
- **Fix:** Installed eslint-config-prettier as devDependency
- **Files modified:** package.json
- **Commit:** ed0bdbf

**3. [Rule 1 - Bug] Fixed Prettier formatting across all generated files**
- **Found during:** Task 1 build verification (ESLint/Prettier errors on double quotes, missing semicolons)
- **Issue:** shadcn/ui generated files used double quotes; Prettier config required single quotes
- **Fix:** Ran `npx prettier --write .` to auto-format all files
- **Files modified:** All 29 created files
- **Commit:** ed0bdbf

**4. [Rule 3 - Blocking issue] shadcn/ui toast component not available in base-nova registry**
- **Found during:** Task 2 component installation
- **Issue:** `npx shadcn@latest add toast` failed - toast not in base-nova registry
- **Fix:** Installed sonner package and created custom toast.tsx wrapper
- **Files modified:** package.json, src/components/ui/toast.tsx
- **Commit:** ed0bdbf

### Architectural Decisions

**shadcn/ui base-nova style with @base-ui/react primitives**
The newest shadcn/ui (v4+) uses base-nova style with @base-ui/react instead of Radix UI. This is a forward-looking choice but meant some components (toast) weren't yet ported.

**CSS Variables in HSL format over OKLCH**
Initially shadcn init generated OKLCH colors, but reverted to HSL for broader browser compatibility and easier debugging.

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Passes |
| `npx tsc --noEmit` | ✅ Passes (no type errors) |
| `npm run lint` | ✅ Passes (after prettier fix) |
| Dark theme default | ✅ Configured via ThemeProvider |
| 11 shadcn/ui components | ✅ Installed and importable |
| Path aliases (@/*) | ✅ Working in tsconfig.json |
| next.config.js serverActions | ✅ Configured |
| GitHub avatar image domains | ✅ Configured |

## Auth Gates

None - all work completed autonomously.

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| src/app/page.tsx | 14 | "Sign in with GitHub" button | Placeholder - NextAuth implementation in Plan 01-03 |
| src/components/ui/toast.tsx | - | sonner wrapper | Minimal wrapper - full toast UI in future phases |

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: supply_chain | package.json | 396 npm packages installed - run `npm audit` regularly |
| threat_flag: google_fonts | src/app/layout.tsx | Inter font loaded from fonts.googleapis.com at build time |
| threat_flag: client_bundle | src/app/layout.tsx | ThemeProvider and TooltipProvider add client-side JS |

## Self-Check

All created files verified to exist. Commit ed0bdbf verified in git history. Build and type checks pass.