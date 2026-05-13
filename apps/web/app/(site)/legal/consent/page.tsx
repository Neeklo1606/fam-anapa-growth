import type { Metadata } from "next";

import { LegalLayout } from "@/components/site/LegalLayout";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных",
  description: "Согласие на обработку персональных данных.",
  alternates: { canonical: `${SITE_URL}/legal/consent` },
  openGraph: {
    url: `${SITE_URL}/legal/consent`,
    type: "website",
    locale: "ru_RU",
  },
};

export default function ConsentPage() {
  return (
    <LegalLayout title="Согласие на обработку персональных данных" updated="2026">
      <p>
        Оставляя заявку на сайте Футбольной академии Морева, пользователь подтверждает своё согласие
        на обработку указанных персональных данных в целях связи и подбора подходящей группы
        тренировок.
      </p>
      <h2>Перечень данных</h2>
      <p>Имя, контактный телефон, мессенджер, возраст ребёнка.</p>
      <h2>Срок действия согласия</h2>
      <p>
        Согласие действует до момента его отзыва пользователем письменным обращением в Академию.
      </p>
      <h2>Отзыв согласия</h2>
      <p>Пользователь может отозвать согласие, направив обращение через раздел «Контакты» сайта.</p>
    </LegalLayout>
  );
}
