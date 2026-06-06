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

/**
 * Check if user role meets or exceeds required role
 * Edge Runtime compatible
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can access a given path based on their role
 * Edge Runtime compatible
 */
export function canAccess(userRole: Role, path: string): boolean {
  // Find the most specific matching route
  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS).filter((route) => path.startsWith(route));

  if (matchingRoutes.length === 0) {
    return true; // Public route
  }

  // Use the most specific (longest) matching route
  const mostSpecificRoute = matchingRoutes.reduce((a, b) => (a.length > b.length ? a : b));

  const required = ROUTE_PERMISSIONS[mostSpecificRoute];
  return hasRole(userRole, required);
}

/**
 * Get the required role for a path
 * Edge Runtime compatible
 */
export function getRequiredRole(path: string): Role | null {
  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS).filter((route) => path.startsWith(route));

  if (matchingRoutes.length === 0) {
    return null;
  }

  const mostSpecificRoute = matchingRoutes.reduce((a, b) => (a.length > b.length ? a : b));

  return ROUTE_PERMISSIONS[mostSpecificRoute] || null;
}

/**
 * Check if user has admin role
 * Edge Runtime compatible
 */
export function isAdmin(role: Role): boolean {
  return role === 'admin';
}

/**
 * Check if user has maintainer or admin role
 * Edge Runtime compatible
 */
export function isMaintainerOrAdmin(role: Role): boolean {
  return role === 'maintainer' || role === 'admin';
}
