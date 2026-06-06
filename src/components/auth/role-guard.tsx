'use client';

import { useSession } from 'next-auth/react';
import { hasRole, type Role } from '@/lib/rbac';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: Role;
  fallback?: ReactNode;
}

/**
 * Client-side component that conditionally renders children based on user role.
 * Use for hiding UI elements that require specific roles.
 * Note: This is defense-in-depth only. Server-side checks in middleware are the primary enforcement.
 */
export function RoleGuard({ children, requiredRole, fallback = null }: RoleGuardProps) {
  const { data: session, status } = useSession();

  // Still loading - don't render anything to avoid flash
  if (status === 'loading') {
    return null;
  }

  const userRole = session?.user?.role;

  if (!userRole || !hasRole(userRole, requiredRole)) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for page-level role protection.
 * Wraps a page component and redirects if user doesn't have required role.
 * Note: Middleware handles the actual redirect. This is for client-side rendering protection.
 */
export function requireRole(requiredRole: Role) {
  return function RequireRoleWrapper({
    children,
  }: {
    children: ReactNode;
  }) {
    return <RoleGuard requiredRole={requiredRole}>{children}</RoleGuard>;
  };
}

/**
 * Convenience component for admin-only content
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole="admin" fallback={fallback}>{children}</RoleGuard>;
}

/**
 * Convenience component for maintainer-or-admin content
 */
export function MaintainerOrAdmin({
  children,
  fallback = null,
}: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard requiredRole="maintainer" fallback={fallback}>{children}</RoleGuard>;
}