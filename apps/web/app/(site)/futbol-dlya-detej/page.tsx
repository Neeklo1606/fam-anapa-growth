import type { Metadata } from "next";

import { PrinciplesList } from "@/components/site/PrinciplesList";
import { ServicePage, ServiceSection } from "@/components/site/ServicePage";
import { loadHomeAndContacts } from "@/lib/load-home";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PATH = "/futbol-dlya-detej";

export const metadata: Metadata = {
  title: "Футбол для детей в Анапе — секция 5–14 лет",
  description:
    "Футбольная секция для детей 5–14 лет в Анапе: тренировки на профессиональном стадионе с искусственным газоном, опытные тренеры, игровой метод. Запишите ребёнка на пробное занятие.",
  alternates: { canonical: PATH },
  openGraph: { title: "Футбол для детей в Анапе · Академия Морева", url: `${SITE_URL}${PATH}` },
};

export default async function Page() {
  const { home, contacts } = await loadHomeAndContacts();
  const faq = home.faq.items.filter((x) => x.q.trim() && x.a.trim());
  return (
    <ServicePage
      path={PATH}
      eyebrow="Футбольная секция · 5–14 лет"
      title="Футбол для детей"
      accent="в Анапе"
      lead="Тренировки по футболу для мальчиков и девочек от 5 до 14 лет. Группы по возрасту и уровню подготовки, профессиональный стадион и тренеры, которые любят свою работу."
      extraLd={[
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Футбольные тренировки для детей 5–14 лет",
          serviceType: "Детская футбольная секция",
          areaServed: { "@type": "City", name: "Анапа" },
          provider: { "@type": "SportsActivityLocation", name: contacts.brandName, url: SITE_URL, telephone: contacts.phoneTel ?? undefined },
          audience: { "@type": "PeopleAudience", suggestedMinAge: 6, suggestedMaxAge: 14 },
        },
      ]}
    >
      <ServiceSection title="Как мы тренируем">
        <div className="grid gap-6 lg:grid-cols-2 text-ink/75 text-base md:text-lg leading-relaxed">
          {home.about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </ServiceSection>
      <ServiceSection title="Наши принципы">
        <PrinciplesList items={home.principles.items} />
      </ServiceSection>
      <ServiceSection title="Где проходят тренировки">
        <p className="max-w-3xl text-ink/75 text-base md:text-lg leading-relaxed">{home.location.body}</p>
        {contacts.address ? <p className="mt-4 font-medium text-deep">{contacts.address}</p> : null}
      </ServiceSection>
      {faq.length ? (
        <ServiceSection title="Частые вопросы">
          <div className="divide-y divide-line border-y border-line">
            {faq.map((x) => (
              <details key={x.q} className="group py-5">
                <summary className="cursor-pointer list-none font-display text-lg text-deep [&::-webkit-details-marker]:hidden">
                  {x.q}
                </summary>
                <p className="mt-2 text-ink/70 leading-relaxed">{x.a}</p>
              </details>
            ))}
          </div>
        </ServiceSection>
      ) : null}
    </ServicePage>
  );
}
