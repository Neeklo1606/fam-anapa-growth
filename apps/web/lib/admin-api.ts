/**
 * Server-side fetch helpers for the admin section.
 * They always run in Server Components / Route Handlers and forward incoming cookies
 * to the NestJS backend so authentication propagates through nginx.
 */

import { cookies } from "next/headers";

import type { LeadStatus, UserRole } from "@fam/types";

const INTERNAL_API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4200/api";

async function callApi<T>(
  path: string,
  init: RequestInit = {},
  { json = true }: { json?: boolean } = {},
): Promise<T> {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const url = `${INTERNAL_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init.headers ?? {}),
      cookie: cookieHeader,
    },
  });
  if (!res.ok) {
    let detail: string | undefined;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      detail = Array.isArray(data.message) ? data.message.join("; ") : data.message;
    } catch {
      detail = res.statusText;
    }
    const err = new Error(detail || `Request failed (HTTP ${res.status})`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  if (!json) {
    return (await res.text()) as unknown as T;
  }
  return (await res.json()) as T;
}

export type AdminMe = {
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
  } | null;
};

export async function fetchMe(): Promise<AdminMe["user"]> {
  try {
    const { user } = await callApi<AdminMe>("/auth/me");
    return user;
  } catch {
    return null;
  }
}

export type AdminLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  parentName: string;
  childName: string;
  childBirthDate: string | null;
  phone: string;
  email: string | null;
  telegram: string | null;
  whatsapp: string | null;
  direction: string | null;
  experienceLevel: "NONE" | "YES";
  comment: string | null;
  status: LeadStatus;
  source: string | null;
  landingPage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ip: string | null;
  userAgent: string | null;
  assignedManagerId: string | null;
  assignedManager: { id: string; fullName: string; email: string } | null;
};

export type AdminLeadDetail = AdminLead & {
  history: Array<{
    id: string;
    fromStatus: LeadStatus | null;
    toStatus: LeadStatus;
    note: string | null;
    createdAt: string;
    changedBy: { id: string; fullName: string } | null;
  }>;
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; fullName: string } | null;
  }>;
};

export async function fetchLeads(params: {
  page?: number;
  limit?: number;
  status?: LeadStatus | "ALL";
  search?: string;
}): Promise<{ items: AdminLead[]; total: number; page: number; limit: number }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status && params.status !== "ALL") qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  const tail = qs.toString();
  return callApi<{ items: AdminLead[]; total: number; page: number; limit: number }>(
    `/leads${tail ? `?${tail}` : ""}`,
  );
}

export async function fetchLeadById(id: string): Promise<AdminLeadDetail> {
  return callApi<AdminLeadDetail>(`/leads/${id}`);
}

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchUsers(): Promise<AdminUser[]> {
  return callApi<AdminUser[]>("/users");
}

export async function fetchManagers(): Promise<AdminUser[]> {
  const all = await fetchUsers();
  return all.filter((u) => u.isActive && (u.role === "ADMIN" || u.role === "MANAGER"));
}

export type SiteSettings = {
  id: number;
  brandName: string;
  brandTagline: string | null;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  maxLink: string | null;
  email: string | null;
  address: string | null;
  mapEmbed: string | null;
  yandexMapUrl: string | null;
  updatedAt: string;
};

export async function fetchSettings(): Promise<SiteSettings> {
  return callApi<SiteSettings>("/site/admin");
}

export type AdminCoach = {
  id: string;
  fullName: string;
  role: string;
  photoUrl: string | null;
  photoMediaId: string | null;
  photo?: {
    id: string;
    url: string;
    webpUrl: string | null;
    thumbUrl: string | null;
    altDefault: string | null;
  } | null;
  education: string | null;
  license: string | null;
  experience: string | null;
  shortDescription: string;
  fullDescription: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchCoachesAdmin(): Promise<AdminCoach[]> {
  return callApi<AdminCoach[]>("/coaches/admin");
}

export async function fetchCoach(id: string): Promise<AdminCoach> {
  return callApi<AdminCoach>(`/coaches/${id}`);
}

export type AdminMedia = {
  id: string;
  url: string;
  webpUrl: string | null;
  thumbUrl: string | null;
  mime: string;
  kind: "IMAGE" | "VIDEO" | "POSTER" | "DOCUMENT";
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  altDefault: string | null;
  createdAt: string;
};

export type MediaList = { items: AdminMedia[]; total: number; page: number; limit: number };

export async function fetchMedia(params: {
  page?: number;
  limit?: number;
  kind?: AdminMedia["kind"];
} = {}): Promise<MediaList> {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.kind) sp.set("kind", params.kind);
  const qs = sp.toString() ? `?${sp.toString()}` : "";
  return callApi<MediaList>(`/media${qs}`);
}

export async function fetchMediaById(id: string): Promise<AdminMedia> {
  return callApi<AdminMedia>(`/media/${id}`);
}

export type AdminGalleryItem = {
  id: string;
  mediaId: string;
  alt: string;
  title: string | null;
  category: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  media: {
    id: string;
    url: string;
    webpUrl: string | null;
    thumbUrl: string | null;
    altDefault: string | null;
    mime: string;
  };
};

export async function fetchGalleryAdmin(): Promise<AdminGalleryItem[]> {
  return callApi<AdminGalleryItem[]>("/gallery/admin");
}

export async function fetchGalleryItem(id: string): Promise<AdminGalleryItem> {
  return callApi<AdminGalleryItem>(`/gallery/${id}`);
}

export type AdminVideo = {
  id: string;
  title: string;
  url: string;
  posterMediaId: string | null;
  posterUrl: string | null;
  description: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  poster?: {
    id: string;
    url: string;
    webpUrl: string | null;
    thumbUrl: string | null;
    altDefault: string | null;
  } | null;
};

export async function fetchVideosAdmin(): Promise<AdminVideo[]> {
  return callApi<AdminVideo[]>("/videos/admin");
}

export async function fetchVideo(id: string): Promise<AdminVideo> {
  return callApi<AdminVideo>(`/videos/${id}`);
}

export type TelegramNotifySubscriberDto = {
  id: string;
  chatId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
};

export type TelegramNotifyAdminState = {
  integration: {
    hasBotToken: boolean;
    publicAppUrl: string | null;
    leadOutboundWebhookUrl: string | null;
    webhookUrl: string | null;
    lastWebhookError: string | null;
  };
  webhookInfo: Record<string, unknown> | null;
  subscribersPending: TelegramNotifySubscriberDto[];
  subscribersApproved: TelegramNotifySubscriberDto[];
};

export async function fetchTelegramNotifyState(): Promise<TelegramNotifyAdminState> {
  return callApi<TelegramNotifyAdminState>("/notifications/telegram");
}
