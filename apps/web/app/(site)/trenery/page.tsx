import type { Metadata } from "next";

import { ServicePage, ServiceSection } from "@/components/site/ServicePage";
import { SiteImage } from "@/components/site/SiteImage";
import { loadHomeAndContacts } from "@/lib/load-home";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PATH = "/trenery";

export const metadata: Metadata = {
  title: "Тренеры академии — тренерский штаб",
  description:
    "Тренерский штаб Футбольной академии Морева в Анапе: главный тренер с лицензией «С-УЕФА» и тренеры с высшим спортивным образованием.",
  alternates: { canonical: PATH },
  openGraph: { title: "Тренеры · Футбольная академия Морева", url: `${SITE_URL}${PATH}` },
};

export default async function Page() {
  const { home, contacts } = await loadHomeAndContacts();
  const coaches = home.coachesSection.staticCoaches.filter((c) => c.fullName.trim());
  return (
    <ServicePage
      path={PATH}
      eyebrow="Тренерский штаб"
      title="Наши"
      accent="тренеры"
      lead={home.coachesSection.subtitle}
      extraLd={coaches.map((c) => ({
        "@context": "https://schema.org",
        "@type": "Person",
        name: c.fullName,
        jobTitle: c.role,
        ...(c.shortDescription ? { description: c.shortDescription } : {}),
        worksFor: { "@type": "SportsActivityLocation", name: contacts.brandName, url: SITE_URL },
      }))}
    >
      <ServiceSection title="Тренерский штаб">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((c) => (
            <li key={c.fullName} className="overflow-hidden rounded-3xl bg-night text-white shadow-soft">
              <div className="relative aspect-[4/5]">
                {c.photoUrl ? (
                  <SiteImage src={c.photoUrl} alt={c.fullName} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover object-[center_18%]" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-deep via-night to-night">
                    <span className="font-display text-7xl text-white/90">
                      {c.fullName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
                    </span>
                  </div>
                )}
              </div>
              <div className="relative px-5 py-4">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-flame to-transparent" />
                <h3 className="font-display text-lg leading-tight">{c.fullName}</h3>
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">{c.role}</p>
                {c.shortDescription ? <p className="mt-1.5 text-sm text-white/70">{c.shortDescription}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </ServiceSection>
    </ServicePage>
  );
}
