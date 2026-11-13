"use client";

import { useEffect, useRef, useState } from "react";

import { trackSiteEvent } from "@/lib/analytics";

/** Готовые WebP-варианты для статичных постеров из public/img (обычный <img>, без /_next/image). */
const POSTER_VARIANTS: Record<string, { webp: string; mobile: string }> = {
  "/img/hero-video.jpg": { webp: "/img/hero-video.webp", mobile: "/img/hero-video-m.webp" },
  "/img/hero-kid.jpg": { webp: "/img/hero-kid.webp", mobile: "/img/hero-kid-m.webp" },
  "/img/hero.jpg": { webp: "/img/hero.webp", mobile: "/img/hero-m.webp" },
};

/** Сжатые версии hero-видео: WebM (VP9) для десктопа и лёгкий MP4 для телефонов. */
const VIDEO_VARIANTS: Record<string, { webm?: string; mobile?: string }> = {
  "/hero-v2.mp4": { webm: "/hero-v2.webm", mobile: "/hero-v2-mobile.mp4" },
  "/hero.mp4": { webm: "/hero-720.webm" },
};

type Props = {
  videoSrc: string;
  posterSrc: string;
  alt?: string;
  className?: string;
  objectPosition?: string;
};

export function HeroVideo({
  videoSrc,
  posterSrc,
  alt = "",
  className = "",
  objectPosition = "70% center",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const playTracked = useRef(false);
  const variant = POSTER_VARIANTS[posterSrc];
  const videoVariant = VIDEO_VARIANTS[videoSrc] ?? {};
  // Выбираем файл один раз при монтировании видео: телефон — лёгкая версия (≈1,4 МБ).
  const [isMobile, setIsMobile] = useState(false);
  // Видео монтируем после load + idle, чтобы оно не конкурировало с постером (LCP) и JS.
  const [mountVideo, setMountVideo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      if (cancelled) return;
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => !cancelled && setMountVideo(true), { timeout: 2500 });
      else timer = setTimeout(() => !cancelled && setMountVideo(true), 800);
    };
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      if (timer) clearTimeout(timer);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => setReady(true);
    const onError = () => setFailed(true);
    v.addEventListener("canplay", onReady);
    v.addEventListener("loadeddata", onReady);
    v.addEventListener("error", onError);
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    return () => {
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("error", onError);
    };
  }, [mountVideo]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <picture>
        {variant && <source media="(max-width: 767px)" srcSet={variant.mobile} type="image/webp" />}
        {variant && <source srcSet={variant.webp} type="image/webp" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      {mountVideo && !failed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => {
            if (playTracked.current) return;
            playTracked.current = true;
            trackSiteEvent({
              type: "VIDEO_PLAY",
              page: window.location.pathname,
              section: "hero",
            });
          }}
          {...({ "webkit-playsinline": "true" } as Record<string, string>)}
          disablePictureInPicture
          disableRemotePlayback
          // inset 1px: видео не «больше» постера под ним → LCP остаётся на постере, а не на позднем видео.
          className={`absolute left-px top-px h-[calc(100%-2px)] w-[calc(100%-2px)] object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition }}
        >
          {isMobile && videoVariant.mobile ? (
            <source src={videoVariant.mobile} type="video/mp4" />
          ) : (
            <>
              {videoVariant.webm ? <source src={videoVariant.webm} type="video/webm" /> : null}
              <source src={videoSrc} type="video/mp4" />
            </>
          )}
        </video>
      )}
    </div>
  );
}
