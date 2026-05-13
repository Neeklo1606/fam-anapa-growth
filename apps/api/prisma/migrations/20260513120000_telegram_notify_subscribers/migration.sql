-- CreateEnum
CREATE TYPE "TelegramNotifySubscriberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "telegram_notify_subscribers" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" "TelegramNotifySubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "telegram_notify_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_notify_subscribers_chatId_key" ON "telegram_notify_subscribers"("chatId");

CREATE INDEX "telegram_notify_subscribers_status_createdAt_idx" ON "telegram_notify_subscribers"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "telegram_notify_subscribers" ADD CONSTRAINT "telegram_notify_subscribers_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
