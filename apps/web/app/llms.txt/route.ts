import { fetchPublicSite } from "@/lib/admin-api";
import { mergeStoredHomePage } from "@/lib/home-page-content";
import { applyPublicSiteToHome, resolveSiteContacts } from "@/lib/site-contacts";
import { SITE_URL } from "@/lib/utils";

/**
 * /llms.txt — краткая справка о сайте для ИИ-ассистентов и ИИ-поиска (GEO).
 * Собирается из контактов и FAQ, заданных в админке.
 */
export const revalidate = 3600;

export async function GET() {
  let contacts = resolveSiteContacts(null);
  let home = mergeStoredHomePage(null);
  try {
    const pub = await fetchPublicSite();
    contacts = resolveSiteContacts(pub);
    home = applyPublicSiteToHome(mergeStoredHomePage(pub.homeContent), pub);
  } catch {
    /* API недоступна — отдаём дефолты */
  }

  const lines: string[] = [
    `# ${contacts.brandName}`,
    "",
    "> Детская футбольная академия в Анапе (станица Анапская, Краснодарский край) для детей от 6 до 14 лет: тренировки по футболу, школа вратарей, пробное занятие по записи.",
    "",
    "## Контакты",
  ];
  if (contacts.address) lines.push(`- Адрес: ${contacts.address}`);
  if (contacts.phoneDisplay) lines.push(`- Телефон: ${contacts.phoneDisplay}`);
  if (contacts.email) lines.push(`- Email: ${contacts.email}`);
  if (contacts.whatsapp) lines.push(`- WhatsApp: ${contacts.whatsapp}`);
  if (contacts.telegram) lines.push(`- Telegram: ${contacts.telegram}`);
  if (contacts.max) lines.push(`- MAX: ${contacts.max}`);
  if (contacts.vk) lines.push(`- ВКонтакте: ${contacts.vk}`);
  if (contacts.yandexMaps) lines.push(`- На карте: ${contacts.yandexMaps}`);

  lines.push(
    "",
    "## Страницы",
    `- [Главная](${SITE_URL}/): об академии, школа вратарей, тренеры, место тренировок, запись`,
    `- [Записаться на пробное занятие](${SITE_URL}/#contacts): форма заявки`,
    `- [Футбол для детей 6–14 лет](${SITE_URL}/futbol-dlya-detej)`,
    `- [Школа вратарей](${SITE_URL}/shkola-vratarej)`,
    `- [Тренеры](${SITE_URL}/trenery)`,
    `- [Об академии](${SITE_URL}/o-akademii)`,
    `- [Контакты](${SITE_URL}/contacts)`,
    `- [Политика конфиденциальности](${SITE_URL}/legal/privacy)`,
  );

  const about = home.about?.paragraphs?.filter(Boolean) ?? [];
  if (about.length) lines.push("", "## Об академии", ...about.map((p) => p.trim()));
  if (home.goalkeeper?.body) lines.push("", `## ${home.goalkeeper.title || "Школа вратарей"}`, home.goalkeeper.body.trim());

  const faq = (home.faq?.items ?? []).filter((x) => x.q?.trim() && x.a?.trim());
  if (faq.length) {
    lines.push("", "## Частые вопросы");
    for (const x of faq) lines.push("", `### ${x.q.trim()}`, x.a.trim());
  }

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
