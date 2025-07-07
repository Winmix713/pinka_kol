import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Protects every route under /dashboard, /projects and the API project routes.
 * Unauthenticated users are redirected to /auth/signin.
 * Authenticated users visiting /auth/* are redirected to /dashboard to avoid showing
 * the sign-in/up screens again.
 */
export async function middleware(req: NextRequest) {
  // Reads the NextAuth JWT (uses the same NEXTAUTH_SECRET as the rest of the app).
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = Boolean(token)

  const { pathname } = req.nextUrl
  const isAuthRoute = pathname.startsWith("/auth")

  // 1. If user is authenticated and tries to visit auth pages → send them to dashboard
  if (isAuth && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 2. If user is NOT authenticated and tries to visit a protected route → send to signin
  const protectedRoutes = ["/dashboard", "/projects", "/api/projects"]
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!isAuth && isProtected) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // 3. Otherwise just continue
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/api/projects/:path*", "/auth/:path*"],
}
