import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { ApplyProvider } from "@/components/site/ApplyModal";

const SITE_URL = "https://fam-anapa-growth.lovable.app";

const ldJson = [
  {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "Футбольная академия Морева",
    alternateName: "Академия Морева",
    description:
      "Футбольная школа в Анапе для детей от 4 до 14 лет. Тренировки по футболу, школа вратарей, развитие техники, координации и уверенности на поле.",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Анапа",
      addressRegion: "Краснодарский край",
      addressCountry: "RU",
    },
    areaServed: { "@type": "City", name: "Анапа" },
    sport: "Football",
    telephone: "+7 (918) 000-00-00",
    sameAs: ["https://wa.me/79180000000", "https://t.me/fam_anapa"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Футбольная академия Морева",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Футбольная академия Морева в Анапе",
    url: SITE_URL,
    inLanguage: "ru-RU",
  },
];


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
      { title: "Футбольная академия Морева в Анапе — футбол для детей от 4 до 14 лет" },
      {
        name: "description",
        content:
          "Футбольная школа в Анапе для детей от 4 до 14 лет. Тренировки по футболу, школа вратарей, развитие техники, координации, дисциплины и уверенности. Запись ребёнка на тренировку.",
      },
      {
        name: "keywords",
        content:
          "футбольная школа Анапа, футбольные школы Анапа, футбольная секция Анапа, футбол для детей Анапа, футбольная академия Анапа, детский футбольный клуб Анапа, школа вратарей Анапа, записать ребёнка на футбол Анапа",
      },
      { name: "theme-color", content: "#0B1020" },
      { property: "og:title", content: "Футбольная академия Морева в Анапе — футбол для детей" },
      { property: "og:description", content: "Футбольная школа в Анапе для детей от 4 до 14 лет. Тренировки, школа вратарей, опытные тренеры. Запись ребёнка." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_RU" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Футбольная академия Морева в Анапе" },
      { name: "twitter:description", content: "Футбольная школа в Анапе для детей от 4 до 14 лет. Запись ребёнка." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/NZpVXzCaDIPWux8GeV6RCwGGFe32/social-images/social-1778015302193-ЛОГО.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/NZpVXzCaDIPWux8GeV6RCwGGFe32/social-images/social-1778015302193-ЛОГО.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE_URL },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico" },
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
      <main>
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </ApplyProvider>
  );
}
