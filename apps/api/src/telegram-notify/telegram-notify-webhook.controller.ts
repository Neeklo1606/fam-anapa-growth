import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";

import { TelegramNotifyInboundService } from "./telegram-notify-inbound.service";
import { TelegramNotifyIntegrationService } from "./telegram-notify-integration.service";

@Controller("integrations/telegram")
@SkipThrottle()
export class TelegramNotifyWebhookController {
  constructor(
    private readonly integration: TelegramNotifyIntegrationService,
    private readonly inbound: TelegramNotifyInboundService,
  ) {}

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async webhook(@Req() req: Request & { body: Record<string, unknown> }) {
    const secret = req.headers["x-telegram-bot-api-secret-token"];
    await this.integration.verifyIncomingSecret(
      typeof secret === "string" ? secret : undefined,
    );
    const body = req.body;
    if (body && typeof body === "object") {
      await this.inbound.handleRawUpdate(body as Record<string, unknown>);
    }
    return { ok: true };
  }
}
