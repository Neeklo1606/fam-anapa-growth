import {
  ABOUT,
  COACHES,
  GALLERY,
  GOALKEEPER,
  HERO,
  LOCATION,
  PRINCIPLES,
} from "@/content/site";

export type PrincipleItem = { n: string; title: string; text: string };

export type GallerySlideCfg = { src: string; label: string };

export type HomeCoachCard = {
  fullName: string;
  role: string;
  photoUrl: string;
  shortDescription: string;
};

export type HomePageContent = {
  version: number;
  hero: {
    videoSrc: string;
    posterSrc: string;
    h1Lines: string[];
    accentWord: string;
    ctaLabel: string;
  };
  about: {
    cardEyebrow: string;
    cardTitle: string;
    titleBefore: string;
    titleAccent: string;
    imageUrl: string;
    imageAlt: string;
    paragraphs: string[];
  };
  goalkeeper: {
    title: string;
    body: string;
    videoMp4Src: string;
    videoWebmSrc: string;
    videoPoster: string;
    overlayEyebrow: string;
    overlayTitle: string;
  };
  principles: {
    sectionTitleBefore: string;
    sectionTitleAccent: string;
    intro: string;
    items: PrincipleItem[];
  };
  coachesSection: {
    titleLine1: string;
    titleLine2Accent: string;
    subtitle: string;
    useCoachesApi: boolean;
    staticCoaches: HomeCoachCard[];
  };
  videosSection: {
    show: boolean;
    eyebrow: string;
    titleBefore: string;
    titleAccent: string;
    useVideosApi: boolean;
  };
  location: {
    title: string;
    body: string;
    address: string;
    mapUrl: string;
    embedSrc: string;
    useGalleryApi: boolean;
    carouselSlides: GallerySlideCfg[];
  };
  contactsSection: {
    titleBefore: string;
    titleAccent: string;
    intro: string;
    bullets: string[];
  };
};

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T extends Record<string, unknown>>(target: T, src: Record<string, unknown>): T {
  const out = clone(target);
  for (const key of Object.keys(src)) {
    const sv = src[key];
    if (sv === undefined) continue;
    const cur = (out as Record<string, unknown>)[key];
    if (Array.isArray(sv)) {
      (out as Record<string, unknown>)[key] = sv;
    } else if (isPlainObject(sv) && isPlainObject(cur)) {
      (out as Record<string, unknown>)[key] = deepMerge(cur as Record<string, unknown>, sv);
    } else if (typeof sv !== "object" || sv === null) {
      (out as Record<string, unknown>)[key] = sv;
    }
  }
  return out;
}

export function buildDefaultHomePageContent(): HomePageContent {
  return {
    version: 1,
    hero: {
      videoSrc: HERO.media.src,
      posterSrc: HERO.media.poster,
      h1Lines: ["Футбольная", "академия"],
      accentWord: "Морева",
      ctaLabel: "Записать ребёнка",
    },
    about: {
      cardEyebrow: "FAM · Команда",
      cardTitle: "Анапа · Россия",
      titleBefore: "Об",
      titleAccent: "Академии",
      imageUrl: ABOUT.image,
      imageAlt: "Команда футбольной академии Морева в Анапе",
      paragraphs: [...ABOUT.body],
    },
    goalkeeper: {
      title: GOALKEEPER.title,
      body: GOALKEEPER.body,
      videoMp4Src: GOALKEEPER.video.src,
      videoWebmSrc: "/hero-720.webm",
      videoPoster: GOALKEEPER.video.poster,
      overlayEyebrow: "FAM · Goalkeeper",
      overlayTitle: "Школа вратарей",
    },
    principles: {
      sectionTitleBefore: "Наши",
      sectionTitleAccent: "принципы",
      intro: "Что для нас важно в работе с детьми и в подходе к игре.",
      items: PRINCIPLES.map((p) => ({ n: p.n, title: p.title, text: p.text })),
    },
    coachesSection: {
      titleLine1: "Тренерский",
      titleLine2Accent: "штаб",
      subtitle:
        "Тренеры академии работают с детскими группами и помогают каждому ребёнку расти на поле.",
      useCoachesApi: true,
      staticCoaches: COACHES.map((c) => ({
        fullName: c.name,
        role: c.role,
        photoUrl: c.img,
        shortDescription: c.info,
      })),
    },
    videosSection: {
      show: true,
      eyebrow: "Видео",
      titleBefore: "Смотреть",
      titleAccent: "ролики",
      useVideosApi: true,
    },
    location: {
      title: LOCATION.title,
      body: LOCATION.body,
      address: LOCATION.address,
      mapUrl: LOCATION.mapUrl,
      embedSrc: LOCATION.embedSrc,
      useGalleryApi: true,
      carouselSlides: GALLERY.map((g) => ({ src: g.src, label: g.label })),
    },
    contactsSection: {
      titleBefore: "Записать",
      titleAccent: "ребёнка",
      intro:
        "Оставьте заявку — подберём подходящую группу по возрасту и подготовке. Свяжемся с вами в течение дня.",
      bullets: [
        "Простая анкета — займёт меньше минуты",
        "Подбор группы по возрасту и уровню",
        "Перезвоним и подскажем расписание",
      ],
    },
  };
}

/** Слить сохранённые в БД данные поверх кодовых дефолтов. */
export function mergeStoredHomePage(stored: unknown): HomePageContent {
  const base = buildDefaultHomePageContent();
  if (!stored || typeof stored !== "object") return base;
  return deepMerge(base as unknown as Record<string, unknown>, stored as Record<string, unknown>) as unknown as HomePageContent;
}

/** Нормализует импорт с бэкенда перед merge (на случай «обёрток» или устаревшего вида). */
export function coerceHomeStoredPayload(raw: unknown): unknown {
  if (!raw) return raw;
  if (typeof raw === "object" && raw !== null && "homePage" in (raw as object)) {
    return (raw as { homePage: unknown }).homePage;
  }
  return raw;
}
