import { Module } from "@nestjs/common";

import { MaxNotifyModule } from "../max-notify/max-notify.module";
import { TelegramNotifyModule } from "../telegram-notify/telegram-notify.module";

import { LeadNotificationMailService } from "./lead-notification-mail.service";
import { NotificationsQueueService } from "./notifications-queue.service";

@Module({
  imports: [TelegramNotifyModule, MaxNotifyModule],
  providers: [NotificationsQueueService, LeadNotificationMailService],
  exports: [NotificationsQueueService],
})
export class NotificationsModule {}
