"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const links = [
  { to: "/legal/privacy", label: "Политика конфиденциальности" },
  { to: "/legal/terms", label: "Пользовательское соглашение" },
  { to: "/legal/offer", label: "Публичная оферта" },
  { to: "/legal/consent", label: "Согласие на обработку данных" },
] as const;

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="bg-background pb-safe-nav lg:pb-0">
      <section className="relative bg-night text-white pt-24 lg:pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 pitch-lines opacity-25" />
        <div className="absolute -top-32 right-0 h-[400px] w-[400px] bg-royal/25 blur-[120px] rounded-full" />
        <div className="relative mx-auto max-w-4xl px-5 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60 hover:text-flame transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> На главную
          </Link>
          <div className="mt-6 text-[11px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            Документы
          </div>
          <h1
            className="mt-3 font-display tracking-tight text-balance"
            style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)", lineHeight: 0.98 }}
          >
            {title}
          </h1>
          {updated && (
            <div className="mt-4 text-xs text-white/45 font-mono-pro">Редакция {updated}</div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 grid lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink/45 font-mono-pro mb-3">
                Разделы
              </div>
              {links.map((l) => {
                const active = pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    href={l.to}
                    className={
                      active
                        ? "block text-sm text-flame font-semibold"
                        : "block text-sm text-ink/70 hover:text-flame transition"
                    }
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </aside>
          <article className="lg:col-span-8 prose prose-neutral max-w-none text-ink/80 [&_h2]:font-display [&_h2]:text-deep [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:leading-relaxed [&_p]:text-[15px]">
            {children}
          </article>
        </div>
      </section>
    </div>
  );
}
