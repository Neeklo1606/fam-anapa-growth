import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import crypto from "crypto";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { tgCall } from "./telegram-bot-api";
import {
  TELEGRAM_LEAD_INTEGRATION_KEY,
  type SubscriberPublic,
  type TelegramLeadIntegrationConfig,
  type TelegramNotifyAdminState,
} from "./telegram-notify.types";

function normBaseUrl(u: string): string {
  return u.replace(/\/$/, "");
}

@Injectable()
export class TelegramNotifyIntegrationService {
  private readonly logger = new Logger(TelegramNotifyIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async loadConfig(): Promise<TelegramLeadIntegrationConfig> {
    const row = await this.prisma.integration.findUnique({
      where: { key: TELEGRAM_LEAD_INTEGRATION_KEY },
    });
    const c = (row?.config ?? {}) as TelegramLeadIntegrationConfig;
    return { ...c };
  }

  async saveConfigJson(data: TelegramLeadIntegrationConfig) {
    await this.prisma.integration.upsert({
      where: { key: TELEGRAM_LEAD_INTEGRATION_KEY },
      create: {
        key: TELEGRAM_LEAD_INTEGRATION_KEY,
        enabled: true,
        config: data as Prisma.InputJsonValue,
      },
      update: {
        config: data as Prisma.InputJsonValue,
        enabled: true,
      },
    });
  }

  buildWebhookUrl(publicAppUrl: string): string {
    return `${normBaseUrl(publicAppUrl)}/api/integrations/telegram/webhook`;
  }

  ensureSecretToken(c: TelegramLeadIntegrationConfig): TelegramLeadIntegrationConfig {
    if (!c.webhookSecretToken || c.webhookSecretToken.length < 12) {
      return {
        ...c,
        webhookSecretToken: crypto.randomBytes(28).toString("base64url").slice(0, 64),
      };
    }
    return c;
  }

  async getPublicAppUrlForLinks(): Promise<string> {
    const c = await this.loadConfig();
    const u =
      c.publicAppUrl?.trim() ||
      this.config.get<string>("ADMIN_PUBLIC_BASE_URL")?.trim() ||
      "https://morev.neeklo.ru";
    return normBaseUrl(u);
  }

  async validateToken(token: string) {
    await tgCall<{ username: string }>(token, "getMe", {});
  }

  async fetchWebhookInfo(token: string): Promise<Record<string, unknown> | null> {
    try {
      const r = await tgCall<Record<string, unknown>>(token, "getWebhookInfo", {});
      return r ?? null;
    } catch (e) {
      this.logger.warn(`getWebhookInfo failed: ${(e as Error).message}`);
      return null;
    }
  }

  async deleteTelegramWebhook(token: string) {
    await tgCall<boolean>(token, "deleteWebhook", { drop_pending_updates: false });
  }

  async registerTelegramWebhook(
    token: string,
    webhookUrl: string,
    secretToken: string,
  ) {
    await tgCall<boolean>(token, "setWebhook", {
      url: webhookUrl,
      secret_token: secretToken,
      allowed_updates: ["message"],
    });
  }

  async getAdminState(): Promise<TelegramNotifyAdminState> {
    const c = await this.loadConfig();
    const hasToken = Boolean(c.botToken?.trim());
    const publicAppUrl = c.publicAppUrl?.trim() || null;
    const webhookUrl =
      hasToken && publicAppUrl ? this.buildWebhookUrl(publicAppUrl) : null;

    let webhookInfo: Record<string, unknown> | null = null;
    if (hasToken && c.botToken) {
      webhookInfo = await this.fetchWebhookInfo(c.botToken.trim());
    }

    const [pending, approved] = await Promise.all([
      this.prisma.telegramNotifySubscriber.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.telegramNotifySubscriber.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      integration: {
        hasBotToken: hasToken,
        publicAppUrl,
        leadOutboundWebhookUrl: c.leadOutboundWebhookUrl?.trim() ?? null,
        webhookUrl,
        lastWebhookError: c.lastWebhookError ?? null,
      },
      webhookInfo,
      subscribersPending: pending.map((s) => this.toSubRow(s)),
      subscribersApproved: approved.map((s) => this.toSubRow(s)),
    };
  }

  private toSubRow(s: {
    id: string;
    chatId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    reviewedAt: Date | null;
  }): SubscriberPublic {
    return {
      id: s.id,
      chatId: s.chatId,
      username: s.username,
      firstName: s.firstName,
      lastName: s.lastName,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      reviewedAt: s.reviewedAt?.toISOString() ?? null,
    };
  }

  async updateFromAdmin(input: {
    botToken?: string | null;
    publicAppUrl?: string | null;
    leadOutboundWebhookUrl?: string | null;
    removeBotToken?: boolean;
  }) {
    let c = await this.loadConfig();

    if (input.removeBotToken) {
      const old = c.botToken?.trim();
      if (old) {
        try {
          await this.deleteTelegramWebhook(old);
        } catch (e) {
          this.logger.warn(`deleteWebhook: ${(e as Error).message}`);
        }
      }
      delete c.botToken;
      c.lastWebhookError = null;
      await this.saveConfigJson(c);
      return this.getAdminState();
    }

    if (input.publicAppUrl !== undefined) {
      const u = input.publicAppUrl?.trim();
      if (u && (!u.startsWith("https://") || u.length < 12)) {
        throw new BadRequestException("publicAppUrl должен быть HTTPS (https://...)");
      }
      c.publicAppUrl = u || undefined;
    }

    if (input.leadOutboundWebhookUrl !== undefined) {
      const w = input.leadOutboundWebhookUrl?.trim();
      c.leadOutboundWebhookUrl = w || null;
    }

    if (input.botToken !== undefined) {
      const t = input.botToken?.trim();
      if (t) {
        await this.validateToken(t);
        c = this.ensureSecretToken({ ...c, botToken: t });
      } else if (c.botToken?.trim()) {
        try {
          await this.deleteTelegramWebhook(c.botToken.trim());
        } catch (e) {
          this.logger.warn(`deleteWebhook(old): ${(e as Error).message}`);
        }
        delete c.botToken;
        c.lastWebhookError = null;
      }
    }

    const pub = c.publicAppUrl?.trim();
    const tok = c.botToken?.trim();
    if (tok && pub) {
      const withSecret = this.ensureSecretToken(c);
      c = withSecret;
      const wurl = this.buildWebhookUrl(pub);
      const sec = c.webhookSecretToken!;
      try {
        await this.registerTelegramWebhook(tok, wurl, sec);
        c.lastWebhookError = null;
        this.logger.log(`Telegram webhook set to ${wurl}`);
      } catch (e) {
        const msg = (e as Error).message;
        c.lastWebhookError = msg;
        this.logger.warn(`setWebhook failed: ${msg}`);
      }
    }

    await this.saveConfigJson(c);
    return this.getAdminState();
  }

  async verifyIncomingSecret(headerValue: string | undefined) {
    const c = await this.loadConfig();
    const expected = c.webhookSecretToken?.trim();
    const tok = c.botToken?.trim();
    if (!tok || !expected) {
      throw new UnauthorizedException();
    }
    if (!headerValue || headerValue !== expected) {
      throw new UnauthorizedException();
    }
  }

  /** Разрешённые chat_id для отправки уведомлений о заявке. */
  async getApprovedSubscriberChatIds(): Promise<string[]> {
    const rows = await this.prisma.telegramNotifySubscriber.findMany({
      where: { status: "APPROVED" },
      select: { chatId: true },
    });
    return rows.map((r) => r.chatId);
  }

  async getLeadOutboundWebhookUrl(): Promise<string | null> {
    const c = await this.loadConfig();
    const fromDb = c.leadOutboundWebhookUrl?.trim();
    if (fromDb) return fromDb;
    return this.config.get<string>("LEAD_NOTIFICATION_WEBHOOK_URL")?.trim() ?? null;
  }

  async getBotTokenForOutbound(): Promise<string | null> {
    const c = await this.loadConfig();
    return c.botToken?.trim() ?? this.config.get<string>("TELEGRAM_BOT_TOKEN")?.trim() ?? null;
  }

  async sendChatMessage(token: string, chatId: string, text: string) {
    await tgCall<{ message_id: number }>(token, "sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  }
}
