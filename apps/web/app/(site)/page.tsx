import type { Metadata } from "next";

import { HomeShell } from "@/components/site/HomeShell";

import { fetchPublicSite } from "@/lib/admin-api";
import { mergeStoredHomePage } from "@/lib/home-page-content";
import { applyPublicSiteToHome } from "@/lib/site-contacts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Футбольная академия Морева в Анапе · футбол для детей",
  description:
    "Футбольная школа в Анапе для детей от 6 до 14 лет. Тренировки, школа вратарей, опытные тренеры. Записать ребёнка в Академию Морева.",
  openGraph: {
    title: "Футбольная академия Морева в Анапе",
    description: "Футбольная школа в Анапе для детей от 6 до 14 лет.",
    images: ["/img/hero-kid.jpg"],
  },
};

export default async function HomePage() {
  let home = mergeStoredHomePage(null);
  try {
    const pub = await fetchPublicSite();
    home = mergeStoredHomePage(pub.homeContent);
    home = applyPublicSiteToHome(home, pub);
  } catch {
    /* API может быть недоступна при сборке — рендерим дефолты */
  }

  return <HomeShell home={home} />;
}
