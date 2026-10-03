import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@insforge/sdk/ssr/middleware';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login' || pathname.startsWith('/api/');

  const hasAuthToken = request.cookies.has('insforge_access_token') || request.cookies.has('insforge_refresh_token');

  // If trying to access a protected route without auth, redirect to login
  if (!isPublicPath && !hasAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

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
