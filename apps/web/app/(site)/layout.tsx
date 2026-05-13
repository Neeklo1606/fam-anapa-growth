import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { ApplyProvider } from "@/components/site/ApplyModal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

import { fetchPublicSite } from "@/lib/admin-api";
import { DEFAULT_SITE_LOGO_SRC } from "@/lib/site-defaults";
import { SITE_URL, absUrl } from "@/lib/utils";

const SITE_TITLE = "Футбольная академия Морева в Анапе · футбол для детей";
const SITE_DESCRIPTION =
  "Детская футбольная академия Морева в Анапе. Тренировки по футболу для детей, развитие техники, координации, дисциплины и уверенности на поле. Запись на занятия.";
const OG_IMAGE = "/img/hero-kid.jpg";

export const metadata: Metadata = {
  title: { default: SITE_TITLE, template: "%s · ФАМ Анапа" },
  description: SITE_DESCRIPTION,
  keywords: [
    "футбольная академия Анапа",
    "футбол для детей Анапа",
    "футбольная секция Анапа",
    "детский футбольный клуб Анапа",
    "тренировки по футболу для детей Анапа",
    "футбольная школа Анапа",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Футбольная академия Морева",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "ФАМ Анапа" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  authors: [{ name: "Футбольная академия Морева" }],
  category: "sports",
};

const ldJsonShell = [
  {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "Футбольная академия Морева",
    alternateName: "Академия Морева",
    description:
      "Футбольная школа в Анапе для детей от 4 до 14 лет. Тренировки по футболу, школа вратарей, развитие техники, координации и уверенности на поле.",
    url: SITE_URL,
    image: absUrl(OG_IMAGE),
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
    "@type": "WebSite",
    name: "Футбольная академия Морева в Анапе",
    url: SITE_URL,
    inLanguage: "ru-RU",
  },
] as const;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let logoSrc = DEFAULT_SITE_LOGO_SRC;
  try {
    const pub = await fetchPublicSite();
    const u = pub.logoUrl?.trim();
    if (u) logoSrc = u;
  } catch {
    // API может быть недоступна при сборке / без Nest — остаётся локальный fallback
  }

  const ldJson = [
    ldJsonShell[0],
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Футбольная академия Морева",
      url: SITE_URL,
      logo: absUrl(logoSrc),
    },
    ldJsonShell[1],
  ];

  return (
    <ApplyProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <Header logoSrc={logoSrc} />
      <main>{children}</main>
      <Footer logoSrc={logoSrc} />
      <Toaster />
    </ApplyProvider>
  );
}
