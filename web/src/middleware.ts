import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
}

/**
 * Lightweight Base64Url JWT parser compatible with Next.js Edge Runtime
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if missing
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const jsonString = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Next.js Edge Middleware for Admin Route Protection
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all routes under /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);

    // If token is invalid or corrupted, redirect to login
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    // If token is expired, redirect to login
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    // If user does not have ADMIN role, redirect to forbidden
    if (payload.role !== 'ADMIN') {
      const forbiddenUrl = new URL('/forbidden', request.url);
      return NextResponse.redirect(forbiddenUrl);
    }

    // User is authenticated and authorized as ADMIN
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
