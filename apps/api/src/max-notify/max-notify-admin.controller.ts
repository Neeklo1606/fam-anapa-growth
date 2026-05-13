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
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

import { ReviewMaxSubscriberDto, UpdateMaxNotifyDto } from "./dto/max-notify-admin.dto";
import { MaxNotifyIntegrationService } from "./max-notify-integration.service";

@Controller("notifications/max")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaxNotifyAdminController {
  constructor(
    private readonly integration: MaxNotifyIntegrationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles("ADMIN", "EDITOR", "MANAGER")
  getState() {
    return this.integration.getAdminState();
  }

  @Patch()
  @Roles("ADMIN")
  patchConfig(@Body() dto: UpdateMaxNotifyDto) {
    if (dto.removeBot) {
      return this.integration.updateFromAdmin({ removeBot: true });
    }
    return this.integration.updateFromAdmin({
      botAccessToken: dto.botAccessToken,
      publicAppUrl:
        dto.publicAppUrl === undefined ? undefined : (dto.publicAppUrl ?? undefined),
    });
  }

  @Post("webhook/sync")
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN")
  syncWebhook() {
    return this.integration.syncWebhookSubscription();
  }

  @Patch("subscribers/:id")
  @Roles("ADMIN", "EDITOR", "MANAGER")
  async reviewSubscriber(
    @Param("id") id: string,
    @Body() dto: ReviewMaxSubscriberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const row = await this.prisma.maxNotifySubscriber.findUnique({ where: { id } });
    if (!row || row.status !== "PENDING") {
      throw new NotFoundException("Заявка не найдена или уже обработана");
    }
    await this.prisma.maxNotifySubscriber.update({
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
          ? "✅ Доступ к уведомлениям о заявках подтверждён. Новые заявки будут приходить в MAX."
          : "Заявка на уведомления отклонена администратором.";
      try {
        await this.integration.sendDmText(tok, row.maxUserId, msg);
      } catch {
        /* ignore */
      }
    }
    return this.integration.getAdminState();
  }

  @Patch("subscribers/:id/revoke")
  @Roles("ADMIN", "EDITOR", "MANAGER")
  async revoke(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const row = await this.prisma.maxNotifySubscriber.findUnique({ where: { id } });
    if (!row || row.status !== "APPROVED") {
      throw new NotFoundException("Пользователь не в списке одобренных");
    }
    await this.prisma.maxNotifySubscriber.update({
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
        await this.integration.sendDmText(
          tok,
          row.maxUserId,
          "Доступ к уведомлениям о заявках отключён администратором.",
        );
      } catch {
        /* ignore */
      }
    }
    return this.integration.getAdminState();
  }
}
