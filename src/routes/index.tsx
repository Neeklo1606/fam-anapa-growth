import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Send,
  Play,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import hero from "@/assets/hero-kid.jpg";
import { HeroVideo } from "@/components/site/HeroVideo";

import pDribble from "@/assets/p-dribble.jpg";
import pBall from "@/assets/p-ball.jpg";
import pKick from "@/assets/p-kick.jpg";
import coachGubin from "@/assets/coach-gubin.jpg";
import famTeamDiplomas from "@/assets/fam-team-diplomas.jpg";
import famTraining from "@/assets/fam-training.jpg";
import famTeamFlag from "@/assets/fam-team-flag.jpg";
import famCupNight from "@/assets/fam-cup-night.jpg";
import famCupCelebration from "@/assets/fam-cup-celebration.jpg";
import { Reveal } from "@/components/site/Reveal";
import { ApplyButton } from "@/components/site/ApplyModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Футбольная академия Морева в Анапе — футбол для детей" },
      {
        name: "description",
        content:
          "Футбольная школа в Анапе для детей от 4 до 14 лет. Тренировки, команда, дисциплина и уверенность через футбол. Школа вратарей и тренерский штаб академии Морева.",
      },
      { property: "og:title", content: "Футбольная академия Морева в Анапе" },
      { property: "og:description", content: "Футбольная школа в Анапе для детей от 4 до 14 лет." },
      { property: "og:image", content: hero },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="overflow-hidden pb-safe-nav lg:pb-0">
      <Hero />
      <About />
      <GoalkeeperSchool />
      <Principles />
      <Coaches />
      <Location />
      <Contacts />
    </div>
  );
}

/* ============================ HERO ============================ */
function Hero() {
  return (
    <section className="relative min-h-[100svh] bg-night text-white overflow-hidden flex items-center">
      <div className="absolute inset-0">
        <HeroVideo
          videoSrc="/hero.mp4"
          posterSrc={hero}
          alt="Футбольная академия Морева в Анапе"
          objectPosition="65% center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/50 to-night lg:from-night/90 lg:via-night/40 lg:to-night/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/80 via-night/20 to-transparent lg:from-night/95 lg:via-night/30" />
        <div className="absolute inset-0 pitch-lines opacity-25" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-8 pt-24 lg:pt-32 pb-24 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-flame font-semibold mb-4">
            FAM · Анапа
          </div>
          <h1
            className="font-display tracking-tight text-white"
            style={{ fontSize: "clamp(2.4rem, 11vw, 7.5rem)", lineHeight: 0.92 }}
          >
            Футбольная <br />
            академия <br />
            <span className="text-gradient-brand">Морева</span>
          </h1>

          <p className="mt-5 max-w-[22rem] lg:max-w-xl text-[15px] lg:text-xl text-white/85 leading-snug">
            Футбольная школа в Анапе для детей от 4 до 14 лет.
          </p>
          <p className="mt-2 max-w-[22rem] lg:max-w-xl text-[13px] lg:text-base text-white/55 leading-snug">
            Тренировки, команда, дисциплина и уверенность через футбол.
          </p>

          <div className="mt-7 lg:mt-9">
            <ApplyButton>Записаться на тренировку</ApplyButton>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/40"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-8 w-px bg-white/30"
        />
      </motion.div>
    </section>
  );
}

/* ============================ ABOUT ============================ */
function About() {
  return (
    <section
      id="about"
      className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5"
    >
      <div className="absolute inset-0 pitch-lines opacity-20" />
      <div className="absolute -top-32 right-0 h-[500px] w-[500px] bg-royal/30 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Visual */}
          <Reveal y={20} className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-night ring-1 ring-white/10">
              <img
                src={famTeamFlag}
                alt="Команда футбольной академии Морева в Анапе"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
              <div className="absolute inset-0 pitch-lines opacity-15 mix-blend-overlay" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-flame">FAM · Команда</div>
                  <div className="font-display text-2xl md:text-3xl mt-1">Анапа · Россия</div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <Reveal>
              <div className="text-[11px] uppercase tracking-[0.3em] text-flame font-semibold">
                01 — Об академии
              </div>
              <h2
                className="mt-4 font-display tracking-tight"
                style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
              >
                Об <span className="text-gradient-brand">Академии</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-white/75 text-base md:text-lg leading-relaxed max-w-xl">
                Футбольная академия Морева — детская футбольная среда в Анапе, где тренировки строятся
                вокруг интереса к игре, дисциплины, командной атмосферы и постепенного развития ребёнка.
              </p>
              <p className="mt-4 text-white/55 text-sm md:text-base leading-relaxed max-w-xl">
                Название академии сохраняет память и уважение к Мореву. Сегодня команда продолжает развивать
                футбольное дело и создавать место, куда дети приходят с интересом.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ApplyButton>Оставить заявку</ApplyButton>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ GOALKEEPER SCHOOL ============================ */
function GoalkeeperSchool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.muted = false;
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="relative bg-background py-16 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="text-[11px] uppercase tracking-[0.3em] text-flame font-semibold">
                02 — Направление
              </div>
              <h2
                className="mt-4 font-display tracking-tight text-deep"
                style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
              >
                Школа <br />
                <span className="text-gradient-brand">вратарей</span>
              </h2>
              <p className="mt-6 text-ink/70 text-base md:text-lg leading-relaxed max-w-md">
                Отдельная программа для детей, которые хотят занимать место в воротах. Техника игры,
                реакция, работа с мячом и уверенность под планкой.
              </p>
              <div className="mt-7">
                <ApplyButton>Записаться на тренировку</ApplyButton>
              </div>
            </Reveal>
          </div>

          <Reveal y={20} delay={0.1} className="lg:col-span-7">
            <button
              type="button"
              onClick={togglePlay}
              className="group relative block w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-night shadow-elevated"
            >
              <video
                ref={videoRef}
                src="/hero.mp4"
                poster={famCupNight}
                playsInline
                loop
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent transition-opacity duration-500 ${playing ? "opacity-30" : "opacity-100"}`} />
              <AnimatePresence>
                {!playing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="relative flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-flame/40 blur-2xl scale-150" />
                      <span className="relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-flame text-white flex items-center justify-center shadow-flame group-hover:scale-110 transition">
                        <Play className="h-8 w-8 md:h-10 md:w-10 ml-1" fill="white" />
                      </span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/70">FAM · Goalkeeper</div>
                  <div className="font-display text-xl md:text-2xl mt-1 text-white">Школа вратарей</div>
                </div>
              </div>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================ PRINCIPLES ============================ */
const principles = [
  {
    n: "01",
    title: "Дисциплина",
    text: "Каждое занятие выстроено вокруг внимания, режима и уважения к команде, тренеру и сопернику.",
  },
  {
    n: "02",
    title: "Техника",
    text: "Базовая работа с мячом — приём, передача, ведение и удар — основа любой игры на поле.",
  },
  {
    n: "03",
    title: "Командная игра",
    text: "Учимся видеть партнёра, понимать движение и принимать решения вместе.",
  },
  {
    n: "04",
    title: "Характер",
    text: "Игра помогает становиться увереннее, держать борьбу и не сдаваться при ошибках.",
  },
  {
    n: "05",
    title: "Радость от футбола",
    text: "Главное — чтобы ребёнок ждал тренировку и приходил на поле с интересом.",
  },
];

function Principles() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 pitch-lines opacity-15" />
      <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] bg-flame/15 blur-[140px] rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.3em] text-flame font-semibold">
            03 — Принципы
          </div>
          <h2
            className="mt-4 font-display tracking-tight"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
          >
            Наши <span className="text-gradient-brand">принципы</span>
          </h2>
          <p className="mt-5 text-white/60 max-w-xl text-base md:text-lg">
            Что для нас важно в работе с детьми и в подходе к игре.
          </p>
        </Reveal>

        <div className="mt-10 md:mt-14 divide-y divide-white/10 border-y border-white/10">
          {principles.map((p, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={p.title} delay={i * 0.04}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left py-6 md:py-8 flex items-center gap-4 md:gap-8 group"
                >
                  <div className={`text-[11px] md:text-sm font-mono tracking-wider transition ${isOpen ? "text-flame" : "text-white/35"}`}>
                    {p.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-display tracking-tight transition ${isOpen ? "text-white" : "text-white/85 group-hover:text-white"}`}
                      style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.5rem)", lineHeight: 1.05 }}
                    >
                      {p.title}
                    </div>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="mt-4 max-w-2xl text-white/65 text-sm md:text-base leading-relaxed">
                            {p.text}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full border flex items-center justify-center transition ${isOpen ? "bg-flame border-flame text-white" : "border-white/20 text-white/70 group-hover:border-white/50"}`}
                  >
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================ COACHES ============================ */
const coachList = [
  {
    name: "Губин Алексей Олегович",
    role: "Главный тренер",
    info: "Тренер футбольной академии Морева. Работает с детскими группами, развивает технику и игровое мышление.",
    img: coachGubin,
  },
  {
    name: "Тренерский состав",
    role: "Полевые тренеры",
    info: "Команда тренеров академии работает с детскими группами от 4 до 14 лет.",
    img: famTraining,
  },
  {
    name: "Школа вратарей",
    role: "Goalkeeper coach",
    info: "Отдельная программа подготовки вратарей под руководством профильного тренера.",
    img: famCupCelebration,
  },
];

function Coaches() {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: false, dragFree: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    if (!embla) return;
    const update = () => {
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    update();
    embla.on("select", update);
    embla.on("reInit", update);
  }, [embla]);

  return (
    <section className="relative bg-background py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-flame font-semibold">
                04 — Тренеры
              </div>
              <h2
                className="mt-4 font-display tracking-tight text-deep"
                style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
              >
                Тренерский <br className="md:hidden" /> <span className="text-gradient-brand">штаб</span>
              </h2>
              <p className="mt-4 text-ink/65 max-w-md text-base md:text-lg">
                Тренеры академии работают с детскими группами и помогают каждому ребёнку расти на поле.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => embla?.scrollPrev()}
                disabled={!canPrev}
                className="h-12 w-12 rounded-full border border-ink/15 text-ink hover:bg-ink hover:text-white transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink flex items-center justify-center"
                aria-label="Назад"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => embla?.scrollNext()}
                disabled={!canNext}
                className="h-12 w-12 rounded-full border border-ink/15 text-ink hover:bg-ink hover:text-white transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink flex items-center justify-center"
                aria-label="Далее"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 md:mt-14 -mx-5 lg:mx-0">
          <div className="overflow-hidden px-5 lg:px-0" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {coachList.map((c, i) => (
                <div
                  key={c.name}
                  className="shrink-0 w-[78%] sm:w-[55%] md:w-[42%] lg:w-[32%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group relative rounded-3xl overflow-hidden bg-night text-white aspect-[3/4] hover:shadow-elevated transition"
                  >
                    <img
                      src={c.img}
                      alt={c.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover object-[center_15%] opacity-85 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-flame font-semibold">{c.role}</div>
                      <div className="mt-2 font-display text-xl md:text-2xl tracking-wide leading-tight">{c.name}</div>
                      <p className="mt-2 text-white/70 text-xs md:text-sm leading-snug">{c.info}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ LOCATION ============================ */
const fieldShots = [
  { src: famTraining, label: "Тренировочное поле" },
  { src: famCupNight, label: "Вечерние занятия" },
  { src: famTeamDiplomas, label: "Награждение" },
  { src: famCupCelebration, label: "Игровой момент" },
  { src: pKick, label: "Работа с мячом" },
  { src: pDribble, label: "Ведение" },
  { src: pBall, label: "Тренировка" },
];

function Location() {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: false });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
  }, [embla]);

  return (
    <section className="relative bg-surface py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="text-[11px] uppercase tracking-[0.3em] text-flame font-semibold">
                05 — Локация
              </div>
              <h2
                className="mt-4 font-display tracking-tight text-deep"
                style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
              >
                Где мы <br />
                <span className="text-gradient-brand">тренируемся</span>
              </h2>
              <p className="mt-6 text-ink/70 text-base md:text-lg leading-relaxed max-w-md">
                Тренировки проходят в Анапе на профессиональном футбольном поле с искусственным
                покрытием, всё необходимое для занятий рядом.
              </p>

              <div className="mt-7 space-y-3 max-w-md">
                <InfoRow icon={MapPin} label="Адрес" value="Анапа, Краснодарский край" />
                <InfoRow icon={Phone} label="Связь" value="WhatsApp · Telegram" />
              </div>

              <div className="mt-7">
                <ApplyButton>Записаться</ApplyButton>
              </div>
            </Reveal>
          </div>

          <Reveal y={20} delay={0.1} className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden bg-night ring-1 ring-ink/10">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {fieldShots.map((s) => (
                    <div key={s.label} className="shrink-0 w-full relative aspect-[4/3] md:aspect-[16/10]">
                      <img src={s.src} alt={s.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 text-white">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-flame">FAM · Поле</div>
                        <div className="mt-1 font-display text-xl md:text-2xl">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => embla?.scrollPrev()}
                  className="h-10 w-10 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25 transition flex items-center justify-center"
                  aria-label="Назад"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => embla?.scrollNext()}
                  className="h-10 w-10 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25 transition flex items-center justify-center"
                  aria-label="Далее"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {fieldShots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => embla?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-flame" : "w-1.5 bg-white/40"}`}
                    aria-label={`Слайд ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mt-4 relative rounded-3xl overflow-hidden border border-ink/10 h-[260px] md:h-[300px] bg-night">
              <iframe
                title="Карта · Анапа"
                src="https://www.openstreetmap.org/export/embed.html?bbox=37.30%2C44.87%2C37.40%2C44.93&layer=mapnik&marker=44.8946%2C37.3163"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-11 w-11 rounded-xl bg-ink/5 flex items-center justify-center text-flame shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.25em] text-ink/45">{label}</div>
        <div className="font-display text-lg tracking-wide text-deep">{value}</div>
      </div>
    </div>
  );
}

/* ============================ CONTACTS ============================ */
function Contacts() {
  return (
    <section
      id="contacts"
      className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5"
    >
      <div className="absolute inset-0 pitch-lines opacity-20" />
      <div className="absolute inset-0 bg-gradient-pitch" />

      <div className="relative mx-auto max-w-5xl px-5 lg:px-8 text-center">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.3em] text-flame font-semibold">
            06 — Запись
          </div>
          <h2
            className="mt-4 font-display tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 7vw, 5.5rem)", lineHeight: 0.95 }}
          >
            Записаться на <br />
            <span className="text-gradient-brand">тренировку</span>
          </h2>
          <p className="mt-6 text-white/65 max-w-xl mx-auto text-base md:text-lg">
            Оставьте заявку — поможем подобрать группу и подскажем расписание.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex justify-center">
            <ApplyButton>Записать ребёнка</ApplyButton>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            <ContactCard icon={Phone} label="Телефон" value="Скоро" href="#" />
            <ContactCard icon={MessageCircle} label="WhatsApp" value="Написать" href="https://wa.me/79000000000" />
            <ContactCard icon={Send} label="Telegram" value="Написать" href="https://t.me/" />
            <ContactCard icon={MapPin} label="Адрес" value="Анапа" href="#map" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: any;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.07] hover:border-white/20 transition"
    >
      <span className="h-11 w-11 rounded-xl bg-white/8 flex items-center justify-center text-flame shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</span>
        <span className="block font-display text-lg tracking-wide group-hover:text-flame transition">{value}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-flame transition" />
    </a>
  );
}
