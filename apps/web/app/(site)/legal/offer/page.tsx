import type { Metadata } from "next";

import { LegalLayout } from "@/components/site/LegalLayout";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Публичная оферта",
  description: "Публичная оферта на оказание услуг футбольной академии Морева.",
  alternates: { canonical: `${SITE_URL}/legal/offer` },
  openGraph: {
    url: `${SITE_URL}/legal/offer`,
    type: "website",
    locale: "ru_RU",
  },
};

export default function OfferPage() {
  return (
    <LegalLayout title="Публичная оферта" updated="2026">
      <h2>1. Общие условия</h2>
      <p>
        Настоящая оферта является официальным предложением Академии заключить договор на оказание
        услуг по проведению футбольных тренировок для детей.
      </p>
      <h2>2. Услуги</h2>
      <p>
        Тренировки в группах для детей от 4 до 14 лет, школа вратарей, индивидуальные занятия по
        согласованию.
      </p>
      <h2>3. Стоимость и оплата</h2>
      <p>
        Актуальная стоимость занятий уточняется у администратора Академии при оформлении заявки.
      </p>
      <h2>4. Порядок отказа</h2>
      <p>Отказ от услуг и возврат средств осуществляется в соответствии с законодательством РФ.</p>
      <h2>5. Реквизиты</h2>
      <p>Полные реквизиты Академии предоставляются по запросу.</p>
    </LegalLayout>
  );
}
