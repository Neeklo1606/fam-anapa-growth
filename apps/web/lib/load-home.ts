import { fetchPublicSite } from "@/lib/admin-api";
import { mergeStoredHomePage, type HomePageContent } from "@/lib/home-page-content";
import { applyPublicSiteToHome, resolveSiteContacts, type ResolvedSiteContacts } from "@/lib/site-contacts";

/** Контент главной + контакты для внутренних SEO-страниц (тексты редактируются в админке). */
export async function loadHomeAndContacts(): Promise<{ home: HomePageContent; contacts: ResolvedSiteContacts }> {
  try {
    const pub = await fetchPublicSite();
    return {
      home: applyPublicSiteToHome(mergeStoredHomePage(pub.homeContent), pub),
      contacts: resolveSiteContacts(pub),
    };
  } catch {
    return { home: mergeStoredHomePage(null), contacts: resolveSiteContacts(null) };
  }
}
