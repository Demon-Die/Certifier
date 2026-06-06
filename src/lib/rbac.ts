export type Role = 'contributor' | 'maintainer' | 'admin';

export const ROLE_HIERARCHY: Record<Role, number> = {
  contributor: 0,
  maintainer: 1,
  admin: 2,
};

export const ROUTE_PERMISSIONS: Record<string, Role> = {
  '/dashboard': 'contributor',
  '/maintainer': 'maintainer',
  '/admin': 'admin',
  '/api/admin': 'admin',
  '/api/maintainer': 'maintainer',
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canAccess(userRole: Role, path: string): boolean {
  // Find the most specific matching route
  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    path.startsWith(route)
  );

  if (matchingRoutes.length === 0) {
    return true; // Public route
  }

  // Use the most specific (longest) matching route
  const mostSpecificRoute = matchingRoutes.reduce((a, b) =>
    a.length > b.length ? a : b
  );

  const required = ROUTE_PERMISSIONS[mostSpecificRoute];
  return hasRole(userRole, required);
}

export function getRequiredRole(path: string): Role | null {
  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    path.startsWith(route)
  );

  if (matchingRoutes.length === 0) {
    return null;
  }

  const mostSpecificRoute = matchingRoutes.reduce((a, b) =>
    a.length > b.length ? a : b
  );

  return ROUTE_PERMISSIONS[mostSpecificRoute] || null;
}

/**
 * Check if user has admin role
 */
export function isAdmin(role: Role): boolean {
  return role === 'admin';
}

/**
 * Check if user has maintainer or admin role
 */
export function isMaintainerOrAdmin(role: Role): boolean {
  return role === 'maintainer' || role === 'admin';
}

/**
 * Server-side auth guard - throws redirect if unauthorized
 * Use in Server Components and API routes
 */
export async function requireAuth() {
  const { auth } = await import('@/lib/auth');
  const session = await auth();

  if (!session?.user) {
    const { redirect } = await import('next/navigation');
    redirect('/auth/signin');
  }

  return session;
}

/**
 * Server-side role guard - throws redirect if insufficient role
 * Use in Server Components and API routes
 */
export async function requireRole(requiredRole: Role) {
  const session = await requireAuth();

  if (!session.user.role || !hasRole(session.user.role, requiredRole)) {
    const { redirect } = await import('next/navigation');
    redirect('/dashboard?error=unauthorized');
  }

  return session;
}

/**
 * Server-side admin guard - throws redirect if not admin
 */
export async function requireAdmin() {
  return requireRole('admin');
}