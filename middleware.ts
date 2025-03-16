import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth-service"

// Paths that don't require authentication
const publicPaths = ["/", "/login", "/register", "/forgot-password"]

// Role-based path access
const roleBasedPaths: Record<string, string[]> = {
  patient: ["/patient-dashboard"],
  doctor: ["/doctor-dashboard"],
  admin: ["/admin-dashboard"],
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow public paths
  if (publicPaths.some((p) => path === p || path.startsWith("/api/auth"))) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Verify token and get user info
    const payload = await verifyToken(token)

    if (!payload || !payload.sub) {
      throw new Error("Invalid token")
    }

    // Check role-based access
    const userRole = payload.role as string

    // If accessing a role-specific dashboard
    if (path.includes("-dashboard")) {
      const allowedRoles = Object.keys(roleBasedPaths).filter((role) =>
        roleBasedPaths[role].some((p) => path.startsWith(p)),
      )

      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        return NextResponse.redirect(new URL(`/${userRole}-dashboard`, request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Redirect to login if token is invalid
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/register|api/auth/login).*)"],
}

