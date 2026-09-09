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
    decodedToken?.roles?.[0] ||
    decodedToken?.authorities?.[0] ||
    ""
  )
    .toString()
    .toUpperCase();

  const isAdmin =
    rawRole === "ADMIN" ||
    rawRole === "ROLE_ADMIN" ||
    rawRole === "ADMINISTRATOR";

  // 1. If user is ADMIN, restrict access strictly to /admin routes
  if (isAdmin) {
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin route protection for non-admin users
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  // 3. User route protection (e.g., /user/dashboard, /user/orders, /user/settings)
  if (pathname.startsWith("/user")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Redirect authenticated users away from public auth pages (/login, /signup)
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - static files (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
