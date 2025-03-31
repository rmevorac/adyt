import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith('/api/auth/')
  );

  // Get the token from the cookie
  const token = request.cookies.get('auth-token')?.value;

  // Allow access to public routes regardless of authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If there's no token and the user is trying to access a protected route
  if (!token) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // User is authenticated, allow access to protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - these will handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 