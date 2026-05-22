"use client";

import { CONTACTS } from "@/content/site";
import { trackSiteEvent } from "@/lib/analytics";

export function FooterContactsSection() {
  return (
    <div className="md:col-span-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-mono-pro">Связь</div>
      <ul className="mt-4 space-y-3 text-[13px] text-white/[0.8]">
        <li>
          <a
            href={`tel:${CONTACTS.phone}`}
            onClick={() =>
              trackSiteEvent({ type: "PHONE_CLICK", page: typeof window !== "undefined" ? window.location.pathname : "/", section: "footer" })
            }
            className="hover:text-flame transition"
          >
            {CONTACTS.phoneDisplay}
          </a>
        </li>
        <li>
          <span className="text-white/50 text-xs uppercase tracking-[0.12em]">Мессенджеры</span>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <a
              href={CONTACTS.whatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackSiteEvent({ type: "WHATSAPP_CLICK", section: "footer", page: window.location.pathname })
              }
              className="hover:text-flame transition"
            >
              WhatsApp
            </a>
            <span aria-hidden className="text-white/35">
              ·
            </span>
            <a
              href={CONTACTS.telegram}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackSiteEvent({ type: "TELEGRAM_CLICK", section: "footer", page: window.location.pathname })
              }
              className="hover:text-flame transition"
            >
              Telegram
            </a>
          </div>
        </li>
        <li>
          <a
            href={CONTACTS.max}
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
        <li>
          <a
            href={CONTACTS.yandexMaps}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackSiteEvent({ type: "MAP_CLICK", section: "footer", page: window.location.pathname })
            }
            className="hover:text-flame transition"
          >
            Яндекс.Карты · {CONTACTS.addressShort}
          </a>
        </li>
      </ul>
    </div>
  );
}
