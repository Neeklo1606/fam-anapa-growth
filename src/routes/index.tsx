import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Send,
  Play,
  MapPin,
} from "lucide-react";
import hero from "@/assets/hero-kid.jpg";

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
import { ApplyButton, useApply } from "@/components/site/ApplyModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Футбольная академия Морева в Анапе — футбол для детей" },
      {
        name: "description",
        content:
          "Футбольная школа в Анапе для детей от 4 до 14 лет. Тренировки, игровые занятия, развитие техники, координации и уверенности. Запись ребёнка на футбол.",
      },
      {
        name: "keywords",
        content:
          "футбольная школа Анапа, футбольная секция Анапа, футбол для детей Анапа, футбольная академия Анапа, детский футбольный клуб Анапа, записать ребёнка на футбол Анапа",
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
      <Marquee />
      <Intro />
      <VideoBlock />
      <PhotoGallery />
      <Training />
      <Coach />
      <About />
      <Groups />
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
        <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/55 to-night lg:from-night lg:via-night/55 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/80 via-night/30 to-transparent lg:from-night/95 lg:via-night/40" />
        <div className="absolute inset-0 pitch-lines opacity-25" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-8 pt-24 lg:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <h1
            className="font-display tracking-tight text-white"
            style={{ fontSize: "clamp(2.4rem, 12vw, 8rem)", lineHeight: 0.92 }}
          >
            Футбольная <br />
            академия <br />
            <span className="text-gradient-brand">Морева</span>
          </h1>

          <p className="mt-5 max-w-[22rem] lg:max-w-xl text-[15px] lg:text-xl text-white/85 leading-snug">
            Футбольная школа в Анапе для детей от 4 до 14 лет.
          </p>
          <p className="mt-2 max-w-[22rem] lg:max-w-xl text-[13px] lg:text-base text-white/60 leading-snug">
            Тренировки, команда, дисциплина и уверенность через футбол.
          </p>

          <div className="mt-7 lg:mt-9">
            <ApplyButton>Записать ребёнка</ApplyButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ MARQUEE ============================ */
function Marquee() {
  const items = ["Техника", "★", "Команда", "★", "Дисциплина", "★", "Игра", "★", "Уверенность", "★", "Анапа", "★"];
  const row = [...items, ...items];
  return (
    <section className="relative bg-night text-white border-y border-white/10 py-4 overflow-hidden">
      <div className="marquee-mask">
        <div className="flex gap-10 whitespace-nowrap animate-marquee w-max font-display text-xl md:text-2xl tracking-wide uppercase">
          {row.map((t, i) => (
            <span key={i} className={t === "★" ? "text-flame" : "text-white/80"}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ INTRO (SEO) ============================ */
function Intro() {
  return (
    <section className="relative bg-background py-14 md:py-24">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Об академии</div>
          <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-5xl text-deep tracking-tight">
            Футбольная секция <br className="hidden sm:block" />для детей в Анапе
          </h2>
          <p className="mt-5 text-base md:text-lg text-ink/70 leading-relaxed">
            Если вы ищете футбольную секцию для ребёнка в Анапе, академия Морева — это место,
            где дети тренируются, учатся работать с мячом, развивают координацию, дисциплину
            и уверенность на поле.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ VIDEO ============================ */
function VideoBlock() {
  return (
    <section className="relative bg-night text-white py-14 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-20" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Видео</div>
              <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-6xl tracking-tight">
                Видео с тренировок
              </h2>
              <p className="mt-3 text-white/60 max-w-xl">
                Атмосфера академии, занятия детей и футбольные моменты.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <button
            type="button"
            className="group relative block w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-night/60"
          >
            <img
              src={famTraining}
              alt="Видео с тренировки футбольной академии Морева"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.02] transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="relative flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-flame/40 blur-2xl scale-150" />
                <span className="relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-flame text-white flex items-center justify-center shadow-flame group-hover:scale-110 transition">
                  <Play className="h-8 w-8 md:h-10 md:w-10 ml-1" fill="white" />
                </span>
              </span>
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">FAM · Видео</div>
                <div className="font-display text-xl md:text-3xl tracking-wide mt-1">Смотреть видео</div>
              </div>
              <div className="hidden sm:block px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[10px] uppercase tracking-wider text-white/80">
                Видеоблог
              </div>
            </div>
          </button>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-flame font-semibold">Видеоблог академии</div>
              <p className="mt-2 text-white/70 text-sm md:text-base">
                Тренировки, турниры, моменты команды и жизнь академии.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/20 text-white text-[12px] uppercase tracking-wider font-semibold hover:bg-white/10 transition self-start sm:self-auto"
            >
              Смотреть <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ PHOTO GALLERY ============================ */
function PhotoGallery() {
  const shots = [
    { src: famTeamFlag, label: "Команда" },
    { src: famTraining, label: "Тренировка" },
    { src: famCupCelebration, label: "Игровой момент" },
    { src: famCupNight, label: "Турнир" },
    { src: famTeamDiplomas, label: "Награждение" },
    { src: pKick, label: "Работа с мячом" },
    { src: pDribble, label: "Ведение" },
    { src: pBall, label: "Мяч" },
  ];
  return (
    <section className="relative bg-background py-14 md:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Галерея</div>
          <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-6xl text-deep tracking-tight">
            Фотографии академии
          </h2>
          <p className="mt-3 text-ink/60 max-w-xl">
            Тренировки, игровые моменты и командная атмосфера.
          </p>
        </Reveal>

        {/* Mobile: horizontal swipe */}
        <div className="mt-8 lg:hidden -mx-5 px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
          {shots.map((s) => (
            <div
              key={s.label}
              className="snap-start shrink-0 w-[78%] aspect-[4/5] relative rounded-2xl overflow-hidden bg-night"
            >
              <img src={s.src} alt={s.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-[11px] uppercase tracking-[0.2em]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Desktop: masonry grid */}
        <div className="mt-10 hidden lg:grid grid-cols-6 grid-rows-2 gap-4 h-[640px]">
          <Tile src={shots[0].src} caption={shots[0].label} className="col-span-3 row-span-2" />
          <Tile src={shots[1].src} caption={shots[1].label} className="col-span-2" />
          <Tile src={shots[2].src} caption={shots[2].label} className="col-span-1 row-span-2" />
          <Tile src={shots[3].src} caption={shots[3].label} className="col-span-1" />
          <Tile src={shots[4].src} caption={shots[4].label} className="col-span-1" />
        </div>
      </div>
    </section>
  );
}

function Tile({ src, className = "", caption }: { src: string; className?: string; caption: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-night ${className}`}>
      <img src={src} alt={caption} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-[1.05] group-hover:opacity-100 transition duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent" />
      <div className="absolute bottom-4 left-4 right-4 text-white text-[11px] uppercase tracking-[0.2em]">{caption}</div>
    </div>
  );
}

/* ============================ TRAINING (Как проходят) ============================ */
function Training() {
  const items = [
    { src: pBall, title: "Техника с мячом", text: "Передачи, ведение, удары и первые игровые действия." },
    { src: famTraining, title: "Игровые упражнения", text: "Учатся видеть поле, принимать решения и играть в команде." },
    { src: pDribble, title: "Координация и движение", text: "Скорость, ловкость, баланс и работа тела." },
    { src: famCupNight, title: "Матчи и турниры", text: "Игровая практика, командные события и футбольная атмосфера." },
  ];
  return (
    <section className="relative bg-surface py-14 md:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Тренировки</div>
          <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-6xl text-deep tracking-tight">
            Как проходят тренировки
          </h2>
        </Reveal>

        <div className="mt-8 md:mt-12 grid sm:grid-cols-2 gap-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.05}>
              <div className="group relative rounded-2xl overflow-hidden bg-night text-white aspect-[4/5] sm:aspect-[5/4]">
                <img src={it.src} alt={it.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-flame font-semibold">0{i + 1}</div>
                  <div className="mt-2 font-display text-2xl md:text-3xl tracking-wide">{it.title}</div>
                  <p className="mt-2 text-white/75 text-sm leading-snug">{it.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ COACH ============================ */
function Coach() {
  return (
    <section className="relative py-14 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Тренер</div>
          <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-6xl text-deep tracking-tight">
            Тренер академии
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 md:mt-12">
          <div className="relative rounded-3xl overflow-hidden bg-night text-white grid md:grid-cols-12 min-h-[480px]">
            <div className="md:col-span-7 relative aspect-[4/5] md:aspect-auto">
              <img
                src={coachGubin}
                alt="Губин Алексей Олегович — тренер футбольной академии Морева"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-night via-night/30 to-transparent" />
              <div className="absolute inset-0 pitch-lines opacity-20 mix-blend-overlay" />
            </div>

            <div className="md:col-span-5 relative p-6 md:p-10 flex flex-col justify-between gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">FAM · Тренер</div>
                <h3 className="mt-3 font-display text-3xl md:text-5xl tracking-tight leading-[0.95]">
                  Губин <br /> Алексей <br /> Олегович
                </h3>
                <div className="mt-4 inline-flex items-center px-3 py-1.5 rounded-full bg-flame/15 border border-flame/30 text-flame text-[11px] uppercase tracking-[0.2em] font-semibold">
                  Тренер футбольной академии Морева
                </div>
                <p className="mt-6 text-white/70 leading-relaxed text-sm md:text-base">
                  Проводит тренировки для детских групп, помогает детям осваивать технику,
                  понимать игру и чувствовать уверенность на поле.
                </p>
              </div>

              <ApplyButton className="self-start">Записаться на тренировку</ApplyButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ ABOUT ============================ */
function About() {
  return (
    <section id="about" className="relative bg-night text-white py-14 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-25" />
      <div className="absolute -top-32 right-0 h-[400px] w-[400px] bg-royal/30 blur-[120px] rounded-full" />
      <div className="relative mx-auto max-w-4xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Об академии</div>
          <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-6xl tracking-tight">
            Об академии
          </h2>
          <p className="mt-6 text-white/80 leading-relaxed text-base md:text-lg">
            Футбольная академия Морева — детская футбольная среда в Анапе, где тренировки
            строятся вокруг интереса к игре, дисциплины, командной атмосферы и постепенного
            развития ребёнка.
          </p>
          <p className="mt-5 text-white/60 leading-relaxed text-sm md:text-base">
            Название академии сохраняет память и уважение к Мореву. Сегодня команда продолжает
            развивать футбольное дело и создавать место, куда дети приходят с интересом.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ GROUPS ============================ */
function Groups() {
  return (
    <section id="schedule" className="relative bg-surface py-14 md:py-24">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Группы</div>
          <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-6xl text-deep tracking-tight">
            Группы
          </h2>
          <p className="mt-5 text-ink/70 leading-relaxed text-base md:text-lg">
            Есть группы для детей 4–14 лет. Подходящую группу подбираем по возрасту
            и уровню подготовки.
          </p>
          <div className="mt-7">
            <ApplyButton>Уточнить группу</ApplyButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ CONTACTS ============================ */
function Contacts() {
  return (
    <section id="contacts" className="relative bg-night text-white py-14 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-20" />
      <div className="absolute inset-0 bg-gradient-pitch" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Контакты</div>
          <h2 className="mt-3 font-display text-[2rem] sm:text-4xl md:text-6xl tracking-tight">
            Контакты
          </h2>
          <p className="mt-4 text-white/65 max-w-xl">
            Свяжитесь с нами, чтобы записать ребёнка на тренировку или уточнить группу.
          </p>
        </Reveal>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7 space-y-3">
              <ContactRow icon={Phone} label="Телефон" value="Скоро" href="#" />
              <ContactRow icon={MessageCircle} label="WhatsApp" value="Написать" href="https://wa.me/79000000000" />
              <ContactRow icon={Send} label="Telegram" value="Написать" href="https://t.me/" />
              <ContactRow icon={MapPin} label="Адрес" value="Анапа" href="#map" />

              <div className="pt-4 grid grid-cols-2 gap-2">
                <a
                  href="tel:+79000000000"
                  className="inline-flex items-center justify-center gap-2 h-12 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-xs shadow-flame"
                >
                  <Phone className="h-4 w-4" /> Позвонить
                </a>
                <a
                  href="https://wa.me/79000000000"
                  className="inline-flex items-center justify-center gap-2 h-12 rounded-full border border-white/20 bg-white/5 text-white font-semibold uppercase tracking-wider text-xs"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div id="map" className="relative rounded-2xl overflow-hidden border border-white/10 h-[300px] md:h-full min-h-[300px] bg-night">
              <iframe
                title="Карта Анапа"
                src="https://www.openstreetmap.org/export/embed.html?bbox=37.30%2C44.87%2C37.40%2C44.93&layer=mapnik&marker=44.8946%2C37.3163"
                className="absolute inset-0 w-full h-full grayscale"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-8 text-center">
          <ApplyButton>Записать ребёнка</ApplyButton>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-4 group py-2">
      <span className="h-11 w-11 rounded-xl bg-white/8 flex items-center justify-center text-flame shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</span>
        <span className="block font-display text-lg tracking-wide group-hover:text-flame transition">{value}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-flame transition" />
    </a>
  );
}
