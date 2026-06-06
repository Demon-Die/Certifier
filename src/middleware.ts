import { updateSession } from '@/lib/supabase/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { JWT } from 'next-auth/jwt';

// Extend NextRequest with NextAuth properties
interface NextAuthRequest extends NextRequest {
  nextauth: {
    token: JWT | null;
  };
}

// Combined middleware - run Supabase session refresh, then NextAuth auth
export default withAuth(
  async function middleware(req: NextAuthRequest) {
    // First, run Supabase middleware to refresh session
    await updateSession(req);

    // Admin-only routes
    const adminPaths = ['/admin'];
    const isAdminPath = adminPaths.some((path) => req.nextUrl.pathname.startsWith(path));

    const token = req.nextauth.token;
    if (isAdminPath && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protected routes that require authentication
        const protectedPaths = ['/dashboard', '/admin', '/api/protected'];
        const isProtectedPath = protectedPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        );

        if (isProtectedPath) {
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
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/protected/:path*'],
};
