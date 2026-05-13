/**
 * Создать или обновить пользователя ADMIN (для боевого/нового VPS).
 *
 *   cd apps/api && set -a && source .env && set +a
 *   ADMIN_EMAIL=a@b.ru ADMIN_PASSWORD='***' ADMIN_NAME='ФИО' node scripts/ensure-admin-user.cjs
 *   Или: ADMIN_NAME_FILE=/path/to/display-name.txt (UTF-8, одна строка).
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

async function main() {
  const emailRaw = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];
  let fullName = process.env.ADMIN_NAME || process.argv[4] || "Администратор";
  const nameFile = process.env.ADMIN_NAME_FILE;
  if (nameFile) {
    const fs = require("node:fs");
    fullName =
      fs.readFileSync(nameFile, "utf8").replace(/\r?\n+$/, "").trim() || fullName;
  }
  const email = String(emailRaw || "")
    .trim()
    .toLowerCase();

  if (!email || !password) {
    console.error(
      "Укажите ADMIN_EMAIL и ADMIN_PASSWORD (или аргументы: email password [fullName]).",
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      fullName: fullName.trim() || "Администратор",
      role: "ADMIN",
      isActive: true,
    },
    update: {
      passwordHash,
      fullName: fullName.trim() || "Администратор",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`[ensure-admin-user] OK id=${user.id} email=${user.email} role=${user.role}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
