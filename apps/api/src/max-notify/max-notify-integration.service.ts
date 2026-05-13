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

import { maxHttp, maxJson } from "./max-bot-api";
import {
  MAX_LEAD_INTEGRATION_KEY,
  type MaxLeadIntegrationConfig,
  type MaxNotifyAdminState,
  type MaxSubscriberPublic,
} from "./max-notify.types";

function normBaseUrl(u: string): string {
  return u.replace(/\/$/, "");
}

/** MAX требует secret из [a-zA-Z0-9_-]{5,256} */
function generateMaxWebhookSecret(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const bytes = crypto.randomBytes(48);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += chars.charAt(bytes[i]! % chars.length);
  }
  return s.slice(0, 64);
}

@Injectable()
export class MaxNotifyIntegrationService {
  private readonly logger = new Logger(MaxNotifyIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async loadConfig(): Promise<MaxLeadIntegrationConfig> {
    const row = await this.prisma.integration.findUnique({
      where: { key: MAX_LEAD_INTEGRATION_KEY },
    });
    const c = (row?.config ?? {}) as MaxLeadIntegrationConfig;
    return { ...c };
  }

  async saveConfigJson(data: MaxLeadIntegrationConfig) {
    await this.prisma.integration.upsert({
      where: { key: MAX_LEAD_INTEGRATION_KEY },
      create: {
        key: MAX_LEAD_INTEGRATION_KEY,
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
    return `${normBaseUrl(publicAppUrl)}/api/integrations/max/webhook`;
  }

  ensureWebhookSecret(c: MaxLeadIntegrationConfig): MaxLeadIntegrationConfig {
    if (!c.webhookSecret || !/^[A-Za-z0-9_-]{5,256}$/.test(c.webhookSecret)) {
      return { ...c, webhookSecret: generateMaxWebhookSecret() };
    }
    return c;
  }

  async getPublicAppUrlForWebhook(): Promise<string> {
    const c = await this.loadConfig();
    const u =
      c.publicAppUrl?.trim() ||
      this.config.get<string>("ADMIN_PUBLIC_BASE_URL")?.trim() ||
      "https://morev.neeklo.ru";
    return normBaseUrl(u);
  }

  async validateAccessToken(accessToken: string): Promise<void> {
    await maxJson<Record<string, unknown>>(accessToken.trim(), `/me`);
  }

  async listSubscriptions(accessToken: string): Promise<Record<string, unknown>[] | null> {
    try {
      const r = await maxJson<{ subscriptions?: unknown }>(accessToken.trim(), `/subscriptions`);
      const list = r?.subscriptions;
      return Array.isArray(list)
        ? (list as Record<string, unknown>[])
        : null;
    } catch (e) {
      this.logger.warn(`GET /subscriptions failed: ${(e as Error).message}`);
      return null;
    }
  }

  async subscribeWebhook(accessToken: string, webhookUrl: string, secret: string): Promise<void> {
    await maxJson(accessToken.trim(), `/subscriptions`, {
      method: "POST",
      body: JSON.stringify({
        url: webhookUrl,
        update_types: ["message_created", "bot_started"],
        secret,
      }),
    });
  }

  async unsubscribeWebhook(accessToken: string, webhookUrl: string): Promise<void> {
    const u = new URL("https://platform-api.max.ru/subscriptions");
    u.searchParams.set("url", webhookUrl);
    const res = await maxHttp(accessToken.trim(), `${u.pathname}${u.search}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 404) {
      const t = await res.text().catch(() => "");
      this.logger.warn(`DELETE subscription: HTTP ${res.status} ${t.slice(0, 200)}`);
    }
  }

  private toRow(s: {
    id: string;
    maxUserId: string;
    name: string | null;
    username: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    reviewedAt: Date | null;
  }): MaxSubscriberPublic {
    return {
      id: s.id,
      maxUserId: s.maxUserId,
      name: s.name,
      username: s.username,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      reviewedAt: s.reviewedAt?.toISOString() ?? null,
    };
  }

  async getAdminState(): Promise<MaxNotifyAdminState> {
    const c = await this.loadConfig();
    const hasTok = Boolean(c.botAccessToken?.trim());
    const publicAppUrl = c.publicAppUrl?.trim() || null;
    const webhookUrl =
      hasTok && publicAppUrl ? this.buildWebhookUrl(publicAppUrl) : null;

    let subscriptions: Record<string, unknown>[] | null = null;
    if (hasTok && c.botAccessToken) {
      subscriptions = await this.listSubscriptions(c.botAccessToken);
    }

    const [pending, approved] = await Promise.all([
      this.prisma.maxNotifySubscriber.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.maxNotifySubscriber.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      integration: {
        hasBotToken: hasTok,
        publicAppUrl,
        webhookUrl,
        lastWebhookError: c.lastWebhookError ?? null,
      },
      subscriptions,
      subscribersPending: pending.map((x) => this.toRow(x)),
      subscribersApproved: approved.map((x) => this.toRow(x)),
    };
  }

  async updateFromAdmin(input: {
    botAccessToken?: string | null;
    publicAppUrl?: string | null;
    removeBot?: boolean;
  }) {
    let c = await this.loadConfig();

    if (input.removeBot) {
      const old = c.botAccessToken?.trim();
      const pub = c.publicAppUrl?.trim();
      if (old && pub) {
        await this.unsubscribeWebhook(old, this.buildWebhookUrl(pub)).catch(() => undefined);
      }
      delete c.botAccessToken;
      c.lastWebhookError = null;
      await this.saveConfigJson(c);
      return this.getAdminState();
    }

    if (input.publicAppUrl !== undefined) {
      const u = input.publicAppUrl?.trim();
      if (u && (!u.startsWith("https://") || u.length < 12)) {
        throw new BadRequestException("publicAppUrl должен быть HTTPS");
      }
      c.publicAppUrl = u || undefined;
    }

    if (input.botAccessToken !== undefined) {
      const t = input.botAccessToken?.trim();
      if (t) {
        await this.validateAccessToken(t);
        c = this.ensureWebhookSecret({ ...c, botAccessToken: t });
      } else if (c.botAccessToken?.trim()) {
        const pub = c.publicAppUrl?.trim();
        const oldTok = c.botAccessToken.trim();
        if (pub) {
          await this.unsubscribeWebhook(oldTok, this.buildWebhookUrl(pub)).catch(() => undefined);
        }
        delete c.botAccessToken;
        c.lastWebhookError = null;
      }
    }

    const pub = c.publicAppUrl?.trim();
    const tok = c.botAccessToken?.trim();
    if (tok && pub) {
      const withSecret = this.ensureWebhookSecret(c);
      c = withSecret;
      const wurl = this.buildWebhookUrl(pub);
      const secret = c.webhookSecret!;
      try {
        await this.subscribeWebhook(tok, wurl, secret);
        c.lastWebhookError = null;
        this.logger.log(`MAX webhook subscribed ${wurl}`);
      } catch (e) {
        const msg = (e as Error).message;
        c.lastWebhookError = msg;
        this.logger.warn(`MAX subscribeWebhook: ${msg}`);
      }
    }

    await this.saveConfigJson(c);
    return this.getAdminState();
  }

  async syncWebhookSubscription(): Promise<MaxNotifyAdminState> {
    let c = this.ensureWebhookSecret(await this.loadConfig());
    const tok = c.botAccessToken?.trim();
    const pub = c.publicAppUrl?.trim();
    if (!tok || !pub) {
      throw new BadRequestException("Сначала укажите токен бота MAX и HTTPS URL сайта.");
    }
    const wurl = this.buildWebhookUrl(pub);
    const secret = c.webhookSecret!;
    try {
      await this.subscribeWebhook(tok, wurl, secret);
      c = { ...c, lastWebhookError: null };
      this.logger.log(`MAX webhook re-sync ${wurl}`);
    } catch (e) {
      c = { ...c, lastWebhookError: (e as Error).message };
      this.logger.warn(`MAX webhook re-sync failed: ${(e as Error).message}`);
    }
    await this.saveConfigJson(c);
    return this.getAdminState();
  }

  async verifyIncomingSecret(header: string | undefined) {
    const c = await this.loadConfig();
    const tok = c.botAccessToken?.trim();
    const expected = c.webhookSecret?.trim();
    if (!tok || !expected) throw new UnauthorizedException();
    if (!header || header !== expected) throw new UnauthorizedException();
  }

  async getApprovedSubscriberUserIds(): Promise<string[]> {
    const rows = await this.prisma.maxNotifySubscriber.findMany({
      where: { status: "APPROVED" },
      select: { maxUserId: true },
    });
    return rows.map((r) => r.maxUserId);
  }

  async getBotTokenForOutbound(): Promise<string | null> {
    const c = await this.loadConfig();
    return (
      c.botAccessToken?.trim() ??
      this.config.get<string>("MAX_BOT_ACCESS_TOKEN")?.trim() ??
      null
    );
  }

  async sendDmText(accessToken: string, maxUserId: string, text: string): Promise<void> {
    const q = `/messages?user_id=${encodeURIComponent(maxUserId)}`;
    await maxJson(accessToken.trim(), q, {
      method: "POST",
      body: JSON.stringify({
        text: text.slice(0, 4000),
      }),
    });
  }
}
