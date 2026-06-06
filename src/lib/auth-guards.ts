import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasRole, type Role } from '@/lib/rbac';

/**
 * Server-side auth guard - throws redirect if unauthorized
 * Use in Server Components and API routes (NOT in middleware)
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return session;
}

/**
 * Server-side role guard - throws redirect if insufficient role
 * Use in Server Components and API routes (NOT in middleware)
 */
export async function requireRole(requiredRole: Role) {
  const session = await requireAuth();

  if (!session.user.role || !hasRole(session.user.role, requiredRole)) {
    redirect('/dashboard?error=unauthorized');
  }

  return session;
}

/**
 * Server-side admin guard - throws redirect if not admin
 * Use in Server Components and API routes (NOT in middleware)
 */
export async function requireAdmin() {
  return requireRole('admin');
}

/**
 * Server-side maintainer-or-admin guard
 */
export async function requireMaintainerOrAdmin() {
  return requireRole('maintainer');
}
