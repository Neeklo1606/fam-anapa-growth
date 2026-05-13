import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { TelegramNotifyAdminController } from "./telegram-notify-admin.controller";
import { TelegramNotifyWebhookController } from "./telegram-notify-webhook.controller";
import { TelegramNotifyInboundService } from "./telegram-notify-inbound.service";
import { TelegramNotifyIntegrationService } from "./telegram-notify-integration.service";

@Module({
  imports: [PrismaModule],
  controllers: [TelegramNotifyWebhookController, TelegramNotifyAdminController],
  providers: [TelegramNotifyIntegrationService, TelegramNotifyInboundService],
  exports: [TelegramNotifyIntegrationService],
})
export class TelegramNotifyModule {}
