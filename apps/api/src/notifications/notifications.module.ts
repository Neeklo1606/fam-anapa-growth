import { Module } from "@nestjs/common";

import { TelegramNotifyModule } from "../telegram-notify/telegram-notify.module";

import { LeadNotificationMailService } from "./lead-notification-mail.service";
import { NotificationsQueueService } from "./notifications-queue.service";

@Module({
  imports: [TelegramNotifyModule],
  providers: [NotificationsQueueService, LeadNotificationMailService],
  exports: [NotificationsQueueService],
})
export class NotificationsModule {}
