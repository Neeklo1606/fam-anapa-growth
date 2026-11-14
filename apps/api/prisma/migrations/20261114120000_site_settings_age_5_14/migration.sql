-- Возраст приёма в академию — с 5 лет (14.11.2026): «6–14» → «5–14» в текстах настроек сайта.
UPDATE "site_settings" SET "brandTagline" = replace(replace("brandTagline", '6–14', '5–14'), 'от 6 до 14', 'от 5 до 14')
  WHERE "brandTagline" LIKE '%6–14%' OR "brandTagline" LIKE '%от 6 до 14%';

UPDATE "site_settings" SET "seo_title" = replace(replace("seo_title", '6–14', '5–14'), 'от 6 до 14', 'от 5 до 14')
  WHERE "seo_title" LIKE '%6–14%' OR "seo_title" LIKE '%от 6 до 14%';

UPDATE "site_settings" SET "seo_description" = replace(replace("seo_description", '6–14', '5–14'), 'от 6 до 14', 'от 5 до 14')
  WHERE "seo_description" LIKE '%6–14%' OR "seo_description" LIKE '%от 6 до 14%';

UPDATE "site_settings" SET "seo_keywords" = replace(replace("seo_keywords", '6–14', '5–14'), 'от 6 до 14', 'от 5 до 14')
  WHERE "seo_keywords" LIKE '%6–14%' OR "seo_keywords" LIKE '%от 6 до 14%';
