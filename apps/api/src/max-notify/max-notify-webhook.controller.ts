import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";

import { MaxNotifyInboundService } from "./max-notify-inbound.service";
import { MaxNotifyIntegrationService } from "./max-notify-integration.service";

/**
 * Приём входящих событий MAX (webhook-сабскрипт).
 * Тело может отличаться от OpenAPI-схемы — передаём сырой JSON.
 */
@Controller("integrations/max")
@SkipThrottle()
export class MaxNotifyWebhookController {
  constructor(
    private readonly integration: MaxNotifyIntegrationService,
    private readonly inbound: MaxNotifyInboundService,
  ) {}

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async webhook(@Req() req: Request & { body: unknown }) {
    const secret = req.headers["x-max-bot-api-secret"];
    await this.integration.verifyIncomingSecret(typeof secret === "string" ? secret : undefined);
    let body = req.body as Record<string, unknown>;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body) as Record<string, unknown>;
      } catch {
        throw new UnauthorizedException();
      }
    }
    if (!body || typeof body !== "object") {
      return { ok: true };
    }
    await this.inbound.handleUpdate(body);
    return { ok: true };
  }
}
