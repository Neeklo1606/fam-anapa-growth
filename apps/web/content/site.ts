/**
 * Single source of truth for editable site content.
 * Once the backend is wired (Этап 2), this file is replaced by API responses.
 */

const ASSETS = "/img";

const heroImg = `${ASSETS}/hero-kid.jpg`;
const aboutImg = `${ASSETS}/about-boy.webp`;
const goalkeeperPoster = `${ASSETS}/p-ballwork.jpg`;
const fieldImg = `${ASSETS}/fam-training.jpg`;
const coachGubin = `${ASSETS}/coach-gubin.jpg`;
const famTraining = `${ASSETS}/fam-training.jpg`;
const famCupCelebration = `${ASSETS}/fam-cup-celebration.jpg`;

/** Основное здание / организация в Яндексе · Навигатор */
const YANDEX_ORG_NAVI =
  "https://yandex.ru/maps/org/futbolnaya_akademiya_imeni_a_v_moreva/13322284254/";

export const CONTACTS = {
  phone: "+79150303141",
  phoneDisplay: "+7 (915) 030-31-41",
  /** Пусто = не показывать (WhatsApp/Telegram/email пока не предоставлены). */
  whatsapp: "",
  telegram: "",
  max: "https://max.ru/fam_anapa",
  vk: "https://vk.ru/f.a.morev",
  email: "",
  /** Яндекс.Навигатор / карточка организации */
  yandexMaps: YANDEX_ORG_NAVI,
  /** Длинная подпись для блоков и контактов */
  addressFull: "Футбольная академия имени А. В. Морева, Тбилисская ул., 1Г, станица Анапская, Краснодарский край, Россия",
  /** Одна строка для меню компакт текста */
  addressShort: "Тбилисская ул., 1Г, ст-ца Анапская",
  addressLocality: "Анапская",
  addressRegion: "Краснодарский край",
  streetAddress: "улица Тбилисская, 1Г",
} as const;

export const HERO = {
  media: { type: "video" as const, src: "/hero.mp4", poster: heroImg },
};

export const ABOUT = {
  title: "Об Академии",
  body: [
    "Футбольная академия имени Андрея Морева — это современный подход к обучению, основанный на любви к игре, дисциплине и уважении. Мы помогаем детям постепенно развиваться и раскрывать свой потенциал.",
    "Название академии сохраняет память и уважение к нашему тренеру, заслуженному футболисту Андрею Валерьевичу Мореву. Сегодня мы продолжаем его дело, создавая пространство, куда дети приходят с интересом и желанием играть!",
  ],
  image: aboutImg,
};

export const GOALKEEPER = {
  title: "Школа вратарей",
  body: "Вратарь — уникальная позиция на футбольном поле, требующая специализированной подготовки. В нашей академии проводятся индивидуальные тренировки под руководством опытных тренеров, которые помогут раскрыть потенциал каждого ученика и добиться высокого мастерства вратарского искусства.",
  video: { src: "/hero.mp4", poster: goalkeeperPoster },
};

export const PRINCIPLES = [
  { n: "01", title: "Дисциплина", text: "Каждая тренировка строится на внимании, режиме и уважении к команде, тренеру и сопернику." },
  { n: "02", title: "Постепенное обучение", text: "Учитываем уровень и возраст, чтобы дать ребёнку именно то, что нужно на каждом этапе развития." },
  { n: "03", title: "Умный игрок", text: "Учимся не только технике, но и пониманию игры. Главное — планомерное развитие, а не сиюминутный успех." },
  { n: "04", title: "Характер", text: "Важны не только навыки, но и жизненные принципы. Мы растим не только футболистов, но и достойных людей." },
  { n: "05", title: "Радость от игры", text: "Игровой метод — основа наших тренировок. Мы создаём интересную и вдохновляющую среду для детей!" },
];

/** Фото без `img` — карточка с монограммой; фото загружаются в админке (Главная → Тренеры). */
export const COACHES = [
  { name: "Губин Алексей Олегович", role: "Главный тренер", info: "Лицензия «С-УЕФА»", img: coachGubin },
  { name: "Макоев Владислав Русланович", role: "Тренер", info: "Высшее спортивное образование", img: "" },
  { name: "Андреев Константин Петрович", role: "Тренер", info: "Высшее спортивное образование", img: "" },
  { name: "Аветисян Грачья Вачаганович", role: "Тренер", info: "", img: "" },
  { name: "Строков Никита Игоревич", role: "Тренер", info: "", img: "" },
];

/** Точка карты около ул. Тбилисская, 1Г, ст. Анапская (виджет Яндекс) */
const MAP_EMBED_LL = "37.331448%2C44.895923";
const MAP_EMBED_PT = "37.331448,44.895923";

/** Две строки в блоке локации (п. 3.1 ТЗ); полный адрес для схемы — CONTACTS.addressFull */
const LOCATION_CARD_ADDRESS = [
  "Футбольная академия имени А. В. Морева",
  "Тбилисская ул., 1Г, станица Анапская",
].join("\n");

export const LOCATION = {
  title: "Где мы тренируемся",
  body: "Тренировки проходят на профессиональном стадионе с современным искусственным газоном и освещением. Комфортные раздевалки, конференц-зал для теоретических занятий и удобная парковка — всё для удобства наших юных футболистов!",
  image: fieldImg,
  address: LOCATION_CARD_ADDRESS,
  mapUrl: CONTACTS.yandexMaps,
  embedSrc: `https://yandex.ru/map-widget/v1/?ll=${MAP_EMBED_LL}&z=16&l=map&pt=${MAP_EMBED_PT},pm2rdm`,
};

export type SiteNavItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "apply"; label: string };

/** Верхнее и мобильное меню: якорь + пункт, открывающий анкету */
export const SITE_NAV: readonly SiteNavItem[] = [
  { kind: "link", href: "/#about", label: "Академия" },
  { kind: "link", href: "/#goalkeeper", label: "Школа вратарей" },
  { kind: "link", href: "/#principles", label: "Принципы" },
  { kind: "link", href: "/#coaches", label: "Тренеры" },
  { kind: "link", href: "/#location", label: "Локация" },
  { kind: "link", href: "/#contacts", label: "Контакты" },
  { kind: "apply", label: "Записать ребёнка" },
];

/** Короткий список ссылок для футера (без дубля «оставить заявку» у контактов — там якорь) */
export const FOOTER_NAV: readonly { href: string; label: string }[] = [
  { href: "/o-akademii", label: "Академия" },
  { href: "/futbol-dlya-detej", label: "Футбол для детей" },
  { href: "/shkola-vratarej", label: "Школа вратарей" },
  { href: "/#principles", label: "Принципы" },
  { href: "/trenery", label: "Тренеры" },
  { href: "/#location", label: "Локация" },
  { href: "/#contacts", label: "Контакты" },
];

export const FORM_DIRECTIONS = [
  "Группа 6–8 лет",
  "Группа 9–11 лет",
  "Группа 12–14 лет",
  "Школа вратарей",
  "Индивидуальные занятия",
  "Не выбрано — нужна консультация",
];

export const GALLERY = [
  { src: `${ASSETS}/fam-training.jpg`, label: "Тренировочное поле" },
  { src: `${ASSETS}/fam-cup-night.jpg`, label: "Вечерние занятия" },
  { src: `${ASSETS}/fam-cup-celebration.jpg`, label: "Игровой момент" },
  { src: `${ASSETS}/p-kick.jpg`, label: "Работа с мячом" },
  { src: `${ASSETS}/p-dribble.jpg`, label: "Ведение" },
  { src: `${ASSETS}/p-ball.jpg`, label: "Тренировка" },
];
