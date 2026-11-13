import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { ApplyButton } from "@/components/site/ApplyModal";
import { Reveal } from "@/components/site/Reveal";
import { SITE_URL } from "@/lib/utils";

export type ServiceLink = { href: string; label: string };

export const SERVICE_PAGES: ServiceLink[] = [
  { href: "/futbol-dlya-detej", label: "Футбол для детей" },
  { href: "/shkola-vratarej", label: "Школа вратарей" },
  { href: "/trenery", label: "Тренеры" },
  { href: "/o-akademii", label: "Об академии" },
  { href: "/contacts", label: "Контакты" },
];

/** Каркас внутренней страницы: hero + контент + CTA + перелинковка + BreadcrumbList. */
export function ServicePage({
  path,
  eyebrow,
  title,
  accent,
  lead,
  children,
  extraLd,
}: {
  path: string;
  eyebrow: string;
  title: string;
  accent?: string;
  lead: string;
  children: ReactNode;
  extraLd?: Record<string, unknown>[];
}) {
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: `${title}${accent ? ` ${accent}` : ""}`, item: `${SITE_URL}${path}` },
    ],
  };
  const ld = [crumbsLd, ...(extraLd ?? [])];

  return (
    <div className="pb-safe-nav lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }}
      />
      <section className="relative bg-night text-white pt-24 lg:pt-32 pb-12 lg:pb-20 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-flame/70 to-transparent" />
        <div className="absolute -top-32 right-0 h-[420px] w-[420px] bg-royal/30 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -left-20 h-[320px] w-[320px] bg-flame/15 blur-[120px] rounded-full" />
        <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
          <nav aria-label="Хлебные крошки" className="text-[11px] uppercase tracking-[0.22em] text-white/55">
            <Link href="/" className="inline-flex items-center gap-2 hover:text-flame transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Главная
            </Link>
          </nav>
          <Reveal>
            <div className="mt-6 text-[11px] uppercase tracking-[0.25em] text-flame font-semibold">{eyebrow}</div>
            <h1
              className="mt-3 font-display tracking-tight text-balance"
              style={{ fontSize: "clamp(2.2rem, 8vw, 5rem)", lineHeight: 0.95 }}
            >
              {title} {accent ? <span className="text-gradient-brand">{accent}</span> : null}
            </h1>
            <p className="mt-5 max-w-2xl text-white/70 text-base md:text-lg leading-relaxed">{lead}</p>
            <div className="mt-8">
              <ApplyButton />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="bg-background">{children}</div>

      <section className="bg-surface py-12 md:py-16 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="text-[11px] uppercase tracking-[0.22em] text-deep font-semibold"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-flame align-middle" />Ещё об академии</div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_PAGES.filter((l) => l.href !== path).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 text-deep font-medium hover:border-flame transition"
                >
                  {l.label}
                  <ArrowRight className="h-4 w-4 text-flame transition group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

/** Секция с заголовком для внутренних страниц. */
export function ServiceSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <Reveal>
          <h2 className="font-display tracking-tight text-deep" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", lineHeight: 1 }}>
            {title}
          </h2>
        </Reveal>
        <div className="mt-6 md:mt-10">{children}</div>
      </div>
    </section>
  );
}
