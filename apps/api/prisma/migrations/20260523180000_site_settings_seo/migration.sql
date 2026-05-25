ALTER TABLE "site_settings" ADD COLUMN "seo_title" VARCHAR(200);
ALTER TABLE "site_settings" ADD COLUMN "seo_description" TEXT;
ALTER TABLE "site_settings" ADD COLUMN "seo_keywords" TEXT;
ALTER TABLE "site_settings" ADD COLUMN "og_image_fallback_url" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "favicon_fallback_url" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "copyright_text" VARCHAR(200);
