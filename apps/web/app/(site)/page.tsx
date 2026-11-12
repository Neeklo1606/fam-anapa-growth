import { HomeShell } from "@/components/site/HomeShell";

import { fetchPublicSite } from "@/lib/admin-api";
import { mergeStoredHomePage } from "@/lib/home-page-content";
import { applyPublicSiteToHome } from "@/lib/site-contacts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// metadata главной берётся из (site)/layout.tsx → SEO-поля в админке (Настройки → SEO).

export default async function HomePage() {
  let home = mergeStoredHomePage(null);
  try {
    const pub = await fetchPublicSite();
    home = mergeStoredHomePage(pub.homeContent);
    home = applyPublicSiteToHome(home, pub);
  } catch {
    /* API может быть недоступна при сборке — рендерим дефолты */
  }

  const faqItems = home.faq?.show
    ? home.faq.items.filter((x) => x.q?.trim() && x.a?.trim())
    : [];
  const faqLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((x) => ({
            "@type": "Question",
            name: x.q.trim(),
            acceptedAnswer: { "@type": "Answer", text: x.a.trim() },
          })),
        }
      : null;

  return (
    <>
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }}
        />
      )}
      <HomeShell home={home} />
    </>
  );
}
