import type { Metadata } from "next";

import {
  HomeShell,
  type HomeCoach,
  type HomeGallerySlide,
  type HomeVideoCard,
} from "@/components/site/HomeShell";

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

export const revalidate = 60;

const INTERNAL_API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4200/api";

async function loadCoaches(): Promise<HomeCoach[] | undefined> {
  try {
    const res = await fetch(`${INTERNAL_API_BASE}/coaches`, { next: { revalidate: 60 } });
    if (!res.ok) return undefined;
    const data = (await res.json()) as Array<{
      id: string;
      fullName: string;
      role: string;
      photoUrl: string | null;
      shortDescription: string;
    }>;
    return data;
  } catch {
    return undefined;
  }
}

async function loadGallery(): Promise<HomeGallerySlide[] | undefined> {
  try {
    const res = await fetch(`${INTERNAL_API_BASE}/gallery`, { next: { revalidate: 60 } });
    if (!res.ok) return undefined;
    return (await res.json()) as HomeGallerySlide[];
  } catch {
    return undefined;
  }
}

async function loadVideos(): Promise<HomeVideoCard[] | undefined> {
  try {
    const res = await fetch(`${INTERNAL_API_BASE}/videos`, { next: { revalidate: 60 } });
    if (!res.ok) return undefined;
    return (await res.json()) as HomeVideoCard[];
  } catch {
    return undefined;
  }
}

export default async function HomePage() {
  const [coaches, gallery, videos] = await Promise.all([
    loadCoaches(),
    loadGallery(),
    loadVideos(),
  ]);
  return <HomeShell coaches={coaches} gallery={gallery} videos={videos} />;
}
