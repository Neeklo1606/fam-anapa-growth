import Link from "next/link";
import Image from "next/image";

import { FooterContactsSection } from "@/components/site/FooterContactsSection";

const legal = [
  { to: "/legal/privacy", label: "Конфиденциальность" },
  { to: "/legal/terms", label: "Соглашение" },
  { to: "/legal/offer", label: "Оферта" },
  { to: "/legal/consent", label: "Согласие на обработку" },
] as const;

const nav = [
  { href: "/#about", label: "Академия" },
  { href: "/#goalkeeper", label: "Школа вратарей" },
  { href: "/#coaches", label: "Тренеры" },
  { href: "/#location", label: "Локация" },
  { href: "/#contacts", label: "Записаться" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-night text-white overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 pitch-lines opacity-25" />
      <div className="absolute inset-0 club-stripes opacity-40" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[480px] w-[800px] bg-gradient-pitch opacity-70" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-16 pb-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Image
                src="/img/logo.webp"
                alt="Академия Морева"
                width={64}
                height={64}
                className="h-16 w-16 object-contain mix-blend-multiply"
              />
              <div className="leading-tight">
                <div className="font-display text-xl tracking-wide uppercase">Академия Морева</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-mono-pro">
                  FAM · Анапа
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/60 max-w-sm leading-relaxed">
              Детская футбольная академия в Анапе. Техника, координация, командная игра и уверенность на поле для детей 6–14 лет.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono-pro">Разделы</div>
            <ul className="mt-5 space-y-3 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-white/80 hover:text-flame transition">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterContactsSection />
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/45">
          {legal.map((l) => (
            <Link key={l.to} href={l.to} className="hover:text-flame transition uppercase tracking-wider">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-between text-xs text-white/40">
          <span>© {year} Футбольная академия Морева</span>
          <span className="uppercase tracking-wider font-mono-pro">FAM · Anapa · Russia</span>
        </div>
      </div>
    </footer>
  );
}
