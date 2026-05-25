import { cookies } from "next/headers";

const INTERNAL_API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4200/api";

export function parseSetCookie(input: string): {
  name: string;
  value: string;
  maxAge?: number;
  expires?: Date;
} | null {
  const [pair, ...attrs] = input.split(";").map((s) => s.trim());
  if (!pair) return null;
  const eqIdx = pair.indexOf("=");
  if (eqIdx === -1) return null;
  const name = pair.slice(0, eqIdx);
  const value = pair.slice(eqIdx + 1);
  let maxAge: number | undefined;
  let expires: Date | undefined;
  for (const attr of attrs) {
    const [rawKey, rawValue = ""] = attr.split("=");
    if (!rawKey) continue;
    const key = rawKey.trim().toLowerCase();
    if (key === "max-age") maxAge = Number(rawValue);
    else if (key === "expires") expires = new Date(rawValue);
  }
  return { name, value, maxAge, expires };
}

export async function applySetCookiesFromResponse(res: Response): Promise<void> {
  const jar = await cookies();
  const getter = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const list: string[] = typeof getter === "function" ? getter.call(res.headers) : [];
  for (const sc of list) {
    const parsed = parseSetCookie(sc);
    if (!parsed) continue;
    jar.set(parsed.name, parsed.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: parsed.maxAge,
      expires: parsed.expires,
    });
  }
}

export async function adminCookieHeader(): Promise<string> {
  const jar = await cookies();
  return jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
}

/** Обновить access-token по refresh-cookie. */
export async function refreshAdminSession(): Promise<boolean> {
  const jar = await cookies();
  if (!jar.get("fam_refresh")?.value) return false;

  try {
    const res = await fetch(`${INTERNAL_API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { cookie: await adminCookieHeader() },
      cache: "no-store",
    });
    if (!res.ok) return false;
    await applySetCookiesFromResponse(res);
    return true;
  } catch {
    return false;
  }
}

export async function clearAdminSessionCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete("fam_access");
  jar.delete("fam_refresh");
  jar.delete("fam_csrf");
}
