/**
 * Thin fetch wrapper for the @fam/api backend.
 * In the browser we use a relative `/api` URL so it goes through the same
 * nginx host (HAProxy → nginx 9443 → next 3000 / nest 4200) — no CORS, no SSL surprises.
 */

const BROWSER_API_BASE = "/api";
const SERVER_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://morev.neeklo.ru/api";

function getApiBase(): string {
  return typeof window === "undefined" ? SERVER_API_BASE : BROWSER_API_BASE;
}

export type LeadPayload = {
  parentName: string;
  childName: string;
  childBirthDate?: string;
  childAge?: number;
  phone: string;
  email?: string;
  telegram?: string;
  whatsapp?: string;
  direction?: string;
  experienceLevel?: "NONE" | "YES";
  comment?: string;
  privacyAccepted: boolean;
  source?: string;
  landingPage?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  /** Honeypot. Must be left empty by real users. */
  website?: string;
};

export type LeadResponse = {
  id: string;
  status: "NEW" | "IN_PROGRESS" | "CONTACTED" | "TRAINING_BOOKED" | "NO_ANSWER" | "REJECTED" | "ARCHIVED";
  createdAt: string;
  message: string;
};

export type ApiError = {
  message: string | string[];
  error?: string;
  statusCode: number;
};

export class LeadSubmitError extends Error {
  readonly statusCode: number;
  readonly details: string[];

  constructor(statusCode: number, details: string[], message?: string) {
    super(message ?? "Не удалось отправить заявку");
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function submitLead(payload: LeadPayload): Promise<LeadResponse> {
  const res = await fetch(`${getApiBase()}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    let details: string[] = [];
    let error: string | undefined;
    try {
      const data = (await res.json()) as ApiError;
      details = Array.isArray(data.message) ? data.message : [String(data.message)];
      error = data.error;
    } catch {
      details = [`HTTP ${res.status}`];
    }
    throw new LeadSubmitError(res.status, details, error);
  }

  return (await res.json()) as LeadResponse;
}
