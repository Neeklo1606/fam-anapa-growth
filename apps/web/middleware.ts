import { NextResponse, type NextRequest } from "next/server";

const INTERNAL_API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4200/api";

function adminLoginUrl(request: NextRequest, pathname: string, reason?: string) {
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const loginUrl = new URL(`${proto}://${host}/admin/login`);
  loginUrl.searchParams.set("next", pathname);
  if (reason) loginUrl.searchParams.set("reason", reason);
  return loginUrl;
}

function forwardSetCookies(from: Response, to: NextResponse) {
  const getter = (from.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const list: string[] = typeof getter === "function" ? getter.call(from.headers) : [];
  for (const cookie of list) {
    to.headers.append("Set-Cookie", cookie);
  }
}

/**
 * Protect /admin/* (except /admin/login).
 * При отсутствии access, но наличии refresh — обновляем сессию в middleware
 * (в Server Components нельзя менять cookies — иначе 500).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const hasAccess = request.cookies.has("fam_access");
  const hasRefresh = request.cookies.has("fam_refresh");

  if (!hasAccess && !hasRefresh) {
    return NextResponse.redirect(adminLoginUrl(request, pathname), 307);
  }

  if (!hasAccess && hasRefresh) {
    try {
      const refreshRes = await fetch(`${INTERNAL_API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });
      if (refreshRes.ok) {
        const response = NextResponse.next();
        forwardSetCookies(refreshRes, response);
        return response;
      }
    } catch {
      /* fall through to login */
    }
    return NextResponse.redirect(adminLoginUrl(request, pathname, "session_expired"), 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
