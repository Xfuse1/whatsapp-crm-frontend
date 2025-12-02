import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for auth token in cookies (we'll need to set this from client-side)
  const token = request.cookies.get('auth_token')?.value;
  
  // Check if accessing protected route without token
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
