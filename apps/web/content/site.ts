/**
 * Single source of truth for editable site content.
 * Once the backend is wired (Этап 2), this file is replaced by API responses.
 */

const ASSETS = "/img";

const heroImg = `${ASSETS}/hero-kid.jpg`;
const aboutImg = `${ASSETS}/fam-team-flag.jpg`;
const goalkeeperPoster = `${ASSETS}/p-ballwork.jpg`;
const fieldImg = `${ASSETS}/fam-training.jpg`;
const coachGubin = `${ASSETS}/coach-gubin.jpg`;
const famTraining = `${ASSETS}/fam-training.jpg`;
const famCupCelebration = `${ASSETS}/fam-cup-celebration.jpg`;

/** Основное здание / организация в Яндексе · Навигатор */
const YANDEX_ORG_NAVI =
  "https://yandex.ru/navi/org/futbolnaya_akademiya_imeni_a_v_moreva/13322284254?si=fmpafb8y7nm42udqbaeyp73ne0";

export const CONTACTS = {
  phone: "+79180000000",
  phoneDisplay: "+7 (918) 000-00-00",
  whatsapp: "https://wa.me/79180000000",
  telegram: "https://t.me/fam_anapa",
  max: "https://max.ru/fam_anapa",
  email: "info@fam-anapa.ru",
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
    role: "Главный тренер / тренер",
    info: "Тренер футбольной академии Морева. Работает с детскими группами, развивает технику и игровое мышление.",
    img: coachGubin,
  },
  {
    name: "Тренерский состав",
    role: "Полевые тренеры",
    info: "Команда тренеров академии работает с детьми от младших до старших групп.",
    img: famTraining,
  },
  {
    name: "Школа вратарей",
    role: "Goalkeeper coach",
    info: "Программа подготовки вратарей под руководством профильного тренера.",
    img: famCupCelebration,
  },
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
  body: "Футбольная академия имени А. В. Морева в станице Анапская. Удобный подъезд, поле для тренировок и игр.",
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
  { href: "/#about", label: "Академия" },
  { href: "/#goalkeeper", label: "Школа вратарей" },
  { href: "/#principles", label: "Принципы" },
  { href: "/#coaches", label: "Тренеры" },
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
