const MAX_ORIGIN = "https://platform-api.max.ru";

export async function maxHttp(
  accessToken: string,
  pathQuery: string,
  init: RequestInit = {},
): Promise<Response> {
  const hdr = new Headers(init.headers as HeadersInit);
  hdr.set("Authorization", accessToken.trim());
  if (init.body && typeof init.body === "string" && !hdr.has("Content-Type")) {
    hdr.set("Content-Type", "application/json");
  }
  return fetch(`${MAX_ORIGIN}${pathQuery}`, { ...init, headers: hdr });
}

export async function maxJson<T>(
  accessToken: string,
  pathQuery: string,
  init?: RequestInit,
): Promise<T> {
  const res = await maxHttp(accessToken, pathQuery, init ?? {});
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`MAX ${pathQuery} HTTP ${res.status}: ${t.slice(0, 500)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
