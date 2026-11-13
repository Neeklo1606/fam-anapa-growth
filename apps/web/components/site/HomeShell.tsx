"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Phone,
  Play,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";

import { SiteImage, optimizedPosterUrl } from "@/components/site/SiteImage";

import { HeroVideo } from "@/components/site/HeroVideo";
import { Reveal } from "@/components/site/Reveal";
import { ApplyButton, useApply } from "@/components/site/ApplyModal";
import { useSiteContacts } from "@/components/site/SiteContactsContext";
import { isHttpUrl, resolveYandexMapsLink } from "@/lib/site-contacts";
import type { HomePageContent, HomeVideoCardCfg } from "@/lib/home-page-content";
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

export function HomeShell({ home }: { home: HomePageContent }) {
  return (
    <div className="overflow-hidden">
      <Hero home={home} />
      <About home={home} />
      <GoalkeeperSchool home={home} />
      <Principles home={home} />
      <Coaches home={home} />
      <VideosStrip home={home} />
      <Location home={home} />
      <Faq home={home} />
      <ApplySection home={home} />
    </div>
  );
}

function VideosStrip({ home }: { home: HomePageContent }) {
  if (!home.videosSection.show) return null;
  const cards: HomeVideoCardCfg[] = home.videosSection.cards.filter((c) => c.url.trim());
  if (cards.length === 0) return null;
  return (
    <section id="videos" className="bg-background py-14 md:py-24 border-t border-line scroll-mt-20">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[0.3em] text-flame font-semibold">
            {home.videosSection.eyebrow}
          </div>
          <h2
            className="mt-3 font-display tracking-tight text-deep"
            style={{ fontSize: "clamp(1.85rem, 5vw, 3.2rem)", lineHeight: 1.05 }}
          >
            {home.videosSection.titleBefore}{" "}
            <span className="text-gradient-brand-dark">{home.videosSection.titleAccent}</span>
          </h2>
        </Reveal>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          {cards.map((v, i) => {
            const embed = youtubeEmbedSrc(v.url);
            const title = v.title?.trim() || `Ролик ${i + 1}`;
            return (
              <article
                key={`${v.url}-${i}`}
                className="snap-start shrink-0 w-[min(92vw,400px)] rounded-2xl overflow-hidden border border-line bg-white shadow-soft"
              >
                <div className="relative bg-night aspect-video">
                  {embed ? (
                    <iframe src={embed} title={title} className="absolute inset-0 h-full w-full" allowFullScreen loading="lazy" />
                  ) : (
                    <a href={v.url} target="_blank" rel="noreferrer" className="absolute inset-0 group block">
                      {v.posterUrl ? (
                        <SiteImage src={v.posterUrl} alt="" fill sizes="400px" className="object-cover opacity-95 group-hover:opacity-100 transition" />
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
                  <h3 className="font-display text-lg md:text-xl tracking-tight">{title}</h3>
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

function Hero({ home }: { home: HomePageContent }) {
  return (
    <section
      className="relative bg-night text-white overflow-hidden flex items-center"
      style={{ minHeight: "min(820px, 86svh)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <HeroVideo
          videoSrc={home.hero.videoSrc}
          posterSrc={home.hero.posterSrc}
          alt="Футбольная академия Морева в Анапе"
          objectPosition="65% center"
        />
        {/* Видео тёмное само по себе — затемнение лёгкое: сверху под шапку, снизу под переход к следующему блоку. */}
        <div className="absolute inset-0 bg-gradient-to-b from-night/45 via-night/10 to-night/90 lg:from-night/50 lg:via-night/15 lg:to-night/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/55 via-night/10 to-transparent lg:from-night/70 lg:via-night/20" />
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
        {/* CSS-анимация вместо framer-motion: заголовок виден без ожидания JS (LCP). */}
        <div className="max-w-4xl hero-enter">
          <h1
            className="font-display text-white text-balance"
            style={{
              fontSize: "clamp(2.6rem, 11vw, 8rem)",
              lineHeight: 0.88,
              letterSpacing: "-0.035em",
              fontWeight: 700,
            }}
          >
            {home.hero.h1Lines.map((line, i) => (
              <span key={i}>
                {line}
                {i < home.hero.h1Lines.length - 1 ? <br /> : null}
              </span>
            ))}
            <br />
            <span className="relative inline-block">
              <span className="text-gradient-brand italic">{home.hero.accentWord}</span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-flame to-transparent" />
            </span>
          </h1>

          <div className="mt-9 lg:mt-10">
            <ApplyButton>{home.hero.ctaLabel}</ApplyButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function About({ home }: { home: HomePageContent }) {
  return (
    <section
      id="about"
      className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5 scroll-mt-20"
    >
      <div className="absolute -top-32 right-0 h-[500px] w-[500px] bg-royal/30 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal y={20} className="lg:col-span-6 order-2 lg:order-1">
            <figure className="relative rounded-3xl overflow-hidden bg-white ring-1 ring-white/10 shadow-elevated">
              {/* Пропорции карточки = пропорции фото: object-cover ничего не обрезает (голова и руки целиком). */}
              <div className="relative aspect-[1148/1072]">
                <SiteImage
                  src={home.about.imageUrl}
                  alt={home.about.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
              <figcaption className="relative bg-night px-5 py-4 md:px-6 md:py-5">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-flame via-flame/40 to-transparent" />
                <div className="text-[10px] uppercase tracking-[0.25em] text-flame">{home.about.cardEyebrow}</div>
                <div className="font-display text-xl md:text-2xl mt-1">{home.about.cardTitle}</div>
              </figcaption>
            </figure>
          </Reveal>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <Reveal>
              <h2
                className="mt-4 font-display tracking-tight"
                style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
              >
                {home.about.titleBefore} <span className="text-gradient-brand">{home.about.titleAccent}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              {home.about.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`mt-${i === 0 ? "6" : "4"} ${i === 0 ? "text-white/80 text-base md:text-lg" : "text-white/55 text-sm md:text-base"} leading-relaxed max-w-xl`}
                >
                  {p}
                </p>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function GoalkeeperSchool({ home }: { home: HomePageContent }) {
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
                {home.goalkeeper.title}
              </h2>
              <p className="mt-6 text-ink/70 text-base md:text-lg leading-relaxed max-w-md">
                {home.goalkeeper.body}
              </p>
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
                poster={optimizedPosterUrl(home.goalkeeper.videoPoster)}
                playsInline
                loop
                muted
                preload="none"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={home.goalkeeper.videoWebmSrc} type="video/webm" />
                <source src={home.goalkeeper.videoMp4Src} type="video/mp4" />
              </video>
              <div
                className={`absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent transition-opacity duration-500 ${playing ? "opacity-30" : "opacity-100"}`}
              />
              <AnimatePresence>
                {!playing && (
                  <m.div
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
                  </m.div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                  {home.goalkeeper.overlayEyebrow}
                </div>
                <div className="font-display text-xl md:text-2xl mt-1 text-white">{home.goalkeeper.overlayTitle}</div>
              </div>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Principles({ home }: { home: HomePageContent }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section
      id="principles"
      className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5 scroll-mt-20"
    >
      <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] bg-flame/15 blur-[140px] rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <h2
            className="mt-4 font-display tracking-tight"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", lineHeight: 0.95 }}
          >
            {home.principles.sectionTitleBefore}{" "}
            <span className="text-gradient-brand">{home.principles.sectionTitleAccent}</span>
          </h2>
          <p className="mt-5 text-white/60 max-w-xl text-base md:text-lg">{home.principles.intro}</p>
        </Reveal>

        <div className="mt-10 md:mt-14 divide-y divide-white/10 border-y border-white/10">
          {home.principles.items.map((p, i) => {
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
                        <m.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="mt-4 max-w-2xl text-white/65 text-sm md:text-base leading-relaxed">
                            {p.text}
                          </p>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <m.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full border flex items-center justify-center transition ${isOpen ? "bg-flame border-flame text-white" : "border-white/20 text-white/70 group-hover:border-white/50"}`}
                  >
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  </m.div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Coaches({ home }: { home: HomePageContent }) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });
  const [snapIndex, setSnapIndex] = useState(0);

  const items: HomeCoach[] = home.coachesSection.staticCoaches.map((c, i) => ({
    id: `static-${i}`,
    fullName: c.fullName,
    role: c.role,
    photoUrl: c.photoUrl,
    shortDescription: c.shortDescription,
  }));

  useEffect(() => {
    if (!embla) return;
    const update = () => {
      setSnapIndex(embla.selectedScrollSnap());
    };
    update();
    embla.on("select", update);
    embla.on("reInit", update);
  }, [embla]);

  if (items.length === 0) return null;

  return (
    <section id="coaches" className="relative bg-background py-10 md:py-24 scroll-mt-20">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="max-w-xl">
            <h2 className="font-display font-bold tracking-[0.18em] text-deep uppercase text-2xl sm:text-3xl md:text-4xl">
              Тренерский <span className="text-flame">штаб</span>
            </h2>
            {home.coachesSection.subtitle.trim() ? (
              <p className="mt-2 md:mt-3 text-ink/60 max-w-md text-[13px] md:text-sm leading-snug">
                {home.coachesSection.subtitle}
              </p>
            ) : null}
          </div>
        </Reveal>

        <div className="mt-5 md:mt-10 -mx-5 md:mx-0">
          <div className="overflow-hidden pl-5 pr-3 md:pl-0 md:pr-0" ref={emblaRef}>
            <div className="flex touch-pan-y gap-3 md:gap-5">
              {items.map((c, i) => (
                <div
                  key={c.id}
                  className="min-w-0 shrink-0 basis-[82%] sm:basis-[70%] md:basis-[calc((100%-2.5rem)/3)]"
                >
                  <m.article
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className="group relative aspect-[3/4] max-h-[min(52vh,420px)] md:max-h-none w-full overflow-hidden rounded-2xl md:rounded-3xl bg-night shadow-soft ring-1 ring-line/25"
                  >
                    {c.photoUrl ? (
                      <SiteImage
                        src={c.photoUrl}
                        alt={c.fullName}
                        fill
                        sizes="(min-width: 768px) 28vw, 82vw"
                        className="object-cover object-[center_18%] transition duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-deep via-night to-night">
                        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-flame/20 blur-3xl" />
                        <span className="relative font-display text-6xl md:text-7xl tracking-tight text-white/90 -mt-16">
                          {c.fullName
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 bg-night px-4 py-3 md:px-5 md:py-4">
                      <h3 className="font-display text-[15px] md:text-lg leading-tight text-white tracking-wide">
                        {c.fullName}
                      </h3>
                      <p className="mt-1 text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">
                        {c.role}
                      </p>
                      {c.shortDescription ? (
                        <p className="mt-1.5 text-[12px] md:text-sm text-white/70 leading-snug line-clamp-2">
                          {c.shortDescription}
                        </p>
                      ) : null}
                    </div>
                  </m.article>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center md:hidden">
            {items.map((c, i) => (
              <button
                key={c.id}
                type="button"
                aria-label={`Слайд ${i + 1}`}
                onClick={() => embla?.scrollTo(i)}
                className="flex h-6 min-w-6 items-center justify-center"
              >
                <span className={`block h-1 rounded-full transition-all ${i === snapIndex ? "w-5 bg-flame" : "w-1 bg-ink/25"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Location({ home }: { home: HomePageContent }) {
  const slides: HomeGallerySlide[] = home.location.carouselSlides
    .filter((s) => s.src.trim())
    .map((s, i) => ({
      id: `car-${i}`,
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
  const addressText = home.location.address?.trim() ?? "";
  const mapUrl = resolveYandexMapsLink(home.location.mapUrl, addressText);
  const hasAddressLink = Boolean(addressText && mapUrl);
  const embedSrc = home.location.embedSrc?.trim();
  const hasMapEmbed = Boolean(embedSrc && isHttpUrl(embedSrc));
  const explicitMapUrl = home.location.mapUrl?.trim();
  const hasExplicitMapLink = Boolean(explicitMapUrl && isHttpUrl(explicitMapUrl));

  return (
    <section
      id="location"
      className="relative bg-night text-white py-16 md:py-28 overflow-hidden border-t border-white/5 scroll-mt-20"
    >
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
                {home.location.title}
              </h2>
              <p className="mt-6 text-white/70 text-base md:text-lg leading-relaxed max-w-md">
                {home.location.body}
              </p>

              {hasAddressLink ? (
                <a
                  href={mapUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 block rounded-2xl border border-white/10 bg-white/[0.04] p-5 max-w-md hover:border-flame/40 hover:bg-white/[0.07] transition group"
                >
                  <div className="flex items-start gap-4">
                    <span className="h-11 w-11 rounded-xl bg-flame/15 flex items-center justify-center text-flame shrink-0">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Адрес</div>
                      <div className="mt-1 font-display text-lg tracking-wide text-white leading-snug space-y-1 group-hover:text-flame/95 transition-colors">
                        {addressText.split(/\n/).map((ln) => ln.trim()).filter(Boolean).length > 1
                          ? addressText
                              .split(/\n/)
                              .map((ln) => ln.trim())
                              .filter(Boolean)
                              .map((line) => (
                                <span key={line} className="block">
                                  {line}
                                </span>
                              ))
                          : addressText}
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-flame">
                        Открыть в Яндекс.Картах <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </a>
              ) : null}
            </Reveal>
          </div>

          <Reveal y={20} delay={0.1} className="lg:col-span-7">
            {slides.length > 0 ? (
              <div className="relative rounded-3xl overflow-hidden bg-night ring-1 ring-white/10">
                <div className="overflow-hidden" ref={emblaRef} key={slideKeys}>
                  <div className="flex">
                    {slides.map((s) => (
                      <div
                        key={s.id}
                        className="shrink-0 w-full relative aspect-[4/3] md:aspect-[16/10]"
                      >
                        <SiteImage
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

                {slides.length > 1 ? (
                  <>
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

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex">
                      {slides.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => embla?.scrollTo(i)}
                          className="flex h-6 min-w-6 items-center justify-center"
                          aria-label={`Слайд ${i + 1}`}
                        >
                          <span className={`block h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-flame" : "w-1.5 bg-white/40"}`} />
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {hasMapEmbed ? (
              <div className="mt-4">
                <div className="relative rounded-3xl overflow-hidden border border-white/10 h-[260px] md:h-[300px] bg-night">
                  <iframe
                    title="Карта · ст. Анапская"
                    src={embedSrc}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
                {hasExplicitMapLink ? (
                  <div className="mt-3 flex justify-end">
                    <a
                      href={explicitMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-flame hover:text-white transition"
                    >
                      Открыть в Яндекс.Картах <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Faq({ home }: { home: HomePageContent }) {
  const faq = home.faq;
  const items = (faq?.items ?? []).filter((x) => x.q?.trim() && x.a?.trim());
  if (!faq?.show || items.length === 0) return null;
  return (
    <section id="faq" className="relative bg-white py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <Reveal>
          <h2
            className="font-display tracking-tight text-deep"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)", lineHeight: 0.95 }}
          >
            {faq.titleBefore} <span className="text-gradient-brand">{faq.titleAccent}</span>
          </h2>
        </Reveal>
        <div className="mt-8 md:mt-12 divide-y divide-ink/10 border-y border-ink/10">
          {items.map((item, i) => (
            <details key={item.q} className="group py-5 md:py-6" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-lg md:text-2xl tracking-tight text-ink">{item.q}</h3>
                <span className="shrink-0 h-10 w-10 rounded-full border border-ink/15 flex items-center justify-center text-ink/70 transition group-open:rotate-45 group-open:bg-flame group-open:border-flame group-open:text-night">
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-ink/70 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApplySection({ home }: { home: HomePageContent }) {
  const { open } = useApply();
  const contacts = useSiteContacts();
  return (
    <section
      id="contacts"
      className="relative bg-surface text-deep py-16 md:py-28 overflow-hidden scroll-mt-20"
    >
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
              {home.contactsSection.titleBefore}{" "}
              <span className="text-gradient-brand-dark">{home.contactsSection.titleAccent}</span>
            </h2>
            <p className="mt-5 text-ink/70 text-base md:text-lg leading-relaxed max-w-md">{home.contactsSection.intro}</p>

            <ul className="mt-7 space-y-3 max-w-md">
              {home.contactsSection.bullets.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-ink/75 text-[15px]">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-flame shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

          </Reveal>

          <Reveal y={20} delay={0.1}>
            <button
              type="button"
              onClick={open}
              className="group block w-full text-left rounded-3xl border border-deep/10 bg-white p-6 md:p-8 shadow-soft hover:shadow-elevated transition relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 h-56 w-56 bg-flame/15 blur-3xl rounded-full pointer-events-none" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-semibold">
                  Анкета записи
                </div>
                <div className="mt-3 font-display text-2xl md:text-3xl tracking-wide text-deep">
                  Записать ребёнка
                </div>
                <p className="mt-3 text-ink/60 text-sm leading-relaxed">
                  Ребёнок и родитель · телефон · дата рождения · опыт футбола · комментарий
                </p>

                <div
                  className={`mt-6 flex items-center gap-4 ${contacts.phoneTel ? "justify-between" : "justify-end"}`}
                >
                  {contacts.phoneTel && contacts.phoneDisplay ? (
                    <a
                      href={`tel:${contacts.phoneTel}`}
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
                      <Phone className="h-4 w-4" /> {contacts.phoneDisplay}
                    </a>
                  ) : null}
                  <span className="h-12 w-12 rounded-full bg-flame text-white flex items-center justify-center shadow-flame group-hover:scale-105 transition">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </button>

            <p className="mt-4 text-[11px] text-ink/50 leading-relaxed text-center">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <Link
                href="/legal/privacy"
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
