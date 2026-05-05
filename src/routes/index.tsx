import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Send,
  Target,
  Brain,
  Shield,
  Flame,
  Users,
  Trophy,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import action1 from "@/assets/action1.jpg";
import pDribble from "@/assets/p-dribble.jpg";
import pCoach from "@/assets/p-coach.jpg";
import pTeam from "@/assets/p-team.jpg";
import pBall from "@/assets/p-ball.jpg";
import pCelebrate from "@/assets/p-celebrate.jpg";
import pKick from "@/assets/p-kick.jpg";
import pGubin from "@/assets/p-gubin.jpg";
import { Reveal } from "@/components/site/Reveal";
import { JoinFlow } from "@/components/site/JoinFlow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Футбольная академия Морева в Анапе — футбол для детей" },
      {
        name: "description",
        content:
          "Детская футбольная академия Морева в Анапе. Тренировки по футболу для детей, развитие техники, координации, дисциплины и уверенности на поле. Запись на занятия.",
      },
      { property: "og:title", content: "Футбольная академия Морева в Анапе" },
      { property: "og:description", content: "Футбол для детей в Анапе. Техника, координация, командная игра." },
      { property: "og:image", content: hero },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Marquee />
      <Intro />
      <WhoFor />
      <Develop />
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

/* ============================ HERO ============================ */
function Hero() {
  return (
    <section className="relative min-h-[100svh] bg-night text-white overflow-hidden">
      <div className="absolute inset-0">
        <img src={pKick} alt="Юный футболист на поле академии Морева" className="w-full h-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/95 via-night/40 to-transparent" />
        <div className="absolute inset-0 pitch-lines opacity-30" />
      </div>

      {/* huge background type */}
      <div className="absolute right-[-2rem] top-24 hidden md:block font-display text-[18rem] xl:text-[24rem] leading-[0.85] text-white/[0.05] tracking-tighter select-none pointer-events-none">
        FAM
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-32 lg:pt-40 pb-24 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] uppercase tracking-[0.18em] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-flame animate-pulse" />
            Детская футбольная академия · Анапа
          </div>

          <h1 className="mt-6 font-display text-[14vw] sm:text-7xl lg:text-[8.5rem] leading-[0.85] tracking-tight">
            Футбольная <br />
            академия <br />
            <span className="text-gradient-brand">Морева</span>
          </h1>

          <p className="mt-7 max-w-xl text-base lg:text-lg text-white/75 leading-relaxed">
            Футбольные тренировки для детей с акцентом на технику, координацию,
            игровое мышление и уверенность на поле.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#cta"
              className="group inline-flex items-center gap-3 pl-6 pr-2 h-14 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-sm shadow-flame hover:brightness-110 transition"
            >
              Записать ребёнка
              <span className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center transition group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
            <a
              href="#schedule"
              className="inline-flex items-center gap-2 h-14 px-7 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold uppercase tracking-wider text-sm hover:bg-white/10 transition"
            >
              Смотреть расписание
            </a>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 max-w-3xl">
            {[
              { k: "Анапа", v: "Локация" },
              { k: "4–14", v: "Возраст" },
              { k: "Группы", v: "Детские" },
              { k: "Техника", v: "Игра · Дисциплина" },
            ].map((it) => (
              <div key={it.k} className="border-l border-white/15 pl-4">
                <div className="font-display text-2xl lg:text-3xl tracking-wide">{it.k}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/50 mt-1">{it.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ MARQUEE ============================ */
function Marquee() {
  const items = ["Техника", "★", "Координация", "★", "Игровое мышление", "★", "Дисциплина", "★", "Уверенность", "★", "Командность", "★"];
  const row = [...items, ...items];
  return (
    <section className="relative bg-night text-white border-y border-white/10 py-5 overflow-hidden">
      <div className="marquee-mask">
        <div className="flex gap-10 whitespace-nowrap animate-marquee w-max font-display text-2xl tracking-wide uppercase">
          {row.map((t, i) => (
            <span key={i} className={t === "★" ? "text-flame" : "text-white/80"}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ INTRO ============================ */
function Intro() {
  return (
    <section className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid md:grid-cols-12 gap-10 items-end">
        <Reveal className="md:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">01 — Введение</div>
          <h2 className="mt-4 font-display text-5xl md:text-6xl text-deep tracking-tight">
            Футбольная секция <br /> для детей в Анапе
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-7">
          <p className="text-lg text-ink/70 leading-relaxed">
            Если вы ищете футбольную секцию для ребёнка в Анапе, футбольная академия Морева — это место,
            где дети учатся базовой технике, координации, работе с мячом, командному взаимодействию и уверенности на поле.
            Мы создаём понятную, безопасную и мотивирующую среду, в которой ребёнок постепенно развивается и получает удовольствие от футбола.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ WHO FOR ============================ */
const whoFor = [
  { tag: "Старт", title: "Только начинают", text: "Знакомство с мячом, базовые движения, первые игровые ситуации." },
  { tag: "Опыт", title: "Уже занимались", text: "Закрепление техники, ускорение развития и переход к игровому мышлению." },
  { tag: "Форма", title: "Дисциплина и форма", text: "Регулярные тренировки, физическая база и спортивная привычка." },
  { tag: "Среда", title: "Сильная среда", text: "Для родителей, которые ищут серьёзную футбольную школу в Анапе." },
];

function WhoFor() {
  return (
    <section id="training" className="relative bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">02 — Для кого</div>
              <h2 className="mt-4 font-display text-5xl md:text-7xl text-deep tracking-tight">
                Кому подойдут <br /> тренировки
              </h2>
            </div>
            <p className="md:max-w-sm text-ink/60">
              Программа гибкая — от первого касания мяча до серьёзной игровой подготовки.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whoFor.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <div className="group relative h-full bg-night text-white rounded-2xl p-7 overflow-hidden hover:-translate-y-1 transition duration-300">
                <div className="absolute inset-0 pitch-lines opacity-20" />
                <div className="absolute -bottom-20 -right-20 h-56 w-56 bg-royal/40 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-flame font-semibold">{c.tag}</div>
                  <div className="mt-8 font-display text-3xl tracking-wide">{c.title}</div>
                  <p className="mt-3 text-sm text-white/65 leading-relaxed">{c.text}</p>
                  <ChevronRight className="mt-8 h-5 w-5 text-flame" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ DEVELOP ============================ */
const features = [
  { icon: Target, n: "01", title: "Базовая техника", text: "Работа с мячом, удары, приём, ведение, постановка движений." },
  { icon: Flame, n: "02", title: "Координация и движение", text: "Скорость, ловкость, управление телом, реакция." },
  { icon: Brain, n: "03", title: "Игровое мышление", text: "Чтение игры, принятие решений, работа в пространстве." },
  { icon: Shield, n: "04", title: "Дисциплина и уверенность", text: "Концентрация, ответственность, характер игрока." },
];

function Develop() {
  return (
    <section className="relative py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">03 — Программа</div>
          <h2 className="mt-4 font-display text-5xl md:text-7xl text-deep tracking-tight max-w-4xl">
            Что развиваем <br /> на тренировках
          </h2>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-12 gap-4">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 0.05}
              className={i % 2 === 0 ? "md:col-span-7" : "md:col-span-5"}
            >
              <div className="group relative h-full p-8 md:p-10 rounded-2xl border border-line bg-background hover:border-night transition overflow-hidden">
                <div className="absolute top-6 right-7 font-display text-7xl text-surface group-hover:text-flame/15 transition">{f.n}</div>
                <div className="relative">
                  <div className="h-14 w-14 rounded-xl bg-night text-flame flex items-center justify-center">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-6 font-display text-3xl tracking-wide text-deep">{f.title}</div>
                  <p className="mt-3 text-ink/65 leading-relaxed max-w-md">{f.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ ABOUT ============================ */
function About() {
  return (
    <section id="about" className="relative bg-night text-white py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-25" />
      <div className="absolute -top-32 right-0 h-[500px] w-[500px] bg-royal/30 blur-[120px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 grid md:grid-cols-12 gap-12 items-center">
        <Reveal className="md:col-span-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <img src={pTeam} alt="Тренировка футбольной академии Морева в Анапе" loading="lazy" width={1600} height={1024} className="w-full h-[520px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Тренировочный процесс</div>
                <div className="font-display text-3xl mt-1">Команда FAM</div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-flame text-white text-[10px] uppercase tracking-wider font-semibold">Анапа</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">04 — Об академии</div>
          <h2 className="mt-4 font-display text-5xl md:text-6xl tracking-tight">
            Академия, где футбол <br /> начинается с правильной базы
          </h2>
          <p className="mt-6 text-white/70 leading-relaxed">
            Футбольная академия Морева — это детская футбольная среда в Анапе, где тренировки строятся вокруг развития ребёнка,
            уважения к игре и постепенного роста. Наша задача — дать детям крепкую базу, интерес к футболу и уверенность на поле.
          </p>
          <p className="mt-5 text-white/60 leading-relaxed">
            Академия названа в честь Морева. Для нас это имя — часть памяти, уважения и ответственности. Мы продолжаем развивать
            футбольное дело так, чтобы дети приходили на тренировки с интересом, а родители понимали, что ребёнок находится в правильной спортивной среде.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { n: "200+", t: "детей" },
              { n: "4–14", t: "возраст" },
              { n: "5", t: "групп" },
            ].map((s) => (
              <div key={s.t} className="rounded-xl border border-white/10 p-5 bg-white/[0.03]">
                <div className="font-display text-3xl text-gradient-brand">{s.n}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/50 mt-1">{s.t}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ COACHES ============================ */
function Coaches() {
  return (
    <section id="coaches" className="relative py-24 md:py-32 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">05 — Тренер</div>
              <h2 className="mt-4 font-display text-5xl md:text-7xl text-deep tracking-tight">
                Главный тренер <br /> академии
              </h2>
            </div>
            <p className="md:max-w-sm text-ink/60">
              С детьми работает тренер, который помогает не только освоить футбол, но и почувствовать уверенность на поле.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="relative rounded-3xl overflow-hidden bg-night text-white grid md:grid-cols-12 min-h-[560px]">
            {/* Photo */}
            <div className="md:col-span-7 relative">
              <img
                src={pGubin}
                alt="Губин Алексей Олегович — тренер футбольной академии Морева"
                loading="lazy"
                width={1080}
                height={1920}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-night via-night/40 to-transparent" />
              <div className="absolute inset-0 pitch-lines opacity-20 mix-blend-overlay" />
              <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[10px] uppercase tracking-[0.2em] text-white/85">
                Тренер · FAM
              </div>
              <div className="hidden md:block absolute -right-8 bottom-8 font-display text-[10rem] leading-[0.85] text-white/[0.07] tracking-tighter select-none pointer-events-none">
                01
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-5 relative p-8 md:p-12 flex flex-col justify-between gap-10">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Главная фигура академии</div>
                <h3 className="mt-4 font-display text-4xl md:text-5xl tracking-tight leading-[0.95]">
                  Губин <br /> Алексей <br /> Олегович
                </h3>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-flame/15 border border-flame/30 text-flame text-[11px] uppercase tracking-[0.2em] font-semibold">
                  Тренер
                </div>
                <p className="mt-7 text-white/70 leading-relaxed">
                  Отвечает за тренировочный процесс, развитие детских групп и индивидуальный подход к каждому ребёнку.
                  Помогает детям полюбить футбол через правильную базу, технику и уверенность в игре.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: "Техника", v: "База" },
                  { k: "Игра", v: "Мышление" },
                  { k: "Дети", v: "4–14" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="font-display text-xl tracking-wide">{s.k}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1">{s.v}</div>
                  </div>
                ))}
              </div>

              <a
                href="#cta"
                className="self-start inline-flex items-center gap-3 pl-6 pr-2 h-13 py-2 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-sm shadow-flame hover:brightness-110 transition"
              >
                Записаться к тренеру
                <span className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ GALLERY ============================ */
function Gallery() {
  return (
    <section id="gallery" className="relative bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">06 — Галерея</div>
              <h2 className="mt-4 font-display text-5xl md:text-7xl text-deep tracking-tight">Моменты <br /> с тренировок</h2>
            </div>
            <p className="md:max-w-sm text-ink/60">Командное фото, работа с мячом, эмоции после тренировок.</p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-6 grid-rows-2 gap-3 md:gap-4 h-[680px] md:h-[600px]">
          <Tile src={pKick} className="col-span-6 md:col-span-3 row-span-2" caption="Удар" />
          <Tile src={pDribble} className="col-span-3 md:col-span-2" caption="Ведение" />
          <Tile src={pCoach} className="col-span-3 md:col-span-1" caption="Тренер" />
          <Tile src={pBall} className="col-span-2 md:col-span-1" caption="Касание" />
          <Tile src={pTeam} className="col-span-2 md:col-span-1" caption="Команда" />
          <Tile src={pCelebrate} className="col-span-2 md:col-span-1" caption="Эмоции" />
        </div>
      </div>
    </section>
  );
}

function Tile({ src, className = "", caption }: { src: string; className?: string; caption: string }) {
  return (
    <Reveal className={`group relative overflow-hidden rounded-2xl bg-night ${className}`}>
      <img src={src} alt={caption} loading="lazy" width={1024} height={1024} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-[1.05] group-hover:opacity-100 transition duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
        <span className="text-[11px] uppercase tracking-[0.2em] opacity-80">{caption}</span>
        <span className="h-8 w-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-flame">→</span>
      </div>
    </Reveal>
  );
}

/* ============================ PRINCIPLES ============================ */
const principles = [
  { n: "01", t: "Сначала любовь к игре", d: "Интерес к футболу — фундамент роста ребёнка." },
  { n: "02", t: "Правильная база", d: "Техника и движения, на которых строится игра." },
  { n: "03", t: "Командная среда", d: "Атмосфера, в которой хочется тренироваться." },
  { n: "04", t: "Уважение к ребёнку", d: "Без давления, со вниманием к индивидуальности." },
];

function Principles() {
  return (
    <section className="relative py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">07 — Принципы</div>
          <h2 className="mt-4 font-display text-5xl md:text-7xl text-deep tracking-tight max-w-3xl">Наши принципы</h2>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-3">
          {principles.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.05}>
              <div className="group flex items-start gap-6 p-8 lg:p-10 rounded-2xl border border-line bg-surface hover:bg-night hover:text-white transition duration-300">
                <div className="font-display text-5xl lg:text-6xl text-flame/70 group-hover:text-flame transition">{p.n}</div>
                <div>
                  <div className="font-display text-2xl lg:text-3xl tracking-wide text-deep group-hover:text-white transition">{p.t}</div>
                  <p className="mt-2 text-ink/65 group-hover:text-white/70 transition leading-relaxed">{p.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ SCHEDULE ============================ */
const groups = [
  { name: "Младшая группа", age: "4–7 лет", days: "Вт · Чт · Сб", time: "16:30 — 17:30", focus: "Координация и первое касание" },
  { name: "Средняя группа", age: "8–10 лет", days: "Пн · Ср · Пт", time: "17:30 — 19:00", focus: "Техника и игровое мышление" },
  { name: "Старшая группа", age: "11–14 лет", days: "Пн · Ср · Пт", time: "19:00 — 20:30", focus: "Тактика, ОФП, игра" },
  { name: "Индивидуальные", age: "По запросу", days: "По договорённости", time: "Гибко", focus: "Точечная работа над навыком" },
];

function Schedule() {
  return (
    <section id="schedule" className="relative py-24 md:py-32 bg-night text-white overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-25" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-royal/30 blur-[140px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">08 — Расписание</div>
              <h2 className="mt-4 font-display text-5xl md:text-7xl tracking-tight">Группы <br /> и расписание</h2>
            </div>
            <a href="#cta" className="self-start md:self-end inline-flex items-center gap-2 h-12 px-6 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-sm shadow-flame">
              Уточнить расписание <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-4">
          {groups.map((g, i) => (
            <Reveal key={g.name} delay={i * 0.05}>
              <div className="group relative p-7 lg:p-9 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur hover:border-flame/50 transition overflow-hidden">
                <div className="absolute top-6 right-7 font-display text-6xl text-white/[0.06] group-hover:text-flame/20 transition">0{i + 1}</div>
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-flame" />
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">{g.age}</div>
                  </div>
                  <div className="mt-3 font-display text-3xl lg:text-4xl tracking-wide">{g.name}</div>
                  <p className="mt-2 text-white/60 text-sm">{g.focus}</p>
                  <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-white/80"><Clock className="h-4 w-4 text-flame" /> {g.time}</div>
                    <div className="flex items-center gap-2 text-white/80"><MapPin className="h-4 w-4 text-flame" /> {g.days}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ SEO TEXT ============================ */
function SeoText() {
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">09 — Гайд</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl text-deep tracking-tight">
            Футбол для детей в Анапе — <br /> как выбрать секцию
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 space-y-5 text-ink/70 leading-relaxed">
            <p>
              Родители часто ищут футбольный клуб для детей в Анапе, чтобы ребёнок занимался спортом, развивал координацию,
              учился дисциплине и находился в правильной команде. При выборе секции важно обращать внимание не только на расписание,
              но и на тренерский подход, атмосферу, безопасность, понятную коммуникацию и постепенное развитие ребёнка.
            </p>
            <p>
              В футбольной академии Морева тренировки проходят в формате, где ребёнок осваивает базовые футбольные навыки,
              учится работать с мячом, двигаться, принимать решения и играть в команде. Такой подход помогает детям чувствовать
              себя увереннее и получать удовольствие от футбола.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ FINAL CTA ============================ */
function FinalCTA() {
  return (
    <section id="cta" className="relative bg-night text-white py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img src={pCelebrate} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-night via-night/85 to-night" />
      </div>
      <div className="absolute inset-0 pitch-lines opacity-25" />
      <div className="absolute inset-0 bg-gradient-pitch" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 grid md:grid-cols-12 gap-10 lg:gap-14">
        <Reveal className="md:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">10 — Запись</div>
          <h2 className="mt-4 font-display text-5xl md:text-7xl tracking-tight">
            Сделайте первый <br /> шаг в команду
          </h2>
          <p className="mt-6 text-white/70 max-w-md leading-relaxed">
            Несколько простых шагов — и мы подберём подходящую группу, расписание и формат занятий для вашего ребёнка.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="tel:+79000000000" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white/10 border border-white/15 backdrop-blur text-white font-semibold uppercase tracking-wider text-sm hover:bg-white/15 transition">
              <Phone className="h-4 w-4" /> Позвонить
            </a>
            <a href="https://wa.me/79000000000" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/20 bg-white/5 backdrop-blur text-white font-semibold uppercase tracking-wider text-sm hover:bg-white/10 transition">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href="https://t.me/" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/20 bg-white/5 backdrop-blur text-white font-semibold uppercase tracking-wider text-sm hover:bg-white/10 transition">
              <Send className="h-4 w-4" /> Telegram
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3 text-sm text-white/55">
            <Trophy className="h-5 w-5 text-flame" />
            Первое занятие — знакомство с тренером и командой.
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7">
          <div className="relative rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-6 md:p-9 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 bg-flame/20 blur-3xl rounded-full" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-flame/40 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-flame font-semibold">Запись · Интерактивно</div>
                  <div className="font-display text-2xl tracking-wide mt-1">Присоединиться к команде</div>
                </div>
                <div className="hidden sm:flex h-10 px-3 items-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-[0.2em] text-white/60">
                  4 шага
                </div>
              </div>
              <JoinFlow />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
