import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";

const ldJson = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Football Academy Morev (FAM)",
  description: "Детская футбольная академия в Анапе. Бережное развитие через спорт.",
  address: { "@type": "PostalAddress", addressLocality: "Анапа", addressCountry: "RU" },
  telephone: "+7-900-000-00-00",
  url: "https://fam-anapa.ru",
  sport: "Football",
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-brand-deep">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Возможно, она была перемещена или больше не существует.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "FAM — Детская футбольная академия в Анапе" },
      {
        name: "description",
        content:
          "Football Academy Morev — бережное развитие детей через футбол в Анапе. Профессиональные тренеры, безопасная среда, понятная программа.",
      },
      { name: "theme-color", content: "#050047" },
      { property: "og:title", content: "FAM — Детская футбольная академия в Анапе" },
      { property: "og:description", content: "Где ребёнка понимают и бережно развивают." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_RU" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;600;700;800&display=swap",
      },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(ldJson) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Header />
      <main className="pt-16 pb-28 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <Toaster />
    </>
  );
}
