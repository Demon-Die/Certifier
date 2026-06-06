import { updateSession } from '@/lib/supabase/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { JWT } from 'next-auth/jwt';
import { canAccess } from '@/lib/rbac';

// Extend NextRequest with NextAuth properties
interface NextAuthRequest extends NextRequest {
  nextauth: {
    token: JWT | null;
  };
}

// Protected route prefixes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/maintainer', '/api/admin', '/api/maintainer'];

// Check if a path requires authentication
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Combined middleware - run Supabase session refresh, then NextAuth auth
export default withAuth(
  async function middleware(req: NextAuthRequest) {
    // First, run Supabase middleware to refresh session
    const supabaseResponse = await updateSession(req);

    const pathname = req.nextUrl.pathname;

    // Check if path is protected
    if (!isProtectedPath(pathname)) {
      return supabaseResponse;
    }

    const token = req.nextauth.token;

    // No session - redirect to sign in
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = token.role as 'contributor' | 'maintainer' | 'admin' | undefined;

    // No role in token - redirect to dashboard
    if (!userRole) {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url));
    }

    // Check role-based access
    if (!canAccess(userRole, pathname)) {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url));
    }

    return supabaseResponse;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protected routes that require authentication
        const isProtected = isProtectedPath(req.nextUrl.pathname);

        if (isProtected) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/maintainer/:path*',
    '/api/admin/:path*',
    '/api/maintainer/:path*',
  ],
};
