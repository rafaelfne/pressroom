import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Redirect authenticated users from public pages to /templates
  if (isAuthenticated && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/templates', req.url));
  }

  // Protect /api/* routes except /api/auth/* and /api/reports/health
  if (pathname.startsWith('/api')) {
    if (!pathname.startsWith('/api/auth') && pathname !== '/api/reports/health') {
      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  // All non-public routes require authentication
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
