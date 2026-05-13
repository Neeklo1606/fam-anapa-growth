-- CreateEnum
CREATE TYPE "MaxNotifySubscriberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "max_notify_subscribers" (
    "id" TEXT NOT NULL,
    "maxUserId" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "status" "MaxNotifySubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "max_notify_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "max_notify_subscribers_maxUserId_key" ON "max_notify_subscribers"("maxUserId");

CREATE INDEX "max_notify_subscribers_status_createdAt_idx" ON "max_notify_subscribers"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "max_notify_subscribers" ADD CONSTRAINT "max_notify_subscribers_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
