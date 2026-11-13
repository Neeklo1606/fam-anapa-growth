import type { Metadata } from "next";

import { ServicePage, ServiceSection } from "@/components/site/ServicePage";
import { SiteImage } from "@/components/site/SiteImage";
import { loadHomeAndContacts } from "@/lib/load-home";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PATH = "/shkola-vratarej";

export const metadata: Metadata = {
  title: "Школа вратарей в Анапе — тренировки для детей",
  description:
    "Школа вратарей Футбольной академии Морева в Анапе: индивидуальные тренировки вратарей для детей под руководством опытных тренеров. Запись на пробное занятие.",
  alternates: { canonical: PATH },
  openGraph: { title: "Школа вратарей · Академия Морева, Анапа", url: `${SITE_URL}${PATH}` },
};

const FOCUS = [
  { t: "Техника", d: "Стойка, ловля, отбивание, выбор позиции в воротах." },
  { t: "Реакция и координация", d: "Упражнения на скорость реакции, прыжки и падения без травм." },
  { t: "Игра ногами", d: "Пас, вынос мяча и участие вратаря в розыгрыше." },
  { t: "Уверенность", d: "Психология вратаря: спокойствие, лидерство и игра под давлением." },
];

export default async function Page() {
  const { home, contacts } = await loadHomeAndContacts();
  return (
    <ServicePage
      path={PATH}
      eyebrow="Индивидуальные тренировки"
      title="Школа"
      accent="вратарей"
      lead={home.goalkeeper.body}
      extraLd={[
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Школа вратарей для детей",
          serviceType: "Тренировки вратарей",
          areaServed: { "@type": "City", name: "Анапа" },
          provider: { "@type": "SportsActivityLocation", name: contacts.brandName, url: SITE_URL, telephone: contacts.phoneTel ?? undefined },
        },
      ]}
    >
      <ServiceSection title="Над чем работаем">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <ul className="grid gap-4 sm:grid-cols-2">
            {FOCUS.map((f) => (
              <li key={f.t} className="rounded-3xl border border-line bg-white p-5 shadow-soft">
                <h3 className="font-display text-lg text-deep">{f.t}</h3>
                <p className="mt-1.5 text-sm text-ink/70 leading-relaxed">{f.d}</p>
              </li>
            ))}
          </ul>
          {home.goalkeeper.videoPoster ? (
            <div className="relative aspect-video overflow-hidden rounded-3xl bg-night shadow-elevated">
              <SiteImage
                src={home.goalkeeper.videoPoster}
                alt="Тренировка вратарей в Футбольной академии Морева"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </ServiceSection>
    </ServicePage>
  );
}
