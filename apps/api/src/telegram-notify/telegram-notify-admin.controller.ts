import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

import { ReviewTelegramSubscriberDto, UpdateTelegramNotifyDto } from "./dto/telegram-notify-admin.dto";
import { TelegramNotifyIntegrationService } from "./telegram-notify-integration.service";

@Controller("notifications/telegram")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TelegramNotifyAdminController {
  constructor(
    private readonly integration: TelegramNotifyIntegrationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles("ADMIN", "EDITOR", "MANAGER")
  async getState() {
    return this.integration.getAdminState();
  }

  @Patch()
  @Roles("ADMIN")
  async patchConfig(@Body() dto: UpdateTelegramNotifyDto) {
    if (dto.removeBotToken) {
      return this.integration.updateFromAdmin({ removeBotToken: true });
    }
    return this.integration.updateFromAdmin({
      botToken: dto.botToken,
      publicAppUrl:
        dto.publicAppUrl === undefined ? undefined : (dto.publicAppUrl ?? undefined),
      leadOutboundWebhookUrl:
        dto.leadOutboundWebhookUrl === undefined
          ? undefined
          : dto.leadOutboundWebhookUrl ?? null,
    });
  }

  @Post("webhook/sync")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  async syncWebhook() {
    const c = await this.integration.loadConfig();
    const tok = c.botToken?.trim();
    const pub = c.publicAppUrl?.trim();
    if (!tok || !pub) {
      throw new UnauthorizedException("Сначала укажите токен бота и публичный HTTPS URL сайта.");
    }
    const withSecret = this.integration.ensureSecretToken(c);
    await this.integration.saveConfigJson(withSecret);
    await this.integration.registerTelegramWebhook(
      tok,
      this.integration.buildWebhookUrl(pub),
      withSecret.webhookSecretToken!,
    );
    return this.integration.getAdminState();
  }

  @Patch("subscribers/:id")
  @Roles("ADMIN", "EDITOR", "MANAGER")
  async reviewSubscriber(
    @Param("id") id: string,
    @Body() dto: ReviewTelegramSubscriberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const row = await this.prisma.telegramNotifySubscriber.findUnique({ where: { id } });
    if (!row || row.status !== "PENDING") {
      throw new NotFoundException("Заявка не найдена или уже обработана");
    }
    await this.prisma.telegramNotifySubscriber.update({
      where: { id },
      data: {
        status: dto.decision === "approve" ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
        reviewedById: user.id,
      },
    });
    const tok = await this.integration.getBotTokenForOutbound();
    if (tok) {
      const msg =
        dto.decision === "approve"
          ? "✅ Доступ к уведомлениям о заявках подтверждён. Новые заявки будут приходить в этот чат."
          : "Заявка на уведомления отклонена администратором.";
      try {
        await this.integration.sendChatMessage(tok, row.chatId, msg);
      } catch {
        /* ignore tg errors */
      }
    }
    return this.integration.getAdminState();
  }

  @Patch("subscribers/:id/revoke")
  @Roles("ADMIN", "EDITOR", "MANAGER")
  async revoke(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const row = await this.prisma.telegramNotifySubscriber.findUnique({ where: { id } });
    if (!row || row.status !== "APPROVED") {
      throw new NotFoundException("Чат не в списке одобренных");
    }
    await this.prisma.telegramNotifySubscriber.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: user.id,
      },
    });
    const tok = await this.integration.getBotTokenForOutbound();
    if (tok) {
      try {
        await this.integration.sendChatMessage(
          tok,
          row.chatId,
          "Доступ к уведомлениям о заявках отключён администратором.",
        );
      } catch {
        /* ignore */
      }
    }
    return this.integration.getAdminState();
  }
}
