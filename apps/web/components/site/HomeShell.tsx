"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Play,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";

import { HeroVideo } from "@/components/site/HeroVideo";
import { Reveal } from "@/components/site/Reveal";
import { ApplyButton, useApply } from "@/components/site/ApplyModal";
import {
  HERO,
  ABOUT,
  GOALKEEPER,
  PRINCIPLES,
  COACHES as COACHES_FALLBACK,
  LOCATION,
  CONTACTS,
  GALLERY,
} from "@/content/site";
import { trackSiteEvent } from "@/lib/analytics";

export type HomeCoach = {
  id: string;
  fullName: string;
  role: string;
  photoUrl: string | null;
  shortDescription: string;
};

export type HomeGallerySlide = { id: string; src: string; label: string; alt: string };

export type HomeVideoCard = {
  id: string;
  title: string;
  url: string;
  posterUrl: string | null;
  description: string | null;
};

function youtubeEmbedSrc(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const h = u.hostname.replace(/^www\./, "");
    if (h === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split(/[/?#]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (h === "youtube.com" || h === "m.youtube.com" || h === "music.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = /^\/(?:embed|shorts)\/([^/?#]+)/.exec(u.pathname);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function HomeShell({
  coaches,
  gallery,
  videos,
}: {
  coaches?: HomeCoach[];
  gallery?: HomeGallerySlide[];
  videos?: HomeVideoCard[];
}) {
  return (
    <div className="overflow-hidden">
      <Hero />
      <About />
      <GoalkeeperSchool />
      <Principles />
      <Coaches coaches={coaches} />
      <VideosStrip videos={videos} />
      <Location gallery={gallery} />
      <ApplySection />
    </div>
  );
}

function VideosStrip({ videos }: { videos?: HomeVideoCard[] }) {
  if (!videos?.length) return null;
  return (
    <section id="videos" className="bg-background py-14 md:py-24 border-t border-line scroll-mt-20">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="absolute inset-0 club-stripes-dark opacity-30 pointer-events-none" />
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.3em] text-flame font-semibold">Видео</div>
          <h2
            className="mt-3 font-display tracking-tight text-deep"
            style={{ fontSize: "clamp(1.85rem, 5vw, 3.2rem)", lineHeight: 1.05 }}
          >
            Смотреть <span className="text-gradient-brand-dark">ролики</span>
          </h2>
        </Reveal>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          {videos.map((v) => {
            const embed = youtubeEmbedSrc(v.url);
            return (
              <article
                key={v.id}
                className="snap-start shrink-0 w-[min(92vw,400px)] rounded-2xl overflow-hidden border border-line bg-white shadow-soft"
              >
                <div className="relative bg-night aspect-video">
                  {embed ? (
                    <iframe src={embed} title={v.title} className="absolute inset-0 h-full w-full" allowFullScreen loading="lazy" />
                  ) : (
                    <a href={v.url} target="_blank" rel="noreferrer" className="absolute inset-0 group block">
                      {v.posterUrl ? (
                        <Image src={v.posterUrl} alt="" fill sizes="400px" className="object-cover opacity-95 group-hover:opacity-100 transition" />
                      ) : (
                        <div className="absolute inset-0 bg-night" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-night/55 group-hover:bg-night/45 transition">
                        <span className="h-14 w-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <Play className="h-7 w-7 text-white ml-1" fill="currentColor" />
                        </span>
                      </div>
                    </a>
                  )}
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-display text-lg md:text-xl tracking-tight">{v.title}</h3>
                  {v.description ? (
                    <p className="mt-2 text-sm text-ink/65 line-clamp-3">{v.description}</p>
                  ) : (
                    !embed && (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-flame hover:underline"
                      >
                        Открыть видео <ArrowRight className="h-3 w-3" />
                      </a>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section
      className="relative bg-night text-white overflow-hidden flex items-center"
      style={{ minHeight: "min(820px, 86svh)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <HeroVideo
          videoSrc={HERO.media.src}
          posterSrc={HERO.media.poster}
          alt="Футбольная академия Морева в Анапе"
          objectPosition="65% center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/50 to-night lg:from-night/90 lg:via-night/40 lg:to-night/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/30 to-transparent lg:from-night/95 lg:via-night/30" />
        <div className="absolute inset-0 pitch-lines opacity-25" />
        <div className="absolute inset-0 club-stripes opacity-50" />
      </div>

      <div
        className="relative mx-auto w-full max-w-7xl"
        style={{
          paddingLeft: "clamp(1.25rem, 5vw, 2rem)",
          paddingRight: "clamp(1.25rem, 5vw, 2rem)",
          paddingTop: "clamp(5.5rem, 14vw, 8rem)",
          paddingBottom: "clamp(2.5rem, 7vw, 6rem)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <h1
            className="font-display text-white text-balance"
            style={{
              fontSize: "clamp(2.6rem, 11vw, 8rem)",
              lineHeight: 0.88,
              letterSpacing: "-0.035em",
              fontWeight: 700,
            }}
          >
            Футбольная
            <br />
            академия
            <br />
            <span className="relative inline-block">
              <span className="text-gradient-brand italic">Морева</span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-flame to-transparent" />
            </span>
          </h1>

          <div className="mt-7 flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-white/60 font-mono-pro">
            {HERO.metaLine.map((m, i) => (
              <span key={m} className="flex items-center gap-3 sm:gap-4">
                {i > 0 && <span className="h-px w-5 sm:w-6 bg-white/25" />}
                <span>{m}</span>
              </span>
            ))}
          </div>

          <div className="mt-9 lg:mt-10">
            <ApplyButton>Записать ребёнка</ApplyButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/40 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-mono-pro">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-8 w-px bg-white/30"
        />
      </motion.div>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5 scroll-mt-20"
    >
      <div className="absolute inset-0 pitch-lines opacity-15 pointer-events-none" />
      <div className="absolute inset-0 club-stripes opacity-40 pointer-events-none" />
      <div className="absolute -top-32 right-0 h-[500px] w-[500px] bg-royal/30 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal y={20} className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-night ring-1 ring-white/10">
              <Image
                src={ABOUT.image}
                alt="Команда футбольной академии Морева в Анапе"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
              <div className="absolute inset-0 pitch-lines opacity-15 mix-blend-overlay pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="text-[10px] uppercase tracking-[0.25em] text-flame">FAM · Команда</div>
                <div className="font-display text-2xl md:text-3xl mt-1">Анапа · Россия</div>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <Reveal>
              <h2
                className="mt-4 font-display tracking-tight"
                style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
              >
                Об <span className="text-gradient-brand">Академии</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              {ABOUT.body.map((p, i) => (
                <p
                  key={i}
                  className={`mt-${i === 0 ? "6" : "4"} ${i === 0 ? "text-white/80 text-base md:text-lg" : "text-white/55 text-sm md:text-base"} leading-relaxed max-w-xl`}
                >
                  {p}
                </p>
              ))}
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8">
                <ApplyButton>Записать ребёнка</ApplyButton>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <section
      id="goalkeeper"
      className="relative bg-surface text-deep py-16 md:py-28 overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 club-stripes-dark opacity-60 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5">
            <Reveal>
              <h2
                className="mt-4 font-display tracking-tight text-deep"
                style={{
                  fontSize: "clamp(1.9rem, 4.4vw, 3.75rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                }}
              >
                {GOALKEEPER.title}
              </h2>
              <p className="mt-6 text-ink/70 text-base md:text-lg leading-relaxed max-w-md">
                {GOALKEEPER.body}
              </p>
              <div className="mt-7">
                <ApplyButton>Записать ребёнка</ApplyButton>
              </div>
            </Reveal>
          </div>

          <Reveal y={20} delay={0.1} className="lg:col-span-7">
            <button
              type="button"
              onClick={togglePlay}
              className="group relative block w-full aspect-video rounded-3xl overflow-hidden border border-ink/10 bg-night shadow-elevated"
            >
              <video
                ref={videoRef}
                poster={GOALKEEPER.video.poster}
                playsInline
                loop
                muted
                preload="none"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/hero-720.webm" type="video/webm" />
                <source src={GOALKEEPER.video.src} type="video/mp4" />
              </video>
              <div
                className={`absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent transition-opacity duration-500 ${playing ? "opacity-30" : "opacity-100"}`}
              />
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
              <div className="absolute bottom-5 left-5 right-5">
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                  FAM · Goalkeeper
                </div>
                <div className="font-display text-xl md:text-2xl mt-1 text-white">
                  Школа вратарей
                </div>
              </div>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Principles() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section
      id="principles"
      className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5 scroll-mt-20"
    >
      <div className="absolute inset-0 pitch-lines opacity-15 pointer-events-none" />
      <div className="absolute inset-0 club-stripes opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] bg-flame/15 blur-[140px] rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
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
          {PRINCIPLES.map((p, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={p.title} delay={i * 0.04}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left py-6 md:py-8 flex items-center gap-4 md:gap-8 group"
                >
                  <div
                    className={`text-[11px] md:text-sm font-mono-pro tracking-wider transition ${isOpen ? "text-flame" : "text-white/35"}`}
                  >
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

function Coaches({ coaches }: { coaches?: HomeCoach[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: false, dragFree: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const items: HomeCoach[] =
    coaches && coaches.length > 0
      ? coaches
      : COACHES_FALLBACK.map((c, i) => ({
          id: `fallback-${i}`,
          fullName: c.name,
          role: c.role,
          photoUrl: c.img,
          shortDescription: c.info,
        }));

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
    <section id="coaches" className="relative bg-background py-16 md:py-28 scroll-mt-20">
      <div className="absolute inset-0 club-stripes-dark opacity-50 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <h2
                className="mt-4 font-display tracking-tight text-deep"
                style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
              >
                Тренерский <br className="md:hidden" />{" "}
                <span className="text-gradient-brand-dark">штаб</span>
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
              {items.map((c, i) => (
                <div
                  key={c.id}
                  className="shrink-0 w-[78%] sm:w-[55%] md:w-[42%] lg:w-[32%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group relative rounded-3xl overflow-hidden bg-night text-white aspect-[3/4] hover:shadow-elevated transition"
                  >
                    {c.photoUrl && (
                      <Image
                        src={c.photoUrl}
                        alt={c.fullName}
                        fill
                        sizes="(min-width: 1024px) 32vw, 78vw"
                        className="absolute inset-0 w-full h-full object-cover object-[center_15%] opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-flame font-semibold">
                        {c.role}
                      </div>
                      <div className="mt-2 font-display text-xl md:text-2xl tracking-wide leading-tight">
                        {c.fullName}
                      </div>
                      <p className="mt-2 text-white/70 text-xs md:text-sm leading-snug">{c.shortDescription}</p>
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

function Location({ gallery }: { gallery?: HomeGallerySlide[] }) {
  const slides: HomeGallerySlide[] =
    gallery && gallery.length > 0
      ? gallery
      : GALLERY.map((s, i) => ({
          id: `fallback-${i}`,
          src: s.src,
          label: s.label,
          alt: s.label,
        }));

  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: false });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    onSelect();
  }, [embla]);

  const slideKeys = slides.map((s) => s.id).join("-");

  return (
    <section
      id="location"
      className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5 scroll-mt-20"
    >
      <div className="absolute inset-0 pitch-lines opacity-15 pointer-events-none" />
      <div className="absolute inset-0 club-stripes opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <Reveal>
              <h2
                className="mt-4 font-display tracking-tight text-white"
                style={{
                  fontSize: "clamp(1.9rem, 4.4vw, 3.5rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                }}
              >
                {LOCATION.title}
              </h2>
              <p className="mt-6 text-white/70 text-base md:text-lg leading-relaxed max-w-md">
                {LOCATION.body}
              </p>

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 max-w-md">
                <div className="flex items-start gap-4">
                  <span className="h-11 w-11 rounded-xl bg-flame/15 flex items-center justify-center text-flame shrink-0">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Адрес</div>
                    <div className="mt-1 font-display text-lg tracking-wide text-white">
                      {LOCATION.address}
                    </div>
                    <a
                      href={LOCATION.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-flame hover:text-white transition"
                    >
                      Открыть на Яндекс.Картах <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <ApplyButton>Записать ребёнка</ApplyButton>
              </div>
            </Reveal>
          </div>

          <Reveal y={20} delay={0.1} className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden bg-night ring-1 ring-white/10">
              <div className="overflow-hidden" ref={emblaRef} key={slideKeys}>
                <div className="flex">
                  {slides.map((s) => (
                    <div
                      key={s.id}
                      className="shrink-0 w-full relative aspect-[4/3] md:aspect-[16/10]"
                    >
                      <Image
                        src={s.src}
                        alt={s.alt}
                        fill
                        sizes="(min-width: 1024px) 58vw, 100vw"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 text-white">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-flame">
                          FAM · Поле
                        </div>
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
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => embla?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-flame" : "w-1.5 bg-white/40"}`}
                    aria-label={`Слайд ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 relative rounded-3xl overflow-hidden border border-white/10 h-[260px] md:h-[300px] bg-night">
              <iframe
                title="Карта · Анапа"
                src={LOCATION.embedSrc}
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

function ApplySection() {
  const { open } = useApply();
  return (
    <section
      id="contacts"
      className="relative bg-surface text-deep py-16 md:py-28 overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 club-stripes-dark opacity-60 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal>
            <h2
              className="mt-4 font-display tracking-tight text-deep"
              style={{
                fontSize: "clamp(2rem, 5.5vw, 4rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Записать <span className="text-gradient-brand-dark">ребёнка</span>
            </h2>
            <p className="mt-5 text-ink/70 text-base md:text-lg leading-relaxed max-w-md">
              Оставьте заявку — подберём подходящую группу по возрасту и подготовке. Свяжемся с вами в течение дня.
            </p>

            <ul className="mt-7 space-y-3 max-w-md">
              {[
                "Простая анкета — займёт меньше минуты",
                "Подбор группы по возрасту и уровню",
                "Перезвоним и подскажем расписание",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-ink/75 text-[15px]">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-flame shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={CONTACTS.max}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackSiteEvent({ type: "MAX_CLICK", section: "home_contacts_strip", page: "/" })
                }
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-deep/15 text-deep text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-deep hover:text-white transition"
              >
                <MessageCircle className="h-4 w-4" /> MAX
              </a>
            </div>
          </Reveal>

          <Reveal y={20} delay={0.1}>
            <button
              type="button"
              onClick={open}
              className="group block w-full text-left rounded-3xl border border-deep/10 bg-white p-6 md:p-8 shadow-soft hover:shadow-elevated transition relative overflow-hidden"
            >
              <div className="absolute inset-0 club-stripes-dark opacity-50 pointer-events-none" />
              <div className="absolute -top-24 -right-24 h-56 w-56 bg-flame/15 blur-3xl rounded-full pointer-events-none" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-semibold">
                  Анкета записи
                </div>
                <div className="mt-3 font-display text-2xl md:text-3xl tracking-wide text-deep">
                  Открыть форму
                </div>
                <p className="mt-3 text-ink/60 text-sm leading-relaxed">
                  Направление · ФИО ребёнка · Дата рождения · Контакты родителя
                </p>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <a
                    href={`tel:${CONTACTS.phone}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      trackSiteEvent({
                        type: "PHONE_CLICK",
                        section: "home_apply_sidebar",
                        page: "/",
                      });
                    }}
                    className="flex items-center gap-2 text-deep text-sm font-semibold hover:text-flame transition"
                  >
                    <Phone className="h-4 w-4" /> {CONTACTS.phoneDisplay}
                  </a>
                  <span className="h-12 w-12 rounded-full bg-flame text-white flex items-center justify-center shadow-flame group-hover:scale-105 transition">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </button>

            <p className="mt-4 text-[11px] text-ink/50 leading-relaxed text-center">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <Link
                href="/legal/consent"
                className="underline decoration-ink/30 hover:text-flame transition"
              >
                политикой обработки персональных данных
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
