import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/utils/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  // const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  // const _isPublicRoute = publicRoutes.includes(pathname);

  // Auth routes - redirect to dashboard if already logged in
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Get access token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  // If accessing auth routes and already logged in, redirect to dashboard
  if (isAuthRoute && accessToken) {
    try {
      verifyAccessToken(accessToken);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // Token invalid, continue to auth page
    }
  }

  // Protected routes require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      verifyAccessToken(accessToken);
      return NextResponse.next();
    } catch {
      // Token expired or invalid, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};
