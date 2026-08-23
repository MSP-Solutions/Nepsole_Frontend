import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieValue = request.cookies.get("nepsole")?.value;
  let user: any = null;

  if (cookieValue) {
    try {
      user = JSON.parse(decodeURIComponent(cookieValue));
    } catch {
      try {
        user = JSON.parse(cookieValue);
      } catch {
        user = null;
      }
    }
  }

  const token = user?.accessToken || user?.jwtToken || user?.token;
  const isAuthenticated = Boolean(token);
  const decodedToken = token ? decodeJwt(token) : null;

  const rawRole = (
    user?.role ||
    user?.user?.role ||
    decodedToken?.role ||
    ""
  )
    .toString()
    .toUpperCase();

  const isAdmin =
    rawRole === "ADMIN" ||
    rawRole === "ROLE_ADMIN" ||
    rawRole === "ADMINISTRATOR";

  // 1. Admin route protection (e.g., /admin/dashboard, except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  // 2. User route protection (e.g., /user/dashboard, /user/orders, /user/settings)
  if (pathname.startsWith("/user")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect ADMIN users away from /user/dashboard to /admin/dashboard
    if (isAdmin && pathname === "/user/dashboard") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // 3. Redirect authenticated users away from public auth pages (/login, /signup, /admin/login)
  if (
    isAuthenticated &&
    (pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/admin/login")
  ) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/signup",
  ],
};
