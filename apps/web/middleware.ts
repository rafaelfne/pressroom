import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Protect /studio/* routes - redirect to login if not authenticated
  if (pathname.startsWith('/studio')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /api/* routes except /api/auth/* and /api/reports/health
  if (pathname.startsWith('/api')) {
    if (!pathname.startsWith('/api/auth') && pathname !== '/api/reports/health') {
      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/studio/:path*', '/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
