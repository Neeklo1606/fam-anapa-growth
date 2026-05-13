"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { MobileMenu } from "@/components/site/MobileMenu";
import { ApplyButton } from "@/components/site/ApplyModal";
import { NAV_LINKS } from "@/content/site";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      className={`fixed top-0 inset-x-0 z-[60] transition-all duration-500 ${
        scrolled
          ? "bg-night/75 backdrop-blur-xl border-b border-white/10"
          : "bg-gradient-to-b from-night/60 via-night/30 to-transparent backdrop-blur-[6px]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-3">
        <Link href="/" className="relative z-10 flex items-center gap-2.5 min-w-0 group" aria-label="Академия Морева">
          <Image
            src="/img/logo.webp"
            alt="Академия Морева"
            width={48}
            height={48}
            priority
            className="h-9 w-9 md:h-11 md:w-11 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] transition group-hover:scale-105"
          />
          <span className="hidden sm:block leading-none min-w-0">
            <span className="block font-display text-[13px] md:text-[15px] tracking-[0.04em] text-white font-bold uppercase truncate">
              Академия Морева
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[11px] uppercase tracking-[0.22em] text-white/65 font-medium">
          {NAV_LINKS.slice(0, 5).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative hover:text-white transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame after:transition-all hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ApplyButton className="!h-11 !pl-5 !pr-1.5 !text-[11px]">Записаться</ApplyButton>
          </div>
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
