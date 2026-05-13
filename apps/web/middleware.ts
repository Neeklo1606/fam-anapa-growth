import { NextResponse, type NextRequest } from "next/server";

/**
 * Protect /admin/* (except /admin/login).
 * Only checks the presence of the access cookie here; signature is verified
 * server-side via /api/auth/me.
 *
 * Behind nginx/HAProxy `request.url` resolves to http://localhost:3000/...
 * because Next.js standalone server ignores X-Forwarded-Host when computing
 * the request URL. We reconstruct the public origin from forwarded headers
 * so the browser stays on https://morev.neeklo.ru after redirect.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const hasAccess = request.cookies.has("fam_access");
  const hasRefresh = request.cookies.has("fam_refresh");
  if (!hasAccess && !hasRefresh) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    const host =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      request.nextUrl.host;
    const loginUrl = new URL(`${proto}://${host}/admin/login`);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
