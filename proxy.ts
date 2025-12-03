import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth routes - redirect to dashboard if already logged in
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Get access token from cookies
  // Note: We don't verify the token here since the backend API handles authentication
  // This middleware only provides basic redirect logic
  const accessToken = request.cookies.get('accessToken')?.value;

  // If accessing auth routes and already logged in, redirect to dashboard
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected routes require authentication
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!accessToken) {
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
