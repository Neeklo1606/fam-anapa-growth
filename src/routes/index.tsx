import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, HeartHandshake, Users, Brain, Activity, Star, Trophy, Clock, MapPin } from "lucide-react";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";
import { Reveal } from "@/components/site/Reveal";
import { ContactForm } from "@/components/site/ContactForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FAM — Детская футбольная академия в Анапе" },
      { name: "description", content: "Бережное развитие детей через футбол. Профессиональные тренеры, безопасная среда, программы для возрастов 4–14 лет в Анапе." },
      { property: "og:title", content: "FAM — Детская футбольная академия в Анапе" },
      { property: "og:description", content: "Где ребёнка понимают и бережно развивают." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Intro />
      <WhoFor />
      <WhatWeDevelop />
      <About />
      <Coaches />
      <Gallery />
      <Principles />
      <Schedule />
      <SeoText />
      <FinalCTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-background" />
      <div className="relative mx-auto max-w-6xl px-5 pt-12 md:pt-20 pb-16 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-brand-deep text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Анапа · 4–14 лет
          </span>
          <h1 className="mt-5 font-display text-4xl md:text-6xl font-extrabold leading-[1.05] text-brand-deep">
            Где ребёнка <br />
            <span className="text-gradient-brand">понимают и бережно развивают</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-md">
            Football Academy Morev — место, где футбол становится частью характера, тела и уверенности вашего ребёнка.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#cta" className="group inline-flex items-center gap-2 px-6 h-12 rounded-full bg-gradient-brand text-primary-foreground font-medium shadow-elevated hover:scale-[1.02] transition">
              Записаться на пробное
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <Link to="/contacts" className="inline-flex items-center gap-2 px-6 h-12 rounded-full border border-border bg-background hover:bg-secondary transition font-medium">
              Контакты
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Безопасная среда</div>
            <div className="flex items-center gap-2"><Star className="h-4 w-4 text-brand" /> Опытные тренеры</div>
          </div>
        </Reveal>

        <Reveal delay={0.1} y={24}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-brand opacity-10 blur-3xl rounded-[40px]" />
            <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-border">
              <img src={hero} alt="Юный футболист на тренировке академии FAM в Анапе" width={1600} height={1200} className="w-full h-[480px] md:h-[560px] object-cover" />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-[260px] bg-background border border-border rounded-2xl p-4 shadow-elevated">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <div className="text-sm font-semibold">200+ детей</div>
                  <div className="text-xs text-muted-foreground">тренируются с нами</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:py-24 text-center">
      <Reveal>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-deep">
          Детская футбольная академия в Анапе
        </h2>
        <p className="mt-5 text-muted-foreground leading-relaxed">
          Мы создаём пространство, где футбол — не давление и не соревнование «во что бы то ни стало», а способ
          расти: физически, эмоционально и социально. Программа построена на современной методике детского развития
          и индивидуальном внимании к каждому ребёнку.
        </p>
      </Reveal>
    </section>
  );
}

const whoFor = [
  { icon: Sparkles, title: "Первые шаги", text: "Дети 4–6 лет: знакомство с мячом через игру." },
  { icon: Users, title: "Командная игра", text: "7–10 лет: техника, координация, дружба." },
  { icon: Activity, title: "Серьёзная подготовка", text: "11–14 лет: тактика, скорость, выносливость." },
  { icon: HeartHandshake, title: "Для родителей", text: "Прозрачность, отчёты и спокойствие за ребёнка." },
];

function WhoFor() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-wider text-brand font-medium">Для кого</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-deep">
              Программа подходит каждому ребёнку
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whoFor.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <div className="h-full bg-background rounded-3xl p-6 border border-border shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition duration-300">
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
                  <c.icon className="h-6 w-6 text-brand" />
                </div>
                <div className="mt-5 font-semibold text-brand-deep">{c.title}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Activity, title: "Тело", text: "Координация, осанка, выносливость, скорость реакции." },
  { icon: Brain, title: "Мышление", text: "Игровое мышление, концентрация, принятие решений." },
  { icon: Users, title: "Характер", text: "Командность, ответственность, уверенность в себе." },
  { icon: HeartHandshake, title: "Эмоции", text: "Умение проигрывать, радоваться, поддерживать." },
];

function WhatWeDevelop() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal>
        <div className="text-xs uppercase tracking-wider text-brand font-medium">Что мы развиваем</div>
        <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-deep max-w-2xl">
          Футбол как способ вырасти сильным и цельным
        </h2>
      </Reveal>
      <div className="mt-12 grid md:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.05}>
            <div className="group flex gap-5 p-6 md:p-8 rounded-3xl border border-border bg-background hover:border-brand-bright/40 transition">
              <div className="shrink-0 h-14 w-14 rounded-2xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-soft">
                <f.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display font-semibold text-lg text-brand-deep">{f.title}</div>
                <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">{f.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
        <Reveal className="md:col-span-5">
          <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-border">
            <img src={g2} alt="Тренер общается с юным футболистом" loading="lazy" width={1024} height={1024} className="w-full h-[420px] object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-7">
          <div className="text-xs uppercase tracking-wider text-brand font-medium">Об академии</div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-deep">
            Спокойное место, где футбол говорит на языке ребёнка
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            FAM создан для того, чтобы каждый ребёнок чувствовал себя увиденным. Мы не делаем чемпионов любой ценой —
            мы создаём фундамент: уверенность, технику и любовь к движению. Тренировки построены на современной
            методике, понятной структуре занятий и тёплой атмосфере.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { n: "8+", t: "лет опыта" },
              { n: "200+", t: "учеников" },
              { n: "5", t: "возрастных групп" },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl bg-background border border-border p-4">
                <div className="font-display text-2xl font-bold text-gradient-brand">{s.n}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.t}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const coaches = [
  { name: "Александр Морев", role: "Главный тренер · Основатель", img: g2 },
  { name: "Дмитрий К.", role: "Тренер группы 7–10", img: g6 },
  { name: "Иван С.", role: "Тренер группы 11–14", img: g5 },
];

function Coaches() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal>
        <div className="text-xs uppercase tracking-wider text-brand font-medium">Тренеры</div>
        <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-deep max-w-2xl">
          Люди, которым можно доверить ребёнка
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Наши тренеры — это не только спортивный опыт, но и педагогическая чуткость. Каждый прошёл подготовку и работает по единым принципам академии.
        </p>
      </Reveal>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coaches.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.05}>
            <div className="group rounded-3xl overflow-hidden border border-border bg-background shadow-soft hover:shadow-elevated transition">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={c.img} alt={c.name} loading="lazy" width={1024} height={1280} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
              </div>
              <div className="p-5">
                <div className="font-display font-semibold text-brand-deep">{c.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{c.role}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  const imgs = [g1, g4, g3, g5, g6, g2];
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="text-xs uppercase tracking-wider text-brand font-medium">Атмосфера</div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-deep">Моменты с тренировок</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {imgs.map((src, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl border border-border ${i % 5 === 0 ? "md:row-span-2 aspect-[3/4] md:aspect-auto md:h-full" : "aspect-square"}`}>
                <img src={src} alt={`Тренировка FAM ${i + 1}`} loading="lazy" width={1024} height={1024} className="w-full h-full object-cover hover:scale-[1.04] transition duration-500" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const principles = [
  { n: "01", t: "Безопасность", d: "Здоровье и эмоциональный комфорт всегда на первом месте." },
  { n: "02", t: "Индивидуальность", d: "Каждый ребёнок развивается в своём темпе." },
  { n: "03", t: "Уважение", d: "Ровное отношение, без давления и сравнений." },
  { n: "04", t: "Прозрачность", d: "Родители видят прогресс и понимают программу." },
];

function Principles() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal>
        <div className="text-xs uppercase tracking-wider text-brand font-medium">Принципы</div>
        <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-deep max-w-2xl">
          На чём держится академия
        </h2>
      </Reveal>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {principles.map((p, i) => (
          <Reveal key={p.t} delay={i * 0.05}>
            <div className="h-full p-7 rounded-3xl bg-gradient-to-b from-secondary to-background border border-border">
              <div className="font-display text-3xl text-brand-bright/60 font-bold">{p.n}</div>
              <div className="mt-4 font-semibold text-brand-deep text-lg">{p.t}</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const groups = [
  { name: "Малыши", age: "4–6 лет", days: "Вт · Чт · Сб", time: "16:30 — 17:30" },
  { name: "Юниоры", age: "7–10 лет", days: "Пн · Ср · Пт", time: "17:30 — 19:00" },
  { name: "Старшая группа", age: "11–14 лет", days: "Пн · Ср · Пт", time: "19:00 — 20:30" },
];

function Schedule() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="text-xs uppercase tracking-wider text-brand font-medium">Расписание</div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-deep">Группы и время занятий</h2>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {groups.map((g, i) => (
            <Reveal key={g.name} delay={i * 0.05}>
              <div className="h-full p-7 rounded-3xl bg-background border border-border shadow-soft">
                <div className="text-sm text-brand font-medium">{g.age}</div>
                <div className="mt-2 font-display text-xl font-bold text-brand-deep">{g.name}</div>
                <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> {g.time}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" /> {g.days}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeoText() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 md:py-28">
      <Reveal>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-deep">
          Футбольная школа в Анапе для детей и подростков
        </h2>
        <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Football Academy Morev приглашает детей от 4 до 14 лет на регулярные тренировки в Анапе. Мы делаем
            футбольное образование доступным, безопасным и понятным для родителей.
          </p>
          <p>
            Программа включает физическую подготовку, технику владения мячом, тактическое мышление и развитие
            командных качеств. Подход выстроен с учётом возраста: малыши играют, юниоры учатся, старшие — соревнуются.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="mx-auto max-w-6xl px-5 pb-10 md:pb-20">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-brand p-8 md:p-14 text-primary-foreground">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold leading-tight">
              Запишите ребёнка на бесплатное пробное занятие
            </h2>
            <p className="mt-4 text-white/80 max-w-md">
              Мы перезвоним, ответим на вопросы и подберём удобную группу. Без обязательств.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-background text-foreground rounded-2xl p-5 md:p-6 shadow-elevated">
              <ContactForm compact />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
