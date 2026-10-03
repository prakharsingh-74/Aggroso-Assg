import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@insforge/sdk/ssr/middleware';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // Paths that do not require authentication
  const isPublicPath = pathname === '/login' || pathname.startsWith('/api/');

  // Check if we have either an access token or a refresh token
  const hasAuthToken = request.cookies.has('insforge_access_token') || request.cookies.has('insforge_refresh_token');

  // If trying to access a protected route without auth, redirect to login
  if (!isPublicPath && !hasAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page while logged in, redirect to dashboard
  if (pathname === '/login' && hasAuthToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  await updateSession({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
