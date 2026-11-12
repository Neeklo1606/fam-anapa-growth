import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { ApplyProvider } from "@/components/site/ApplyModal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SiteContactsProvider } from "@/components/site/SiteContactsContext";
import { SmoothAnchorScroll } from "@/components/site/SmoothAnchorScroll";
import { MotionProvider } from "@/components/site/MotionProvider";

import { fetchPublicSite } from "@/lib/admin-api";
import { CONTACTS } from "@/content/site";
import { DEFAULT_SITE_LOGO_SRC } from "@/lib/site-defaults";
import {
  DEFAULT_OG_IMAGE,
  buildSiteMetadata,
} from "@/lib/site-metadata";
import { resolveSiteContacts, type ResolvedSiteContacts } from "@/lib/site-contacts";
import { SITE_URL, absUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const pub = await fetchPublicSite();
    return buildSiteMetadata(pub);
  } catch {
    return buildSiteMetadata(null);
  }
}

function schemaAddress(contacts: ResolvedSiteContacts, apiLoaded: boolean) {
  if (contacts.address) {
    return {
      "@type": "PostalAddress" as const,
      streetAddress: contacts.address,
      addressLocality: CONTACTS.addressLocality,
      addressRegion: CONTACTS.addressRegion,
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
    image: absUrl(DEFAULT_OG_IMAGE),
    ...(address ? { address } : {}),
    areaServed: [
      { "@type": "City", name: "Анапа" },
      { "@type": "AdministrativeArea", name: "Краснодарский край" },
    ],
    audience: { "@type": "PeopleAudience", suggestedMinAge: 6, suggestedMaxAge: 14 },
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
    <MotionProvider>
    <ApplyProvider>
      <SiteContactsProvider contacts={contacts}>
        <SmoothAnchorScroll />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
        <Header logoSrc={logoSrc} />
        <main>{children}</main>
        <Footer logoSrc={logoSrc} copyrightText={contacts.copyrightText} />
        <Toaster />
      </SiteContactsProvider>
    </ApplyProvider>
    </MotionProvider>
  );
}
