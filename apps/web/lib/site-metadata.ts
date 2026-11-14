import type { Metadata } from "next";

import type { PublicSite } from "@/lib/admin-api";
import { SITE_URL, absUrl } from "@/lib/utils";

export const DEFAULT_SITE_TITLE = "Футбольная академия Морева в Анапе · футбол для детей";
export const DEFAULT_SITE_DESCRIPTION =
  "Детская футбольная академия Морева в Анапе. Тренировки по футболу для детей, развитие техники, координации, дисциплины и уверенности на поле. Запись на занятия.";
export const DEFAULT_OG_IMAGE = "/img/hero-kid.jpg";
export const DEFAULT_FAVICON = "/img/logo.webp";

export const DEFAULT_KEYWORDS = [
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
];

function parseKeywords(raw: string | null | undefined): string[] {
  const s = raw?.trim();
  if (!s) return DEFAULT_KEYWORDS;
  const parts = s
    .split(/[,;]+/)
    .map((k) => k.trim())
    .filter(Boolean);
  return parts.length ? parts : DEFAULT_KEYWORDS;
}

export function buildSiteMetadata(pub: PublicSite | null): Metadata {
  const title = pub?.seoTitle?.trim() || DEFAULT_SITE_TITLE;
  const description = pub?.seoDescription?.trim() || DEFAULT_SITE_DESCRIPTION;
  const keywords = parseKeywords(pub?.seoKeywords);
  const ogImage = pub?.ogImageUrl?.trim() || DEFAULT_OG_IMAGE;
  const favicon = pub?.faviconUrl?.trim() || DEFAULT_FAVICON;

  return {
    // absolute: на главной без хвоста шаблона (иначе «… · ФАМ Анапа» дублируется)
    title: { absolute: title, template: "%s · ФАМ Анапа" },
    description,
    keywords,
    alternates: { canonical: SITE_URL },
    icons:
      favicon === DEFAULT_FAVICON || favicon === "/img/logo.webp"
        ? {
            // Эмблема без полей — крупно во вкладке и в выдаче Google (размеры кратны 48 px).
            icon: [
              { url: "/favicon.ico", sizes: "48x48" },
              { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
              { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
              { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
            ],
            apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
          }
        : {
            icon: [{ url: favicon, type: favicon.endsWith(".webp") ? "image/webp" : undefined }],
            apple: [{ url: favicon, sizes: "180x180" }],
          },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: SITE_URL,
      siteName: pub?.brandName?.trim() || "Футбольная академия Морева",
      title,
      description,
      images: [{ url: absUrl(ogImage), width: 1200, height: 630, alt: "ФАМ Анапа" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absUrl(ogImage)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    authors: [{ name: pub?.brandName?.trim() || "Футбольная академия Морева" }],
    category: "sports",
  };
}
