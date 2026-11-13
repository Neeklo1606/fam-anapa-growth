import type { Metadata } from "next";
import { Phone, MessageCircle, Send, MapPin, Mail, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { ApplyButton } from "@/components/site/ApplyModal";

import { fetchPublicSite } from "@/lib/admin-api";
import { buildContactCards, isHttpUrl, resolveSiteContacts } from "@/lib/site-contacts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты Футбольной академии Морева в Анапе: телефон +7 (915) 030-31-41, MAX, ВКонтакте, адрес стадиона. Запись ребёнка на футбольные тренировки.",
  openGraph: {
    title: "Контакты · Футбольная академия Морева",
    description: "Свяжитесь с нами для записи ребёнка.",
  },
  alternates: { canonical: "/contacts" },
};

const ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  wa: MessageCircle,
  tg: Send,
  max: MessageCircle,
  vk: Send,
  email: Mail,
  map: MapPin,
};

export default async function ContactsPage() {
  let contacts = resolveSiteContacts(null);
  try {
    const pub = await fetchPublicSite();
    contacts = resolveSiteContacts(pub);
  } catch {
    /* fallback при сборке */
  }

  const cards = buildContactCards(contacts);
  const showMap = Boolean(contacts.mapEmbed && isHttpUrl(contacts.mapEmbed));

  return (
    <div className="pb-safe-nav lg:pb-0">
      <section className="relative bg-night text-white pt-24 lg:pt-32 pb-12 lg:pb-20 overflow-hidden">
        <div className="absolute -top-32 right-0 h-[400px] w-[400px] bg-royal/30 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="text-[11px] uppercase tracking-[0.18em] text-flame font-semibold">
              Контакты
            </div>
            <h1
              className="mt-3 font-display tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 11vw, 5rem)", lineHeight: 0.95 }}
            >
              Контакты
            </h1>
            <p className="mt-4 text-[15px] lg:text-lg text-white/70 max-w-xl">
              Свяжитесь с нами, чтобы записать ребёнка на тренировку или уточнить группу.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {cards.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {cards.map((c, i) => {
                const Icon = ICONS[c.key] ?? Phone;
                return (
                  <Reveal key={c.key} delay={i * 0.05}>
                    <a
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={c.external ? "noreferrer" : undefined}
                      className="group flex items-center gap-4 p-5 rounded-2xl border border-line bg-surface hover:bg-night hover:text-white hover:border-night transition active:scale-[0.99]"
                    >
                      <span className="h-12 w-12 rounded-xl bg-night/5 group-hover:bg-white/10 flex items-center justify-center text-flame shrink-0">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[10px] uppercase tracking-[0.2em] opacity-60">
                          {c.label}
                        </span>
                        <span className="block font-display text-xl tracking-wide truncate">
                          {c.value}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:text-flame group-hover:translate-x-0.5 transition" />
                    </a>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <p className="text-ink/60 text-sm">Контактные данные скоро появятся. Оставьте заявку через форму ниже.</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {contacts.phoneTel ? (
              <a
                href={`tel:${contacts.phoneTel}`}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-xs shadow-flame hover:brightness-105 transition"
              >
                <Phone className="h-4 w-4" /> Позвонить
              </a>
            ) : null}
            {contacts.whatsapp ? (
              <a
                href={contacts.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-line text-deep font-semibold uppercase tracking-wider text-xs hover:bg-surface transition"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            ) : null}
            {contacts.telegram ? (
              <a
                href={contacts.telegram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-line text-deep font-semibold uppercase tracking-wider text-xs hover:bg-surface transition"
              >
                <Send className="h-4 w-4" /> Telegram
              </a>
            ) : null}
            {contacts.max ? (
              <a
                href={contacts.max}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-line text-deep font-semibold uppercase tracking-wider text-xs hover:bg-surface transition"
              >
                <MessageCircle className="h-4 w-4" /> MAX
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-surface py-10 md:py-16">
        <div
          className={`mx-auto max-w-7xl px-5 lg:px-8 ${showMap ? "grid md:grid-cols-12 gap-6" : "max-w-lg"}`}
        >
          {showMap ? (
            <div
              id="map"
              className="md:col-span-7 relative rounded-2xl overflow-hidden border border-line h-[320px] md:h-[420px] bg-night"
            >
              <iframe
                title="Карта"
                src={contacts.mapEmbed!}
                className="absolute inset-0 w-full h-full"
                loading="lazy"
              />
            </div>
          ) : null}

          <div
            className={`${showMap ? "md:col-span-5" : ""} rounded-2xl bg-night text-white p-7 md:p-9 relative overflow-hidden border border-white/5 flex flex-col justify-between gap-6`}
          >
            <div className="absolute -top-24 -right-24 h-64 w-64 bg-flame/15 blur-3xl rounded-full" />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">
                Заявка
              </div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">
                Записать ребёнка
              </h2>
              <p className="mt-3 text-white/65 text-sm">
                Оставьте заявку · подберём подходящую группу и расписание.
              </p>
              {contacts.address ? (
                <p className="mt-4 text-white/55 text-sm flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-flame" />
                  {contacts.address}
                </p>
              ) : null}
            </div>
            <div className="relative">
              <ApplyButton>Записать ребёнка</ApplyButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
