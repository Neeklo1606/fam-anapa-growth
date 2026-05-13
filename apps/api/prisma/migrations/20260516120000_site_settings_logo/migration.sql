-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "logo_media_id" TEXT;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "logo_fallback_url" VARCHAR(500);

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_logo_media_id_key" ON "site_settings"("logo_media_id");

-- AddForeignKey
ALTER TABLE "site_settings"
ADD CONSTRAINT "site_settings_logo_media_id_fkey"
FOREIGN KEY ("logo_media_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
