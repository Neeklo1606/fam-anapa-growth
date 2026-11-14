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

export type HomeVideoCardCfg = {
  title: string;
  url: string;
  posterUrl: string;
  description: string;
};

export type FaqItem = { q: string; a: string };

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
    staticCoaches: HomeCoachCard[];
  };
  videosSection: {
    show: boolean;
    eyebrow: string;
    titleBefore: string;
    titleAccent: string;
    cards: HomeVideoCardCfg[];
  };
  location: {
    title: string;
    body: string;
    address: string;
    mapUrl: string;
    embedSrc: string;
    carouselSlides: GallerySlideCfg[];
  };
  contactsSection: {
    titleBefore: string;
    titleAccent: string;
    intro: string;
    bullets: string[];
  };
  /** Вопросы и ответы: блок на главной + JSON-LD FAQPage (SEO/GEO). */
  faq: {
    show: boolean;
    titleBefore: string;
    titleAccent: string;
    items: FaqItem[];
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

/**
 * Версия текстов по умолчанию. При повышении старые сохранённые в БД тексты
 * (из списка ниже) заменяются новыми — см. migrateStoredHome.
 */
export const HOME_CONTENT_VERSION = 2;

export function buildDefaultHomePageContent(): HomePageContent {
  return {
    version: HOME_CONTENT_VERSION,
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
      imageAlt: "Воспитанник Футбольной академии Морева в клубной форме",
      paragraphs: [...ABOUT.body],
    },
    goalkeeper: {
      title: GOALKEEPER.title,
      body: GOALKEEPER.body,
      videoMp4Src: GOALKEEPER.video.src,
      videoWebmSrc: GOALKEEPER.video.webm,
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
        "Тренеры нашей академии — это не только профессионалы и наставники, но и настоящие друзья для каждого ребёнка. Мы поддерживаем, вдохновляем и вместе идём к успеху!",
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
      cards: [],
    },
    location: {
      title: LOCATION.title,
      body: LOCATION.body,
      address: LOCATION.address,
      mapUrl: LOCATION.mapUrl,
      embedSrc: LOCATION.embedSrc,
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
    faq: {
      show: true,
      titleBefore: "Частые",
      titleAccent: "вопросы",
      items: [
        {
          q: "С какого возраста можно записать ребёнка на футбол?",
          a: "В Футбольную академию Морева в Анапе принимаем детей от 5 до 14 лет. Группу подбираем по возрасту и уровню подготовки.",
        },
        {
          q: "Нужен ли опыт игры в футбол?",
          a: "Нет. Можно прийти без опыта — тренер подберёт группу, где ребёнку будет комфортно и интересно.",
        },
        {
          q: "Как записаться на пробное занятие?",
          a: "Оставьте заявку на сайте — займёт меньше минуты. Мы перезвоним, подберём группу и согласуем время первого занятия.",
        },
        {
          q: "Есть ли в академии индивидуальные тренировки для вратарей?",
          a: `Да. ${GOALKEEPER.body}`,
        },
        {
          q: "Сколько стоят занятия и какое расписание?",
          a: "Стоимость и расписание зависят от возраста и группы. Оставьте заявку — перезвоним и подробно расскажем.",
        },
      ],
    },
  };
}

/**
 * v1 → v2 (13.11.2026): тексты «Об академии», «Школа вратарей», принципы, тренеры, локация
 * заменены на утверждённые заказчиком. Из старого сохранения убираем эти поля, чтобы взялись
 * новые дефолты; загруженные фото тренеров сохраняем (сопоставление по ФИО).
 */
function migrateStoredHome(stored: Record<string, unknown>): Record<string, unknown> {
  const out0 = clone(stored);
  // Старое hero-видео/постер по умолчанию → новое (13.11.2026). Своё видео из админки не трогаем.
  if (isPlainObject(out0.hero)) {
    if (out0.hero.videoSrc === "/hero.mp4") delete out0.hero.videoSrc;
    if (out0.hero.posterSrc === "/img/hero-kid.jpg") delete out0.hero.posterSrc;
  }
  // Видео «Школы вратарей» (14.11.2026): старые заглушки из кода → новое видео. Своё видео из админки не трогаем.
  if (isPlainObject(out0.goalkeeper)) {
    if (out0.goalkeeper.videoMp4Src === "/hero.mp4") delete out0.goalkeeper.videoMp4Src;
    if (out0.goalkeeper.videoWebmSrc === "/hero-720.webm") delete out0.goalkeeper.videoWebmSrc;
    if (out0.goalkeeper.videoPoster === "/img/p-ballwork.jpg") delete out0.goalkeeper.videoPoster;
  }
  // 14.11.2026: вопрос «Где проходят тренировки?» убран из FAQ; приём детей — с 5 лет.
  if (isPlainObject(out0.faq) && Array.isArray(out0.faq.items)) {
    out0.faq.items = out0.faq.items
      .filter((it) => !(isPlainObject(it) && typeof it.q === "string" && /где проходят тренировки/i.test(it.q)))
      .map((it) =>
        isPlainObject(it) && typeof it.a === "string"
          ? { ...it, a: it.a.replace(/от 6 до 14/g, "от 5 до 14").replace(/6–14/g, "5–14") }
          : it,
      )
      // 14.11.2026: формулировка вопроса о вратарях — по просьбе заказчика.
      .map((it) =>
        isPlainObject(it) && it.q === "Есть ли в академии школа вратарей?"
          ? { ...it, q: "Есть ли в академии индивидуальные тренировки для вратарей?" }
          : it,
      );
  }
  // 14.11.2026: у Аветисяна — «Высшее спортивное образование», если в админке пусто.
  if (isPlainObject(out0.coachesSection) && Array.isArray(out0.coachesSection.staticCoaches)) {
    out0.coachesSection.staticCoaches = out0.coachesSection.staticCoaches.map((c) =>
      isPlainObject(c) && typeof c.fullName === "string" && /аветисян/i.test(c.fullName) &&
      !(typeof c.shortDescription === "string" && c.shortDescription.trim())
        ? { ...c, shortDescription: "Высшее спортивное образование" }
        : c,
    );
  }
  // Тренер Строков больше не работает в академии (14.11.2026) — убираем карточку и из сохранённых данных.
  if (isPlainObject(out0.coachesSection) && Array.isArray(out0.coachesSection.staticCoaches)) {
    out0.coachesSection.staticCoaches = out0.coachesSection.staticCoaches.filter(
      (c) => !(isPlainObject(c) && typeof c.fullName === "string" && /строков/i.test(c.fullName)),
    );
  }
  stored = out0;
  const version = typeof stored.version === "number" ? stored.version : 1;
  if (version >= HOME_CONTENT_VERSION) return stored;
  const out = clone(stored);
  const drop = (section: string, key: string) => {
    const sec = out[section];
    if (isPlainObject(sec)) delete sec[key];
  };
  drop("about", "paragraphs");
  drop("about", "imageUrl"); // новое фото блока «Об академии» (по просьбе заказчика)
  drop("about", "imageAlt");
  drop("goalkeeper", "body");
  drop("principles", "items");
  drop("coachesSection", "subtitle");
  drop("location", "body");

  const oldCoaches = isPlainObject(out.coachesSection) ? out.coachesSection.staticCoaches : undefined;
  const photoByName = new Map<string, string>();
  if (Array.isArray(oldCoaches)) {
    for (const c of oldCoaches) {
      // Старые фото-заглушки из /img/ не переносим — берутся новые фото тренеров.
      if (isPlainObject(c) && typeof c.fullName === "string" && typeof c.photoUrl === "string" && c.photoUrl && !c.photoUrl.startsWith("/img/")) {
        photoByName.set(c.fullName.trim().toLowerCase(), c.photoUrl);
      }
    }
  }
  if (isPlainObject(out.coachesSection)) {
    out.coachesSection.staticCoaches = COACHES.map((c) => ({
      fullName: c.name,
      role: c.role,
      photoUrl: photoByName.get(c.name.toLowerCase()) || c.img,
      shortDescription: c.info,
    }));
  }
  out.version = HOME_CONTENT_VERSION;
  return out;
}

/** Слить сохранённые в БД данные поверх кодовых дефолтов. */
export function mergeStoredHomePage(stored: unknown): HomePageContent {
  const base = buildDefaultHomePageContent();
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return base;
  const migrated = migrateStoredHome(stored as Record<string, unknown>);
  return deepMerge(base as unknown as Record<string, unknown>, migrated) as unknown as HomePageContent;
}

/** Нормализует импорт с бэкенда перед merge (на случай «обёрток» или устаревшего вида). */
export function coerceHomeStoredPayload(raw: unknown): unknown {
  if (!raw) return raw;
  if (typeof raw === "object" && raw !== null && "homePage" in (raw as object)) {
    return (raw as { homePage: unknown }).homePage;
  }
  return raw;
}
