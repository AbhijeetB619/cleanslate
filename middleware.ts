import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from the auth page
  if (sessionCookie && pathname === '/authenticate') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!sessionCookie && (pathname.startsWith('/dashboard') || pathname.startsWith('/notes'))) {
    return NextResponse.redirect(new URL('/authenticate', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/notes/:path*', '/authenticate'],
};
