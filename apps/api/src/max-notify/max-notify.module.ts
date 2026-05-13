import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { MaxNotifyAdminController } from "./max-notify-admin.controller";
import { MaxNotifyWebhookController } from "./max-notify-webhook.controller";
import { MaxNotifyInboundService } from "./max-notify-inbound.service";
import { MaxNotifyIntegrationService } from "./max-notify-integration.service";

@Module({
  imports: [PrismaModule],
  controllers: [MaxNotifyWebhookController, MaxNotifyAdminController],
  providers: [MaxNotifyIntegrationService, MaxNotifyInboundService],
  exports: [MaxNotifyIntegrationService],
})
export class MaxNotifyModule {}
