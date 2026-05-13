import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { TelegramNotifyIntegrationService } from "./telegram-notify-integration.service";

@Injectable()
export class TelegramNotifyInboundService {
  private readonly logger = new Logger(TelegramNotifyInboundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integration: TelegramNotifyIntegrationService,
  ) {}

  async handleRawUpdate(payload: Record<string, unknown>) {
    const msg = payload.message as Record<string, unknown> | undefined;
    if (!msg || typeof msg !== "object") return;

    const chat = msg.chat as Record<string, unknown> | undefined;
    if (!chat?.id) return;

    const chatId = String(chat.id);
    const from = msg.from as Record<string, unknown> | undefined;
    const username = typeof from?.username === "string" ? from.username : null;
    const firstName = typeof from?.first_name === "string" ? from.first_name : null;
    const lastName = typeof from?.last_name === "string" ? from.last_name : null;

    const rawText = typeof msg.text === "string" ? msg.text.trim() : "";
    if (!this.isNotifyIntent(rawText)) return;

    const token = await this.integration.getBotTokenForOutbound();
    if (!token) {
      this.logger.warn("нет токена бота — входящее /notify проигнорировано");
      return;
    }

    const existing = await this.prisma.telegramNotifySubscriber.findUnique({
      where: { chatId },
    });

    if (existing?.status === "APPROVED") {
      await this.integration.sendChatMessage(
        token,
        chatId,
        "✅ Вы уже в списке получателей уведомлений о новых заявках.",
      );
      return;
    }

    await this.prisma.telegramNotifySubscriber.upsert({
      where: { chatId },
      create: {
        chatId,
        username,
        firstName,
        lastName,
        status: "PENDING",
      },
      update: {
        username,
        firstName,
        lastName,
        ...(existing?.status === "REJECTED" || existing?.status === "PENDING"
          ? {
              status: "PENDING" as const,
              reviewedAt: null,
              reviewedById: null,
            }
          : {}),
      },
    });

    await this.integration.sendChatMessage(
      token,
      chatId,
      "📩 Заявка отправлена. Администратор подключит этот чат после подтверждения в панели FAM (Настройки → Уведомления).",
    );

    this.logger.log(`telegram notify subscribe request chatId=${chatId}`);
  }

  private isNotifyIntent(text: string): boolean {
    const parts = text.trim().split(/\s+/).filter(Boolean);
    const first = parts[0];
    if (!first) return false;
    if (/^\/notify(@[A-Za-z0-9_]+)?$/.test(first) && parts.length === 1) return true;
    if (/^\/start(@[A-Za-z0-9_]+)?$/.test(first)) {
      const rest = parts.slice(1).join(" ").trim();
      return rest === "notify" || rest.startsWith("notify ");
    }
    return false;
  }
}
