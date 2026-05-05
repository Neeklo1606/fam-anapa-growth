import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Send, MapPin, Clock } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ContactForm } from "@/components/site/ContactForm";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Контакты футбольной академии Морева в Анапе" },
      {
        name: "description",
        content:
          "Контакты футбольной академии Морева в Анапе. Запись ребёнка на футбольные тренировки, уточнение расписания и групп.",
      },
      { property: "og:title", content: "Контакты — Футбольная академия Морева" },
      { property: "og:description", content: "Свяжитесь с нами для записи ребёнка на тренировки." },
    ],
  }),
  component: Contacts,
});

const cards = [
  { icon: Phone, label: "Телефон", value: "+7 (900) 000-00-00", href: "tel:+79000000000" },
  { icon: MessageCircle, label: "WhatsApp", value: "Написать в WhatsApp", href: "https://wa.me/79000000000" },
  { icon: Send, label: "Telegram", value: "Написать в Telegram", href: "https://t.me/" },
  { icon: MapPin, label: "Адрес", value: "Анапа · уточняется", href: "#map" },
];

function Contacts() {
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-night text-white pt-32 lg:pt-40 pb-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 pitch-lines opacity-25" />
        <div className="absolute -top-32 right-0 h-[500px] w-[500px] bg-royal/30 blur-[120px] rounded-full" />
        <div className="absolute right-[-2rem] bottom-[-3rem] hidden md:block font-display text-[16rem] leading-[0.85] text-white/[0.05] tracking-tighter select-none pointer-events-none">
          FAM
        </div>

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Контакты</div>
            <h1 className="mt-5 font-display text-5xl md:text-7xl lg:text-8xl tracking-tight max-w-4xl">
              Контакты футбольной <br /> академии Морева
            </h1>
            <p className="mt-7 text-lg text-white/70 max-w-2xl leading-relaxed">
              Свяжитесь с нами, чтобы уточнить расписание, возрастные группы и записать ребёнка на тренировку.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CARDS */}
      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.05}>
                <a href={c.href} className="group block h-full p-7 rounded-2xl bg-night text-white hover:-translate-y-1 transition duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 pitch-lines opacity-20" />
                  <div className="absolute -bottom-16 -right-16 h-48 w-48 bg-flame/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="relative">
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-flame">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-7 text-[10px] uppercase tracking-[0.2em] text-white/50">{c.label}</div>
                    <div className="mt-2 font-display text-xl tracking-wide">{c.value}</div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MAP + FORM */}
      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid md:grid-cols-12 gap-6">
          <Reveal className="md:col-span-6">
            <div id="map" className="relative rounded-2xl overflow-hidden border border-line h-[480px] bg-night">
              <iframe
                title="Карта Анапа"
                src="https://www.openstreetmap.org/export/embed.html?bbox=37.30%2C44.87%2C37.40%2C44.93&layer=mapnik&marker=44.8946%2C37.3163"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
              />
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-ink/60">
              <Clock className="h-4 w-4 text-flame" />
              Пн–Сб · 09:00 — 21:00
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-6">
            <div className="rounded-2xl bg-night text-white p-7 lg:p-9 relative overflow-hidden">
              <div className="absolute inset-0 pitch-lines opacity-20" />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Заявка</div>
                <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-wide">Записать ребёнка</h2>
                <p className="mt-3 text-white/65 text-sm">Перезвоним и подскажем подходящую группу.</p>
                <div className="mt-7">
                  <ContactForm dark />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
