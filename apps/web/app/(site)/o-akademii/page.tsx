import type { Metadata } from "next";

import { PrinciplesList } from "@/components/site/PrinciplesList";
import { ServicePage, ServiceSection } from "@/components/site/ServicePage";
import { SiteImage } from "@/components/site/SiteImage";
import { loadHomeAndContacts } from "@/lib/load-home";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PATH = "/o-akademii";

export const metadata: Metadata = {
  title: "Об академии имени Андрея Морева",
  description:
    "Футбольная академия имени Андрея Валерьевича Морева в Анапе: современный подход к обучению детей футболу, дисциплина, уважение и любовь к игре.",
  alternates: { canonical: PATH },
  openGraph: { title: "Об академии · Футбольная академия Морева", url: `${SITE_URL}${PATH}` },
};

export default async function Page() {
  const { home } = await loadHomeAndContacts();
  return (
    <ServicePage
      path={PATH}
      eyebrow="История и подход"
      title="Об"
      accent="академии"
      lead={home.about.paragraphs[0] ?? ""}
    >
      <ServiceSection title="Наша история">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4 text-ink/75 text-base md:text-lg leading-relaxed">
            {home.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {home.about.imageUrl ? (
            <div className="relative aspect-[1148/1072] overflow-hidden rounded-3xl bg-white shadow-elevated">
              <SiteImage src={home.about.imageUrl} alt={home.about.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          ) : null}
        </div>
      </ServiceSection>
      <ServiceSection title="Наши принципы">
        <PrinciplesList items={home.principles.items} />
      </ServiceSection>
      <ServiceSection title="Локация">
        <p className="max-w-3xl text-ink/75 text-base md:text-lg leading-relaxed">{home.location.body}</p>
      </ServiceSection>
    </ServicePage>
  );
}
