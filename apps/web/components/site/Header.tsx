"use client";

import Link from "next/link";

import { MobileMenu } from "@/components/site/MobileMenu";
import { ApplyButton } from "@/components/site/ApplyModal";
import { SITE_NAV } from "@/content/site";

export function Header({ logoSrc }: { logoSrc: string }) {
  return (
    <header
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      className="fixed top-0 inset-x-0 z-[100] bg-white/95 backdrop-blur-md border-b border-line/70 shadow-[0_1px_0_rgba(15,23,42,0.06)]"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-3">
        <Link
          href="/"
          className="relative z-10 flex items-center gap-3 min-w-0 group"
          aria-label="Академия Морева · на главную"
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center md:h-[52px] md:w-[52px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="Академия Морева"
              width={64}
              height={64}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-contain drop-shadow-sm transition group-hover:scale-[1.03]"
            />
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-[10px] uppercase tracking-[0.18em] text-ink/60 font-semibold">
          {SITE_NAV.filter((item) => item.kind === "link").map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative hover:text-deep transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame after:transition-all hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ApplyButton className="!h-11 !pl-5 !pr-1.5 !text-[11px]">Записать ребёнка</ApplyButton>
          </div>
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
