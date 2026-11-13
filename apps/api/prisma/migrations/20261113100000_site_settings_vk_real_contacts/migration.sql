-- ВКонтакте в настройках сайта
ALTER TABLE "site_settings" ADD COLUMN "vk_link" VARCHAR(200);

-- Реальные контакты академии (13.11.2026). Меняем только пустые поля и заглушки из первоначальной установки —
-- значения, которые уже ввели в админке, не трогаем.
INSERT INTO "site_settings" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING;

UPDATE "site_settings" SET "phone" = '+79150303141'
  WHERE "id" = 1 AND ("phone" IS NULL OR "phone" = '' OR regexp_replace("phone", '\D', '', 'g') IN ('79180000000', '89180000000'));

UPDATE "site_settings" SET "vk_link" = 'https://vk.ru/f.a.morev'
  WHERE "id" = 1 AND ("vk_link" IS NULL OR "vk_link" = '');

UPDATE "site_settings" SET "whatsapp" = NULL WHERE "id" = 1 AND "whatsapp" LIKE '%79180000000%';
UPDATE "site_settings" SET "telegram" = NULL WHERE "id" = 1 AND "telegram" = 'https://t.me/fam_anapa';
UPDATE "site_settings" SET "email" = NULL WHERE "id" = 1 AND "email" = 'info@fam-anapa.ru';

-- Карта: карточка организации (стадион академии в ст-це Анапской), а не общий поиск «Анапа».
UPDATE "site_settings"
  SET "yandexMapUrl" = 'https://yandex.ru/maps/org/futbolnaya_akademiya_imeni_a_v_moreva/13322284254/'
  WHERE "id" = 1 AND ("yandexMapUrl" IS NULL OR "yandexMapUrl" = '' OR "yandexMapUrl" LIKE '%maps/?text=%');
