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

/** Последний fallback, если ни в админке, ни в .env домен не задан. */
const DEFAULT_PUBLIC_APP_URL = "https://footballacademymorev.ru";

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

  /** Домен сайта из окружения сервера (ADMIN_PUBLIC_BASE_URL → первый CORS_ORIGIN). */
  envPublicAppUrl(): string | null {
    const fromAdmin = this.config.get<string>("ADMIN_PUBLIC_BASE_URL")?.trim();
    const fromCors = this.config
      .get<string>("CORS_ORIGIN")
      ?.split(",")
      .map((x) => x.trim())
      .find((x) => x.startsWith("https://"));
    const u = fromAdmin || fromCors;
    return u ? normBaseUrl(u) : null;
  }

  async getPublicAppUrlForWebhook(): Promise<string> {
    const c = await this.loadConfig();
    const u = c.publicAppUrl?.trim() || this.envPublicAppUrl() || DEFAULT_PUBLIC_APP_URL;
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
    const tok = c.botAccessToken?.trim() || this.config.get<string>("MAX_BOT_ACCESS_TOKEN")?.trim() || "";
    const hasTok = Boolean(c.botAccessToken?.trim());
    const publicAppUrl = c.publicAppUrl?.trim() || null;
    const effectiveUrl = publicAppUrl || this.envPublicAppUrl();
    const webhookUrl = hasTok && effectiveUrl ? this.buildWebhookUrl(effectiveUrl) : null;

    let subscriptions: Record<string, unknown>[] | null = null;
    let bot: MaxNotifyAdminState["diagnostics"]["bot"] = null;
    let tokenError: string | null = null;
    if (tok) {
      [subscriptions, bot] = await Promise.all([
        this.listSubscriptions(tok),
        maxJson<Record<string, unknown>>(tok, `/me`)
          .then((me) => ({
            userId: me.user_id != null ? String(me.user_id) : null,
            name: typeof me.name === "string" ? me.name : (typeof me.first_name === "string" ? me.first_name : null),
            username: typeof me.username === "string" ? me.username : null,
          }))
          .catch((e: Error) => {
            tokenError = e.message;
            return null;
          }),
      ]);
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

    const subscribedUrls = (subscriptions ?? [])
      .map((x) => (typeof x.url === "string" ? x.url : null))
      .filter((x): x is string => Boolean(x));
    const webhookActive = webhookUrl ? subscribedUrls.includes(webhookUrl) : false;
    const foreignWebhooks = subscribedUrls.filter((u) => u !== webhookUrl);

    const warnings: string[] = [];
    if (!tok) warnings.push("Не задан токен бота MAX — уведомления не отправляются.");
    if (tokenError) warnings.push(`Токен бота не принят MAX: ${tokenError}`);
    if (tok && approved.length === 0)
      warnings.push(
        "Нет одобренных получателей. Напишите боту «notify» в MAX и одобрите заявку ниже — иначе заявки некуда отправлять.",
      );
    if (tok && subscriptions && !webhookActive)
      warnings.push(
        "Webhook бота не указывает на этот сайт — бот не увидит команду notify. Нажмите «Переподписать webhook».",
      );
    if (foreignWebhooks.length)
      warnings.push(
        `Бот подписан на чужие/старые адреса: ${foreignWebhooks.join(", ")}. «Переподписать webhook» удалит их.`,
      );
    if (c.lastSendError)
      warnings.push(`Последняя отправка в MAX завершилась ошибкой: ${c.lastSendError}`);

    return {
      integration: {
        hasBotToken: hasTok,
        publicAppUrl,
        webhookUrl,
        lastWebhookError: c.lastWebhookError ?? null,
      },
      diagnostics: {
        bot,
        tokenError,
        webhookActive,
        foreignWebhooks,
        lastSendAt: c.lastSendAt ?? null,
        lastSendOk: c.lastSendOk ?? null,
        lastSendError: c.lastSendError ?? null,
        warnings,
      },
      subscriptions,
      subscribersPending: pending.map((x) => this.toRow(x)),
      subscribersApproved: approved.map((x) => this.toRow(x)),
    };
  }

  /** Запоминаем результат последней рассылки — видно в админке. */
  async recordSendResult(ok: boolean, error?: string | null): Promise<void> {
    try {
      const c = await this.loadConfig();
      c.lastSendAt = new Date().toISOString();
      c.lastSendOk = ok;
      c.lastSendError = ok ? null : (error ?? "unknown").slice(0, 500);
      await this.saveConfigJson(c);
    } catch (e) {
      this.logger.warn(`recordSendResult: ${(e as Error).message}`);
    }
  }

  /** Тестовое сообщение всем одобренным получателям. */
  async sendTestMessage(): Promise<{
    ok: boolean;
    results: { maxUserId: string; ok: boolean; error?: string }[];
    error?: string;
  }> {
    const tok = await this.getBotTokenForOutbound();
    if (!tok) return { ok: false, results: [], error: "Не задан токен бота MAX" };
    const ids = await this.getApprovedSubscriberUserIds();
    if (!ids.length)
      return { ok: false, results: [], error: "Нет одобренных получателей (напишите боту notify и одобрите)" };
    const text = `✅ Тест уведомлений FAM: ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}. Если вы видите это сообщение — заявки с сайта будут приходить сюда.`;
    const results: { maxUserId: string; ok: boolean; error?: string }[] = [];
    for (const id of ids) {
      try {
        await this.sendDmText(tok, id, text);
        results.push({ maxUserId: id, ok: true });
      } catch (e) {
        results.push({ maxUserId: id, ok: false, error: (e as Error).message });
      }
    }
    const ok = results.some((r) => r.ok);
    await this.recordSendResult(ok, results.find((r) => !r.ok)?.error);
    return { ok, results };
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

    if (c.botAccessToken?.trim() && !c.publicAppUrl?.trim()) {
      const envUrl = this.envPublicAppUrl();
      if (envUrl) c.publicAppUrl = envUrl;
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
    if (!c.publicAppUrl?.trim()) {
      const envUrl = this.envPublicAppUrl();
      if (envUrl) c = { ...c, publicAppUrl: envUrl };
    }
    const tok = c.botAccessToken?.trim();
    const pub = c.publicAppUrl?.trim();
    if (!tok || !pub) {
      throw new BadRequestException("Сначала укажите токен бота MAX и HTTPS URL сайта.");
    }
    const wurl = this.buildWebhookUrl(pub);
    const secret = c.webhookSecret!;
    // Удаляем подписки на старые домены (например, после переезда сайта).
    const existing = await this.listSubscriptions(tok);
    for (const sub of existing ?? []) {
      const u = typeof sub.url === "string" ? sub.url : null;
      if (u && u !== wurl) {
        await this.unsubscribeWebhook(tok, u).catch(() => undefined);
        this.logger.log(`MAX webhook removed stale ${u}`);
      }
    }
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
      c.botAccessToken?.trim() ||
      this.config.get<string>("MAX_BOT_ACCESS_TOKEN")?.trim() ||
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
