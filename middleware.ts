import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define which routes require authentication
const protectedRoutes = ["/dashboard", "/profile", "/reservations", "/reserve"]

// Define which routes are for non-authenticated users
const authRoutes = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Check if the route is for non-authenticated users
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // Check if the user is authenticated (has a JWT token)
  const hasAuthCookie = request.cookies.has("token")

  // If the route is protected and the user is not authenticated
  if (isProtectedRoute && !hasAuthCookie) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If the route is for non-authenticated users and the user is authenticated
  if (isAuthRoute && hasAuthCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/reservations/:path*", "/reserve/:path*", "/login", "/register"],
}

