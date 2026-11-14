import Link from "next/link";

import { ApplyButton } from "@/components/site/ApplyModal";
import { FooterContactsSection } from "@/components/site/FooterContactsSection";
import { DEFAULT_SITE_LOGO_SRC } from "@/lib/site-defaults";
import { FOOTER_NAV } from "@/content/site";

const legal = [
  { to: "/legal/privacy", label: "Конфиденциальность" },
  { to: "/legal/terms", label: "Соглашение" },
  { to: "/legal/offer", label: "Оферта" },
  { to: "/legal/consent", label: "Согласие на обработку" },
] as const;

export function Footer({ logoSrc, copyrightText }: { logoSrc: string; copyrightText?: string | null }) {
  const year = new Date().getFullYear();
  const copyright =
    copyrightText?.trim() || `© ${year} Футбольная академия Морева`;
  return (
    <footer className="relative bg-night text-white overflow-hidden">
      {/* оранжевый акцент, как в слайдах */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-80 w-80 rounded-full bg-flame/15 blur-[120px]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-10 pb-8">
        <div className="grid gap-7 md:gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              {/* Эмблема обрезана ровно по кругу — без заметной белой подложки */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc === DEFAULT_SITE_LOGO_SRC ? "/img/logo-mark.webp" : logoSrc}
                alt="Академия Морева"
                width={56}
                height={56}
                loading="lazy"
                className="size-14 shrink-0 rounded-full object-contain"
              />
              <div className="leading-tight">
                <div className="font-display text-lg tracking-[0.06em] uppercase text-white/95">
                  Академия <span className="text-electric">Морева</span>
                </div>
                <div className="text-[9px] uppercase tracking-[0.28em] text-white/65 font-mono-pro">
                  ФАМ · Анапа
                </div>
              </div>
            </div>
            <div className="mt-6">
              <ApplyButton />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-flame font-mono-pro">Разделы</div>
            <ul className="mt-4 space-y-2 text-[13px]">
              {FOOTER_NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="text-white/[0.78] hover:text-flame transition-colors duration-200"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterContactsSection />
        </div>

        <div className="mt-8 pt-4 border-t border-white/[0.08] flex flex-wrap gap-x-3 gap-y-2 text-[11px] text-white/65">
          {legal.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className="hover:text-flame transition-colors duration-200 uppercase tracking-[0.08em]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 justify-between items-baseline text-[11px] text-white/65">
          <span>{copyright}</span>
          <span className="uppercase tracking-[0.2em] font-mono-pro text-flame/90">ФАМ · Анапа</span>
        </div>
      </div>
    </footer>
  );
}
