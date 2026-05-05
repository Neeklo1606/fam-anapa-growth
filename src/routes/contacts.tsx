import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ContactForm } from "@/components/site/ContactForm";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Контакты — FAM, футбольная академия в Анапе" },
      { name: "description", content: "Свяжитесь с Football Academy Morev: телефон, e-mail, адрес в Анапе и форма записи на пробное занятие." },
      { property: "og:title", content: "Контакты — FAM, футбольная академия в Анапе" },
      { property: "og:description", content: "Запишитесь на бесплатное пробное занятие в FAM." },
    ],
  }),
  component: Contacts,
});

const cards = [
  { icon: Phone, title: "Позвонить", value: "+7 (900) 000-00-00", href: "tel:+79000000000" },
  { icon: Mail, title: "Написать", value: "hello@fam-anapa.ru", href: "mailto:hello@fam-anapa.ru" },
  { icon: MapPin, title: "Адрес", value: "г. Анапа, спорткомплекс «Олимп»", href: "#map" },
  { icon: Clock, title: "Часы работы", value: "Пн–Сб · 09:00 — 21:00", href: "#" },
];

function Contacts() {
  return (
    <div>
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 pt-12 md:pt-20 pb-14">
          <Reveal>
            <div className="text-xs uppercase tracking-wider text-brand font-medium">Контакты</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-extrabold text-brand-deep max-w-2xl">
              Мы рядом — напишите или позвоните
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Расскажем о программе, ответим на вопросы и поможем выбрать группу. Без давления и навязывания.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <a
                href={c.href}
                className="block h-full p-6 rounded-3xl bg-background border border-border shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition duration-300"
              >
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
                  <c.icon className="h-6 w-6 text-brand" />
                </div>
                <div className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{c.title}</div>
                <div className="mt-1 font-semibold text-brand-deep">{c.value}</div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 grid md:grid-cols-2 gap-6">
        <Reveal>
          <div id="map" className="relative rounded-3xl overflow-hidden border border-border shadow-soft h-[420px] bg-secondary">
            <iframe
              title="Карта Анапа"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.30%2C44.87%2C37.40%2C44.93&layer=mapnik&marker=44.8946%2C37.3163"
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-full p-6 md:p-8 rounded-3xl bg-background border border-border shadow-soft">
            <h2 className="font-display text-2xl font-bold text-brand-deep">Записаться на пробное</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Оставьте заявку — перезвоним в течение дня и подберём удобное время.
            </p>
            <div className="mt-6">
              <ContactForm compact />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
