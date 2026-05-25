"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Высота фиксированной шапки + небольшой отступ */
const HEADER_OFFSET_PX = 80;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hashFromHref(href: string): string | null {
  const i = href.indexOf("#");
  if (i === -1) return null;
  const id = href.slice(i + 1).trim();
  return id || null;
}

function scrollToId(id: string, smooth: boolean): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
  return true;
}

/** Плавный переход к секциям главной по якорям меню и футера. */
export function SmoothAnchorScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const id = hashFromHref(window.location.hash);
    if (!id) return;
    const smooth = !prefersReducedMotion();
    const t = window.setTimeout(() => scrollToId(id, smooth), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (pathname !== "/") return;
      const anchor = (event.target as HTMLElement | null)?.closest("a[href*='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/#") && !href.startsWith("#")) return;

      const id = hashFromHref(href);
      if (!id) return;
      if (!href.startsWith("/#") && !href.startsWith("#")) return;

      if (!scrollToId(id, !prefersReducedMotion())) return;

      event.preventDefault();
      window.history.pushState(null, "", `/#${id}`);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
