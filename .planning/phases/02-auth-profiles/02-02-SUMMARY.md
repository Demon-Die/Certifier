---
phase: 02-auth-profiles
plan: 02
type: execute
subsystem: auth
tags: [rbac, middleware, role-guards, admin, dashboard]
dependency_graph:
  requires: ["02-auth-profiles-01"]
  provides: ["rbac-utilities", "role-guards", "admin-page", "dashboard-page"]
  affects: ["middleware", "auth-flow"]
tech_stack:
  added: ["next-auth/middleware", "lucide-react"]
  patterns: ["server-side-role-check", "client-side-conditional-rendering", "edge-compatible-utils"]
key_files:
  created:
    - src/lib/rbac.ts
    - src/lib/auth-guards.ts
    - src/components/auth/role-guard.tsx
    - src/app/admin/page.tsx
    - src/app/dashboard/page.tsx
  modified:
    - src/middleware.ts
decisions:
  - Split RBAC utilities (edge-compatible) from server-side auth guards to avoid Edge Runtime issues
  - Middleware uses canAccess() from rbac.ts for server-side enforcement
  - Client-side RoleGuard provides defense-in-depth only
  - Admin page uses requireAdmin() guard for server-side redirect
  - Dashboard accessible to all authenticated roles with role badge display
metrics:
  duration_seconds: 180
  completed_date: "2026-06-06"
  tasks_completed: 3
  files_changed: 6
---

# Phase 02 Plan 02: Role-based Access, Profile Management, Route Guards

**One-liner:** Implemented 3-role RBAC (contributor < maintainer < admin) with server-side middleware enforcement, client-side RoleGuard components, and admin/dashboard page placeholders.

## Overview

This plan implemented comprehensive role-based access control for the Certifier application. The implementation follows a defense-in-depth approach with server-side enforcement in middleware as the primary security layer, complemented by client-side conditional rendering for UX.

## Tasks Completed

### Task 1: Create RBAC Utility Library (`src/lib/rbac.ts`)
- Defined 3-role hierarchy: `contributor` (0) < `maintainer` (1) < `admin` (2)
- Created `ROUTE_PERMISSIONS` mapping for protected routes
- Exported edge-compatible utilities:
  - `hasRole(userRole, requiredRole)` - role comparison
  - `canAccess(userRole, path)` - path-based access check
  - `getRequiredRole(path)` - required role for a path
  - `isAdmin(role)`, `isMaintainerOrAdmin(role)` - role checks

### Task 2: Update Middleware with Role-Based Route Protection (`src/middleware.ts`)
- Imported `canAccess` from RBAC library
- Defined `PROTECTED_PREFIXES`: `/dashboard`, `/admin`, `/maintainer`, `/api/admin`, `/api/maintainer`
- Added role-based access check using `canAccess(userRole, pathname)`
- Unauthorized users redirected to `/dashboard?error=unauthorized`
- Unauthenticated users redirected to `/auth/signin?callbackUrl=...`
- Updated matcher config for all protected routes

### Task 3: Create RoleGuard Component and Admin/Dashboard Pages
- **`src/components/auth/role-guard.tsx`** (client component):
  - `RoleGuard` - conditional rendering by required role
  - `requireRole(requiredRole)` - HOC for page-level protection
  - `AdminOnly`, `MaintainerOrAdmin` - convenience components
- **`src/app/admin/page.tsx`** (server component):
  - Uses `requireAdmin()` guard from `auth-guards.ts`
  - Placeholder admin dashboard with 6 feature cards
  - Redirects non-admins to `/dashboard`
- **`src/app/dashboard/page.tsx`** (server component):
  - Server-side auth check with `redirect('/auth/signin')`
  - Displays user's role badge (color-coded by role)
  - Shows GitHub username, certification count, points
  - Placeholder for Phase 05 functionality
  - Links to admin/maintainer pages based on role

### Additional: Server-Side Auth Guards (`src/lib/auth-guards.ts`)
- Separated from `rbac.ts` to avoid Edge Runtime issues
- `requireAuth()` - ensures authenticated session
- `requireRole(requiredRole)` - ensures sufficient role
- `requireAdmin()` - admin-only access
- `requireMaintainerOrAdmin()` - maintainer or admin access

## Verification

All success criteria met:
- ✅ RBAC library with 3-role hierarchy (contributor < maintainer < admin)
- ✅ Middleware protects `/dashboard`, `/admin`, `/maintainer`, `/api/admin`, `/api/maintainer`
- ✅ Server-side redirects for unauthorized access
- ✅ Client-side RoleGuard for conditional UI rendering
- ✅ Admin page placeholder with server-side role check
- ✅ Dashboard page accessible to all authenticated roles

Build verification: `npm run build` passes successfully.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Edge Runtime compatibility issue with `getServerSession`**
- **Found during:** Build verification
- **Issue:** Middleware importing `rbac.ts` which imported `auth-guards.ts` (via dynamic import in `requireAuth`) pulled `getServerSession` into Edge Runtime bundle, causing "Dynamic Code Evaluation not allowed in Edge Runtime" error
- **Fix:** Split RBAC into two files: `rbac.ts` (edge-compatible utilities only) and `auth-guards.ts` (server-side guards using `getServerSession`)
- **Files modified:** `src/lib/rbac.ts`, `src/lib/auth-guards.ts` (new), `src/app/admin/page.tsx`
- **Commit:** fecd2d1

**2. [Rule 1 - Bug] Prettier formatting and unused imports**
- **Found during:** Build verification (linting phase)
- **Issue:** Multiple prettier formatting errors and unused imports (`isAdmin` in auth-guards.ts, `getRequiredRole` in middleware.ts)
- **Fix:** Ran `npx prettier --write` on all modified files and removed unused imports
- **Files modified:** All 6 files
- **Commit:** fecd2d1

**3. [Rule 1 - Bug] `Github` icon not exported from lucide-react**
- **Found during:** Build verification
- **Issue:** `Github` icon import failed - not available in lucide-react
- **Fix:** Replaced with `GitBranch` icon which is available
- **Files modified:** `src/app/dashboard/page.tsx`
- **Commit:** fecd2d1

## Commits

| Hash | Message |
|------|---------|
| c24019d | feat(02-auth-profiles-02): create RBAC utility library with role hierarchy |
| b3a19c4 | feat(02-auth-profiles-02): update middleware with role-based route protection |
| e091a9f | feat(02-auth-profiles-02): create RoleGuard component and admin/dashboard pages |
| fecd2d1 | feat(02-auth-profiles-02): complete RBAC implementation with role guards and pages |

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: client-side-only-check | src/components/auth/role-guard.tsx | RoleGuard provides UI hiding only; server-side enforcement in middleware is primary control |
| threat_flag: role-in-jwt | src/lib/auth-options.ts | Role sourced from Supabase in JWT callback, signed by NEXTAUTH_SECRET (mitigated per threat model) |

## Next Steps

Phase 03 will implement:
- Full admin panel functionality (GitHub org/repo configuration)
- Maintainer dashboard
- Role management UI
- Certification rules configuration