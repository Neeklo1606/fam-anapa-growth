import { Module } from "@nestjs/common";

import { TelegramNotifyModule } from "../telegram-notify/telegram-notify.module";

import { NotificationsQueueService } from "./notifications-queue.service";

@Module({
  imports: [TelegramNotifyModule],
  providers: [NotificationsQueueService],
  exports: [NotificationsQueueService],
})
export class NotificationsModule {}
