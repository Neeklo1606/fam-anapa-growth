import { CONTACTS, LOCATION } from "@/content/site";
import type { PublicSite } from "@/lib/admin-api";
import type { HomePageContent } from "@/lib/home-page-content";
import { formatRuPhone } from "@fam/utils";

export type ResolvedSiteContacts = {
  brandName: string;
  brandTagline: string | null;
  phoneDisplay: string | null;
  phoneTel: string | null;
  whatsapp: string | null;
  telegram: string | null;
  max: string | null;
  vk: string | null;
  email: string | null;
  address: string | null;
  yandexMaps: string | null;
  mapEmbed: string | null;
  copyrightText: string | null;
};

const DEFAULT_BRAND = "Футбольная академия Морева";

function normalizePhone(raw: string | null | undefined): { tel: string; display: string } | null {
  const s = raw?.trim();
  if (!s) return null;
  let digits = s.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;
  digits = digits.slice(0, 11);
  if (digits.length !== 11) return null;
  const tel = `+${digits}`;
  return { tel, display: formatRuPhone(tel) };
}

export function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function pickUrl(
  fromApi: string | null | undefined,
  fallback: string | null,
  apiLoaded: boolean,
): string | null {
  const v = fromApi?.trim();
  if (v && isHttpUrl(v)) return v;
  if (!apiLoaded && fallback && isHttpUrl(fallback)) return fallback;
  return null;
}

function pickText(fromApi: string | null | undefined, fallback: string | null, apiLoaded: boolean): string | null {
  const v = fromApi?.trim();
  if (v) return v;
  if (!apiLoaded && fallback?.trim()) return fallback.trim();
  return null;
}

function pickEmail(fromApi: string | null | undefined): string | null {
  const v = fromApi?.trim();
  if (!v) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
  return v;
}

/** URL Яндекс.Карт: из настроек или поиск по адресу. */
export function resolveYandexMapsLink(
  explicitUrl: string | null | undefined,
  address: string | null | undefined,
): string | null {
  const url = explicitUrl?.trim();
  if (url && isHttpUrl(url)) return url;
  const addr = address?.trim();
  if (!addr) return null;
  const query = addr.replace(/\s*\n+\s*/g, ", ");
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;
}

/** Контакты из API; пустые/невалидные поля не попадают в UI (fallback только если API недоступен). */
export function resolveSiteContacts(pub: PublicSite | null): ResolvedSiteContacts {
  const apiLoaded = pub !== null;

  const phone =
    normalizePhone(pub?.phone) ?? (!apiLoaded ? normalizePhone(CONTACTS.phone) : null);

  const address = pickText(pub?.address, CONTACTS.addressFull, apiLoaded);
  const yandexExplicit = pickUrl(pub?.yandexMapUrl, CONTACTS.yandexMaps, apiLoaded);

  return {
    brandName: pub?.brandName?.trim() || DEFAULT_BRAND,
    brandTagline: pub?.brandTagline?.trim() || null,
    phoneDisplay: phone?.display ?? null,
    phoneTel: phone?.tel ?? null,
    whatsapp: pickUrl(pub?.whatsapp, CONTACTS.whatsapp, apiLoaded),
    telegram: pickUrl(pub?.telegram, CONTACTS.telegram, apiLoaded),
    max: pickUrl(pub?.maxLink, CONTACTS.max, apiLoaded),
    vk: pickUrl(pub?.vkLink, CONTACTS.vk, apiLoaded),
    email: pub ? pickEmail(pub.email) : null,
    address,
    yandexMaps: yandexExplicit ?? resolveYandexMapsLink(null, address),
    mapEmbed: pickUrl(pub?.mapEmbed, LOCATION.embedSrc, apiLoaded),
    copyrightText: pub?.copyrightText?.trim() || null,
  };
}

/** Подмешать адрес и карту из «Настроек сайта» в блок локации на главной. */
export function applyPublicSiteToHome(home: HomePageContent, pub: PublicSite): HomePageContent {
  const location = { ...home.location };

  const addr = pub.address?.trim();
  if (addr) location.address = addr;

  location.mapUrl =
    resolveYandexMapsLink(pub.yandexMapUrl, addr || location.address) ?? "";

  const embed = pub.mapEmbed?.trim();
  location.embedSrc = embed && isHttpUrl(embed) ? embed : "";

  return { ...home, location };
}

export type ContactCard = {
  key: string;
  label: string;
  value: string;
  href: string;
  external: boolean;
};

/** Карточки для страницы /contacts — только настроенные каналы. */
export function buildContactCards(c: ResolvedSiteContacts): ContactCard[] {
  const cards: ContactCard[] = [];
  if (c.phoneTel && c.phoneDisplay) {
    cards.push({
      key: "phone",
      label: c.max ? "Телефон" : "Телефон · MAX",
      value: c.phoneDisplay,
      href: `tel:${c.phoneTel}`,
      external: false,
    });
  }
  if (c.whatsapp) {
    cards.push({ key: "wa", label: "WhatsApp", value: "Написать", href: c.whatsapp, external: true });
  }
  if (c.telegram) {
    cards.push({ key: "tg", label: "Telegram", value: "Написать", href: c.telegram, external: true });
  }
  if (c.max) {
    cards.push({ key: "max", label: "MAX", value: "Написать", href: c.max, external: true });
  }
  if (c.vk) {
    cards.push({ key: "vk", label: "ВКонтакте", value: "Перейти", href: c.vk, external: true });
  }
  if (c.email) {
    cards.push({
      key: "email",
      label: "Email",
      value: c.email,
      href: `mailto:${c.email}`,
      external: false,
    });
  }
  if (c.yandexMaps && c.address) {
    cards.push({
      key: "map",
      label: "Адрес",
      value: c.address,
      href: c.yandexMaps,
      external: true,
    });
  }
  return cards;
}
