import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Send, MapPin, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ApplyButton } from "@/components/site/ApplyModal";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Контакты · Футбольная академия Морева в Анапе" },
      {
        name: "description",
        content:
          "Контакты футбольной академии Морева в Анапе. Запись ребёнка на футбольные тренировки, WhatsApp, Telegram, телефон.",
      },
      { property: "og:title", content: "Контакты · Футбольная академия Морева" },
      { property: "og:description", content: "Свяжитесь с нами для записи ребёнка." },
    ],
  }),
  component: Contacts,
});

const cards = [
  { icon: Phone, label: "Телефон", value: "+7 (918) 000-00-00", href: "tel:+79180000000" },
  { icon: MessageCircle, label: "WhatsApp", value: "Написать", href: "https://wa.me/79180000000", external: true },
  { icon: Send, label: "Telegram", value: "Написать", href: "https://t.me/fam_anapa", external: true },
  { icon: MapPin, label: "Адрес", value: "Анапа · Карта", href: "https://yandex.ru/maps/?text=Анапа%2C%20стадион%20Спартак", external: true },
];

function Contacts() {
  return (
    <div className="pb-safe-nav lg:pb-0">
      {/* HERO */}
      <section className="relative bg-night text-white pt-24 lg:pt-32 pb-12 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 pitch-lines opacity-25" />
        <div className="absolute -top-32 right-0 h-[400px] w-[400px] bg-royal/30 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="text-[11px] uppercase tracking-[0.18em] text-flame font-semibold">Контакты</div>
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

      {/* CARDS */}
      <section className="bg-background py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-3">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.05}>
                <a href={c.href} target={(c as any).external ? "_blank" : undefined} rel={(c as any).external ? "noreferrer" : undefined} className="group flex items-center gap-4 p-5 rounded-2xl border border-line bg-surface hover:bg-night hover:text-white hover:border-night transition active:scale-[0.99]">
                  <span className="h-12 w-12 rounded-xl bg-night/5 group-hover:bg-white/10 flex items-center justify-center text-flame shrink-0">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.2em] opacity-60">{c.label}</span>
                    <span className="block font-display text-xl tracking-wide truncate">{c.value}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:text-flame group-hover:translate-x-0.5 transition" />
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="tel:+79000000000" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-xs shadow-flame">
              <Phone className="h-4 w-4" /> Позвонить
            </a>
            <a href="https://wa.me/79000000000" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-line text-deep font-semibold uppercase tracking-wider text-xs hover:bg-surface transition">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href="https://t.me/" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-line text-deep font-semibold uppercase tracking-wider text-xs hover:bg-surface transition">
              <Send className="h-4 w-4" /> Telegram
            </a>
          </div>
        </div>
      </section>

      {/* MAP + CTA */}
      <section className="bg-surface py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid md:grid-cols-12 gap-6">
          <div id="map" className="md:col-span-7 relative rounded-2xl overflow-hidden border border-line h-[320px] md:h-[420px] bg-night">
            <iframe
              title="Карта Анапа"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.30%2C44.87%2C37.40%2C44.93&layer=mapnik&marker=44.8946%2C37.3163"
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          </div>

          <div className="md:col-span-5 rounded-2xl bg-night text-white p-7 md:p-9 relative overflow-hidden border border-white/5 flex flex-col justify-between gap-6">
            <div className="absolute inset-0 pitch-lines opacity-20" />
            <div className="absolute -top-24 -right-24 h-64 w-64 bg-flame/15 blur-3xl rounded-full" />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Заявка</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">Записать ребёнка</h2>
              <p className="mt-3 text-white/65 text-sm">
                Оставьте заявку · подберём подходящую группу и расписание.
              </p>
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
