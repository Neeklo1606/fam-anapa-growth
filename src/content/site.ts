/**
 * Single source of truth for editable site content.
 * Replace texts, images, and media here without touching components.
 */

import heroImg from "@/assets/hero-kid.jpg";
import aboutImg from "@/assets/fam-team-flag.jpg";
import goalkeeperPoster from "@/assets/p-ballwork.jpg";
import fieldImg from "@/assets/fam-training.jpg";
import coachGubin from "@/assets/coach-gubin.jpg";
import famTraining from "@/assets/fam-training.jpg";
import famCupCelebration from "@/assets/fam-cup-celebration.jpg";

export const CONTACTS = {
  phone: "+79180000000",
  phoneDisplay: "+7 (918) 000-00-00",
  whatsapp: "https://wa.me/79180000000",
  telegram: "https://t.me/fam_anapa",
  max: "https://max.ru/fam_anapa",
  email: "info@fam-anapa.ru",
  yandexMaps: "https://yandex.ru/maps/?text=Анапа%2C%20стадион%20Спартак",
  address: "Анапа, Краснодарский край",
} as const;

export const HERO = {
  /** Easily swap to image-only if needed */
  media: { type: "video" as const, src: "/hero.mp4", poster: heroImg },
  metaLine: ["6–14 лет", "Анапа", "ФАМ"],
};

export const ABOUT = {
  title: "Об Академии",
  body: [
    "Футбольная академия Морева — детская футбольная среда в Анапе, где тренировки строятся вокруг интереса к игре, дисциплины, командной атмосферы и постепенного развития ребёнка.",
    "Название академии сохраняет память и уважение к Мореву. Сегодня команда продолжает развивать футбольное дело и создавать место, куда дети приходят с интересом.",
  ],
  image: aboutImg,
};

export const GOALKEEPER = {
  title: "Школа вратарей",
  body: "Отдельная программа для детей, которые хотят занимать место в воротах. Техника игры, реакция, работа с мячом и уверенность под планкой.",
  video: { src: "/hero.mp4", poster: goalkeeperPoster },
};

export const PRINCIPLES = [
  { n: "01", title: "Дисциплина", text: "Каждое занятие выстроено вокруг внимания, режима и уважения к команде, тренеру и сопернику." },
  { n: "02", title: "Техника", text: "Базовая работа с мячом — приём, передача, ведение и удар — основа любой игры на поле." },
  { n: "03", title: "Командная игра", text: "Учимся видеть партнёра, понимать движение и принимать решения вместе." },
  { n: "04", title: "Характер", text: "Игра помогает становиться увереннее, держать борьбу и не сдаваться при ошибках." },
  { n: "05", title: "Радость от футбола", text: "Главное — чтобы ребёнок ждал тренировку и приходил на поле с интересом." },
];

export const COACHES = [
  {
    name: "Губин Алексей Олегович",
    role: "Главный тренер",
    info: "Тренер футбольной академии Морева. Работает с детскими группами, развивает технику и игровое мышление.",
    img: coachGubin,
  },
  {
    name: "Тренерский состав",
    role: "Полевые тренеры",
    info: "Команда тренеров академии работает с детскими группами от 6 до 14 лет.",
    img: famTraining,
  },
  {
    name: "Школа вратарей",
    role: "Goalkeeper coach",
    info: "Отдельная программа подготовки вратарей под руководством профильного тренера.",
    img: famCupCelebration,
  },
];

export const LOCATION = {
  title: "Где мы тренируемся",
  body: "Тренировки проходят в Анапе на профессиональном футбольном поле с искусственным покрытием. Удобный подъезд, всё необходимое для занятий рядом.",
  image: fieldImg,
  address: CONTACTS.address,
  mapUrl: CONTACTS.yandexMaps,
  /** Yandex Maps embed (no API key needed) */
  embedSrc:
    "https://yandex.ru/map-widget/v1/?ll=37.316300%2C44.894600&z=14&pt=37.316300,44.894600,pm2rdm",
};

export const NAV_LINKS = [
  { href: "#about", label: "Академия" },
  { href: "#goalkeeper", label: "Школа вратарей" },
  { href: "#principles", label: "Принципы" },
  { href: "#coaches", label: "Тренеры" },
  { href: "#location", label: "Локация" },
  { href: "#contacts", label: "Контакты" },
];

export const FORM_DIRECTIONS = [
  "Группа 6–8 лет",
  "Группа 9–11 лет",
  "Группа 12–14 лет",
  "Школа вратарей",
  "Индивидуальные занятия",
  "Не выбрано — нужна консультация",
];
