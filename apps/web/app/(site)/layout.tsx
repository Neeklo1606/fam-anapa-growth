import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { ApplyProvider } from "@/components/site/ApplyModal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SiteContactsProvider } from "@/components/site/SiteContactsContext";
import { SmoothAnchorScroll } from "@/components/site/SmoothAnchorScroll";

import { fetchPublicSite } from "@/lib/admin-api";
import { CONTACTS } from "@/content/site";
import { DEFAULT_SITE_LOGO_SRC } from "@/lib/site-defaults";
import { resolveSiteContacts, type ResolvedSiteContacts } from "@/lib/site-contacts";
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
    "футбольная школа Анапа",
    "футбольные школы Анапа",
    "футбол для детей Анапа",
    "футбольная секция Анапа",
    "детский футбольный клуб Анапа",
    "школа вратарей Анапа",
    "записать ребёнка на футбол Анапа",
    "тренировки по футболу для детей Анапа",
    "футбольная школа станица Анапская",
    "Краснодарский край детский футбол",
    "пробное занятие футбол дети",
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

function schemaAddress(contacts: ResolvedSiteContacts, apiLoaded: boolean) {
  if (contacts.address) {
    return {
      "@type": "PostalAddress" as const,
      streetAddress: contacts.address,
      addressCountry: "RU",
    };
  }
  if (!apiLoaded) {
    return {
      "@type": "PostalAddress" as const,
      streetAddress: CONTACTS.streetAddress,
      addressLocality: CONTACTS.addressLocality,
      addressRegion: CONTACTS.addressRegion,
      addressCountry: "RU",
    };
  }
  return undefined;
}

function buildLdJson(contacts: ResolvedSiteContacts, logoSrc: string, apiLoaded: boolean) {
  const sameAs = [contacts.whatsapp, contacts.telegram, contacts.max, contacts.yandexMaps].filter(
    (u): u is string => Boolean(u),
  );
  const address = schemaAddress(contacts, apiLoaded);

  const sportsActivityLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: contacts.brandName,
    alternateName: "Академия Морева",
    description:
      "Детская футбольная академия имени А. В. Морева в станице Анапская. Тренировки по футболу для детей, школа вратарей, развитие техники и уверенности на поле.",
    url: SITE_URL,
    image: absUrl(OG_IMAGE),
    ...(address ? { address } : {}),
    ...(contacts.address ? { areaServed: { "@type": "AdministrativeArea", name: contacts.address } } : {}),
    sport: "Football",
    ...(contacts.phoneTel ? { telephone: contacts.phoneTel } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return [
    sportsActivityLd,
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: contacts.brandName,
      url: SITE_URL,
      logo: absUrl(logoSrc),
      ...(contacts.phoneTel ? { telephone: contacts.phoneTel } : {}),
      ...(address ? { address } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Футбольная академия Морева в Анапе",
      url: SITE_URL,
      inLanguage: "ru-RU",
    },
  ];
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let logoSrc = DEFAULT_SITE_LOGO_SRC;
  let apiLoaded = false;
  let contacts = resolveSiteContacts(null);

  try {
    const pub = await fetchPublicSite();
    apiLoaded = true;
    contacts = resolveSiteContacts(pub);
    const u = pub.logoUrl?.trim();
    if (u) logoSrc = u;
  } catch {
    // API может быть недоступна при сборке / без Nest — остаётся локальный fallback
  }

  const ldJson = buildLdJson(contacts, logoSrc, apiLoaded);

  return (
    <ApplyProvider>
      <SiteContactsProvider contacts={contacts}>
        <SmoothAnchorScroll />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
        <Header logoSrc={logoSrc} />
        <main>{children}</main>
        <Footer logoSrc={logoSrc} />
        <Toaster />
      </SiteContactsProvider>
    </ApplyProvider>
  );
}
