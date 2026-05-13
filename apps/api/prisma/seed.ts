/**
 * One-shot seed:
 *   - creates the initial ADMIN user from env (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)
 *   - inserts default SiteSettings row
 *
 * Re-running is idempotent.
 *
 * Usage:
 *   pnpm --filter @fam/api exec ts-node prisma/seed.ts
 *   # or with explicit env:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret pnpm --filter @fam/api exec ts-node prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@morev.neeklo.ru").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe-NOW-please!";
  const fullName = process.env.ADMIN_NAME ?? "Системный администратор";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] admin user ${email} already exists (id=${existing.id})`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    const created = await prisma.user.create({
      data: { email, passwordHash, fullName, role: "ADMIN", isActive: true },
    });
    console.log(`[seed] admin created id=${created.id} email=${email}`);
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    await prisma.siteSettings.create({
      data: {
        id: 1,
        brandName: "Футбольная академия Морева",
        brandTagline: "Анапа · футбол для детей 6–14 лет",
        phone: "+79180000000",
        whatsapp: "https://wa.me/79180000000",
        telegram: "https://t.me/fam_anapa",
        email: "info@fam-anapa.ru",
        address: "Анапа, Краснодарский край",
      },
    });
    console.log("[seed] siteSettings row created");
  } else {
    console.log("[seed] siteSettings already present");
  }

  const coachCount = await prisma.coach.count();
  if (coachCount === 0) {
    const baseline = [
      {
        fullName: "Губин Алексей Олегович",
        role: "Главный тренер",
        shortDescription:
          "Тренер футбольной академии Морева. Работает с детскими группами, развивает технику и игровое мышление.",
        photoUrl: "/img/coach-gubin.jpg",
        order: 0,
      },
      {
        fullName: "Тренерский состав",
        role: "Полевые тренеры",
        shortDescription:
          "Команда тренеров академии работает с детскими группами от 6 до 14 лет.",
        photoUrl: "/img/fam-training.jpg",
        order: 1,
      },
      {
        fullName: "Школа вратарей",
        role: "Goalkeeper coach",
        shortDescription:
          "Отдельная программа подготовки вратарей под руководством профильного тренера.",
        photoUrl: "/img/fam-cup-celebration.jpg",
        order: 2,
      },
    ];
    for (const c of baseline) {
      await prisma.coach.create({ data: c });
    }
    console.log(`[seed] coaches seeded: ${baseline.length}`);
  } else {
    console.log(`[seed] coaches already present (${coachCount})`);
  }

  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    const slides: Array<{ url: string; label: string }> = [
      { url: "/img/fam-training.jpg", label: "Тренировочное поле" },
      { url: "/img/fam-cup-night.jpg", label: "Вечерние занятия" },
      { url: "/img/fam-team-diplomas.jpg", label: "Награждение" },
      { url: "/img/fam-cup-celebration.jpg", label: "Игровой момент" },
      { url: "/img/p-kick.jpg", label: "Работа с мячом" },
      { url: "/img/p-dribble.jpg", label: "Ведение" },
      { url: "/img/p-ball.jpg", label: "Тренировка" },
    ];
    for (const [i, s] of slides.entries()) {
      const media = await prisma.mediaFile.create({
        data: {
          url: s.url,
          mime: "image/jpeg",
          kind: "IMAGE",
          altDefault: s.label,
        },
      });
      await prisma.galleryItem.create({
        data: {
          mediaId: media.id,
          alt: s.label,
          title: s.label,
          category: "FIELD",
          order: i,
          active: true,
        },
      });
    }
    console.log(`[seed] gallery_items seeded: ${slides.length}`);
  } else {
    console.log(`[seed] gallery already present (${galleryCount})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
