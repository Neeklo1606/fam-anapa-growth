"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const INTERNAL_API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4200/api";

type LoginInput = { email: string; password: string };
type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

function parseSetCookie(input: string): {
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

export async function loginAction(input: LoginInput): Promise<LoginResult> {
  try {
    const res = await fetch(`${INTERNAL_API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = (await res.json()) as { message?: string | string[] };
        msg = Array.isArray(data.message) ? data.message[0]! : data.message ?? msg;
      } catch {}
      return { ok: false, error: msg };
    }

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
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    await fetch(`${INTERNAL_API_BASE}/auth/logout`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
  } catch {}
  jar.delete("fam_access");
  jar.delete("fam_refresh");
  redirect("/admin/login");
}

export type UpdateStatusInput = {
  id: string;
  status: string;
  note?: string;
};

export async function updateLeadStatusAction(input: UpdateStatusInput): Promise<{ ok: boolean; error?: string }> {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    const res = await fetch(`${INTERNAL_API_BASE}/leads/${input.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: cookieHeader },
      body: JSON.stringify({ status: input.status, note: input.note }),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function addLeadCommentAction(input: { id: string; body: string }): Promise<{ ok: boolean; error?: string }> {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    const res = await fetch(`${INTERNAL_API_BASE}/leads/${input.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: cookieHeader },
      body: JSON.stringify({ body: input.body }),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

async function authedJson<T = unknown>(
  path: string,
  init: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    const res = await fetch(`${INTERNAL_API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        cookie: cookieHeader,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = (await res.json()) as { message?: string | string[] };
        msg = Array.isArray(data.message) ? data.message[0]! : data.message ?? msg;
      } catch {}
      return { ok: false, error: msg };
    }
    if (res.status === 204) return { ok: true, data: undefined as T };
    const data = (await res.json().catch(() => undefined)) as T;
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function assignManagerAction(input: { id: string; managerId: string | null }): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson(`/leads/${input.id}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ managerId: input.managerId }),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export type CreateUserInput = {
  email: string;
  password: string;
  fullName: string;
  role: "ADMIN" | "MANAGER" | "EDITOR" | "VIEWER";
};

export async function createUserAction(input: CreateUserInput): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function updateUserAction(input: {
  id: string;
  fullName?: string;
  role?: CreateUserInput["role"];
  isActive?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const { id, ...patch } = input;
  const r = await authedJson(`/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function resetUserPasswordAction(input: {
  id: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson(`/users/${input.id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: input.password }),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export type SettingsPatch = {
  brandName?: string;
  brandTagline?: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  maxLink?: string;
  email?: string;
  address?: string;
  mapEmbed?: string;
  yandexMapUrl?: string;
};

export async function updateSettingsAction(patch: SettingsPatch): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson("/site/admin", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export type CoachInput = {
  fullName: string;
  role: string;
  shortDescription: string;
  photoUrl?: string;
  photoMediaId?: string | null;
  education?: string;
  license?: string;
  experience?: string;
  fullDescription?: string;
  active?: boolean;
};

export async function createCoachAction(input: CoachInput): Promise<{ ok: boolean; error?: string; id?: string }> {
  const r = await authedJson<{ id: string }>("/coaches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return r.ok ? { ok: true, id: r.data?.id } : { ok: false, error: r.error };
}

export async function updateCoachAction(input: { id: string } & Partial<CoachInput>): Promise<{ ok: boolean; error?: string }> {
  const { id, ...patch } = input;
  const r = await authedJson(`/coaches/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function deleteCoachAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson(`/coaches/${id}`, { method: "DELETE" });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function reorderCoachesAction(items: Array<{ id: string; order: number }>): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson("/coaches/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function listMediaAction(params: { page?: number; limit?: number } = {}): Promise<{ ok: boolean; error?: string; items?: Array<{ id: string; url: string; webpUrl: string | null; thumbUrl: string | null; mime: string; altDefault: string | null }> }> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 60));
  const r = await authedJson<{ items: Array<{ id: string; url: string; webpUrl: string | null; thumbUrl: string | null; mime: string; altDefault: string | null }> }>(
    `/media?${sp.toString()}`,
    { method: "GET" },
  );
  return r.ok ? { ok: true, items: r.data?.items ?? [] } : { ok: false, error: r.error };
}

export async function uploadMediaAction(form: FormData): Promise<{ ok: boolean; error?: string; id?: string; url?: string; webpUrl?: string | null; thumbUrl?: string | null }> {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  try {
    const res = await fetch(`${INTERNAL_API_BASE}/media/upload`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      body: form,
      cache: "no-store",
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = (await res.json()) as { message?: string | string[] };
        msg = Array.isArray(data.message) ? data.message[0]! : data.message ?? msg;
      } catch {}
      return { ok: false, error: msg };
    }
    const data = (await res.json()) as {
      id: string;
      url: string;
      webpUrl: string | null;
      thumbUrl: string | null;
    };
    return { ok: true, ...data };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteMediaAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson(`/media/${id}`, { method: "DELETE" });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export type GalleryInput = {
  mediaId: string;
  alt: string;
  title?: string;
  category?: string;
  active?: boolean;
};

export async function createGalleryItemAction(input: GalleryInput): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson("/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function updateGalleryItemAction(input: { id: string } & Partial<GalleryInput>): Promise<{ ok: boolean; error?: string }> {
  const { id, ...patch } = input;
  const r = await authedJson(`/gallery/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function deleteGalleryItemAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson(`/gallery/${id}`, { method: "DELETE" });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function reorderGalleryAction(items: Array<{ id: string; order: number }>): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson("/gallery/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export type VideoInput = {
  title: string;
  url: string;
  posterMediaId?: string | null;
  posterUrl?: string | null;
  description?: string | null;
  active?: boolean;
};

export async function createVideoAction(input: VideoInput): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson("/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function updateVideoAction(input: { id: string } & Partial<VideoInput>): Promise<{ ok: boolean; error?: string }> {
  const { id, ...patch } = input;
  const r = await authedJson(`/videos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function deleteVideoAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson(`/videos/${id}`, { method: "DELETE" });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function reorderVideosAction(items: Array<{ id: string; order: number }>): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson("/videos/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function updateMediaAltAction(input: { id: string; altDefault: string | null }): Promise<{ ok: boolean; error?: string }> {
  const r = await authedJson(`/media/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ altDefault: input.altDefault }),
  });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export async function changeOwnPasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean; error?: string; loggedOut?: boolean }> {
  const r = await authedJson("/auth/me/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) return { ok: false, error: r.error };
  const jar = await cookies();
  jar.delete("fam_access");
  jar.delete("fam_refresh");
  return { ok: true, loggedOut: true };
}
