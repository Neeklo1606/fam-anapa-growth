import { ABOUT, COACHES, GALLERY, GOALKEEPER, HERO, LOCATION } from "@/content/site";

/**
 * Пути картинок из `public/` (как на сайте `/img/...`), которых нет в медиатеке БД.
 * Показываются в выборе изображения рядом с загруженными файлами.
 */
const fromContent = [
  HERO.media.poster,
  ABOUT.image,
  GOALKEEPER.video.poster,
  LOCATION.image,
  ...GALLERY.map((g) => g.src),
  ...COACHES.map((c) => c.img),
];

/** Остальные файлы из `apps/web/public/img` (часто нужны для постеров и иллюстраций). */
const extraFromPublicFolder = [
  "/img/logo.webp",
  "/img/ball.svg",
  "/img/action1.jpg",
  "/img/hero.jpg",
  "/img/coach1.jpg",
  "/img/g1.jpg",
  "/img/g2.jpg",
  "/img/g3.jpg",
  "/img/g4.jpg",
  "/img/g5.jpg",
  "/img/g6.jpg",
  "/img/p-coach.jpg",
  "/img/p-gubin.jpg",
  "/img/p-team.jpg",
  "/img/p-celebrate.jpg",
] as const;

export const SITE_PUBLIC_IMAGE_PATHS: string[] = [...new Set([...fromContent, ...extraFromPublicFolder])].sort(
  (a, b) => a.localeCompare(b, "ru"),
);
