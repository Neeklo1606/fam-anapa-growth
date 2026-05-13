/**
 * Отправка событий во внутреннюю коллекцию (Prisma AnalyticsEvent через API Морева).
 */

const SID_KEY = "fam_analytics_sid";

export type SiteAnalyticsEventType =
  | "FORM_OPEN"
  | "FORM_SUBMIT"
  | "PHONE_CLICK"
  | "WHATSAPP_CLICK"
  | "TELEGRAM_CLICK"
  | "MAX_CLICK"
  | "MAP_CLICK"
  | "VIDEO_PLAY"
  | "MENU_OPEN"
  | "SECTION_VIEW";

function analyticsSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let s = localStorage.getItem(SID_KEY);
    if (!s) {
      s = crypto.randomUUID();
      localStorage.setItem(SID_KEY, s);
    }
    return s;
  } catch {
    return undefined;
  }
}

export function trackSiteEvent(input: {
  type: SiteAnalyticsEventType;
  page?: string;
  section?: string;
  metadata?: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;

  const path = window.location.pathname;
  const body = JSON.stringify({
    type: input.type,
    page: input.page ?? path,
    section: input.section,
    sessionId: analyticsSessionId(),
    metadata: input.metadata,
  });

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
