"use client";

import { useSiteContacts } from "@/components/site/SiteContactsContext";
import { trackSiteEvent } from "@/lib/analytics";

export function FooterContactsSection() {
  const c = useSiteContacts();
  const messengers = [
    c.whatsapp ? { key: "wa", label: "WhatsApp", href: c.whatsapp, event: "WHATSAPP_CLICK" as const } : null,
    c.telegram ? { key: "tg", label: "Telegram", href: c.telegram, event: "TELEGRAM_CLICK" as const } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; href: string; event: "WHATSAPP_CLICK" | "TELEGRAM_CLICK" }>;

  const hasAny =
    c.phoneTel ||
    messengers.length > 0 ||
    c.max ||
    c.email ||
    (c.yandexMaps && c.address);

  if (!hasAny) return null;

  return (
    <div className="md:col-span-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-mono-pro">Связь</div>
      <ul className="mt-4 space-y-3 text-[13px] text-white/[0.8]">
        {c.phoneTel && c.phoneDisplay ? (
          <li>
            <a
              href={`tel:${c.phoneTel}`}
              onClick={() =>
                trackSiteEvent({
                  type: "PHONE_CLICK",
                  page: typeof window !== "undefined" ? window.location.pathname : "/",
                  section: "footer",
                })
              }
              className="hover:text-flame transition"
            >
              {c.phoneDisplay}
            </a>
          </li>
        ) : null}

        {c.email ? (
          <li>
            <a href={`mailto:${c.email}`} className="hover:text-flame transition">
              {c.email}
            </a>
          </li>
        ) : null}

        {messengers.length > 0 ? (
          <li>
            <span className="text-white/50 text-xs uppercase tracking-[0.12em]">Мессенджеры</span>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {messengers.map((m, i) => (
                <span key={m.key} className="inline-flex items-center gap-x-3">
                  {i > 0 ? (
                    <span aria-hidden className="text-white/35">
                      ·
                    </span>
                  ) : null}
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackSiteEvent({ type: m.event, section: "footer", page: window.location.pathname })
                    }
                    className="hover:text-flame transition"
                  >
                    {m.label}
                  </a>
                </span>
              ))}
            </div>
          </li>
        ) : null}

        {c.max ? (
          <li>
            <a
              href={c.max}
              target="_blank"
              rel="noreferrer"
              className="hover:text-flame transition"
              onClick={() =>
                trackSiteEvent({ type: "MAX_CLICK", section: "footer", page: window.location.pathname })
              }
            >
              Написать в MAX
            </a>
          </li>
        ) : null}

        {c.yandexMaps && c.address ? (
          <li>
            <a
              href={c.yandexMaps}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackSiteEvent({ type: "MAP_CLICK", section: "footer", page: window.location.pathname })
              }
              className="hover:text-flame transition"
            >
              Яндекс.Карты · {c.address}
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
