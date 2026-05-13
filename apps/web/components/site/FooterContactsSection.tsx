"use client";

import { CONTACTS } from "@/content/site";
import { trackSiteEvent } from "@/lib/analytics";

export function FooterContactsSection() {
  return (
    <div className="md:col-span-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono-pro">Связь</div>
      <ul className="mt-5 space-y-3 text-sm text-white/80">
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
          {" · "}
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
            {CONTACTS.address}
          </a>
        </li>
      </ul>
    </div>
  );
}
