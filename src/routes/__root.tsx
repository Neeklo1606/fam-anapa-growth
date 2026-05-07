import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { ApplyProvider } from "@/components/site/ApplyModal";

const ldJson = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Футбольная академия Морева",
  description:
    "Футбольная школа в Анапе для детей от 4 до 14 лет. Тренировки, развитие техники, координации и уверенности.",
  address: { "@type": "PostalAddress", addressLocality: "Анапа", addressCountry: "RU" },
  sport: "Football",
  areaServed: "Анапа",
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-night text-white px-4 relative overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-30" />
      <div className="relative max-w-md text-center">
        <div className="font-display text-[10rem] leading-none text-gradient-brand">404</div>
        <h2 className="mt-2 font-display text-2xl tracking-wider">Страница не найдена</h2>
        <p className="mt-3 text-sm text-white/60">Возможно, она была перемещена или больше не существует.</p>
        <div className="mt-7">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-flame px-6 py-3 text-sm font-semibold uppercase tracking-wider shadow-flame">
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
      { title: "Футбольная академия Морева в Анапе · футбол для детей" },
      {
        name: "description",
        content:
          "Детская футбольная академия Морева в Анапе. Тренировки по футболу для детей, развитие техники, координации, дисциплины и уверенности на поле. Запись на занятия.",
      },
      {
        name: "keywords",
        content:
          "футбольная академия Анапа, футбол для детей Анапа, футбольная секция Анапа, детский футбольный клуб Анапа, тренировки по футболу для детей Анапа, футбольная школа Анапа",
      },
      { name: "theme-color", content: "#0B1020" },
      { property: "og:title", content: "Футбольная академия Морева в Анапе · футбол для детей" },
      { property: "og:description", content: "Футбольная академия Морева в Анапе · футбол для детей" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_RU" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Футбольная академия Морева в Анапе · футбол для детей" },
      { name: "description", content: "Футбольная академия Морева в Анапе · футбол для детей" },
      { name: "twitter:description", content: "Футбольная академия Морева в Анапе · футбол для детей" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/NZpVXzCaDIPWux8GeV6RCwGGFe32/social-images/social-1778015302193-ЛОГО.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/NZpVXzCaDIPWux8GeV6RCwGGFe32/social-images/social-1778015302193-ЛОГО.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(ldJson) }],
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
      <body className="bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ApplyProvider>
      <Header />
      <main className="pb-32 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <Toaster />
    </ApplyProvider>
  );
}
