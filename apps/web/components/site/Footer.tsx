import Link from "next/link";

import { FooterContactsSection } from "@/components/site/FooterContactsSection";
import { FOOTER_NAV } from "@/content/site";

const legal = [
  { to: "/legal/privacy", label: "Конфиденциальность" },
  { to: "/legal/terms", label: "Соглашение" },
  { to: "/legal/offer", label: "Оферта" },
  { to: "/legal/consent", label: "Согласие на обработку" },
] as const;

export function Footer({ logoSrc }: { logoSrc: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-night text-white overflow-hidden border-t border-white/5">
      <div className="pointer-events-none absolute inset-0 pitch-lines opacity-[0.07]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 club-stripes opacity-[0.12]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-10 pb-8">
        <div className="grid gap-7 md:gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt="Академия Морева"
                  width={56}
                  height={56}
                  className="h-11 w-11 object-contain"
                />
              </span>
              <div className="leading-tight">
                <div className="font-display text-lg tracking-[0.06em] uppercase text-white/95">
                  Академия Морева
                </div>
                <div className="text-[9px] uppercase tracking-[0.28em] text-white/38 font-mono-pro">
                  FAM · Анапа
                </div>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-white/[0.62] max-w-sm leading-relaxed">
              Детская футбольная академия в Анапе. Техника, координация, командная игра и уверенность на поле для детей 6–14 лет.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-mono-pro">Разделы</div>
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

        <div className="mt-8 pt-4 border-t border-white/[0.08] flex flex-wrap gap-x-3 gap-y-2 text-[11px] text-white/40">
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

        <div className="mt-5 flex flex-wrap gap-3 justify-between items-baseline text-[11px] text-white/38">
          <span>© {year} Футбольная академия Морева</span>
          <span className="uppercase tracking-[0.2em] font-mono-pro">FAM · ANAPA</span>
        </div>
      </div>
    </footer>
  );
}
