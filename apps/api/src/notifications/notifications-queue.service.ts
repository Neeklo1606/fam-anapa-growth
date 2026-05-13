import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Lead } from "@prisma/client";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

import { PrismaService } from "../prisma/prisma.service";

export const NOTIFICATIONS_QUEUE_NAME = "fam-notifications";

const LEAD_CREATED_JOB = "lead-created";

export type LeadCreatedPayload = { leadId: string };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function telegramLimit(text: string, max = 3800): string {
  return text.length <= max ? text : `${text.slice(0, max - 40)}\n<i>…усечено</i>`;
}

@Injectable()
export class NotificationsQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsQueueService.name);

  private redisPublisher?: Redis;
  private redisWorker?: Redis;
  private queue?: Queue<LeadCreatedPayload>;
  private worker?: Worker<LeadCreatedPayload>;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const url = this.config.get<string>("REDIS_URL")?.trim();
    if (!url) {
      this.logger.warn(
        "REDIS_URL не задан — очередь уведомлений о заявках отключена.",
      );
      return;
    }

    const redisOpts = { maxRetriesPerRequest: null } as const;
    try {
      this.redisPublisher = new Redis(url, redisOpts);
      this.redisWorker = new Redis(url, redisOpts);
      this.queue = new Queue<LeadCreatedPayload>(NOTIFICATIONS_QUEUE_NAME, {
        connection: this.redisPublisher,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: "exponential", delay: 3000 },
          removeOnComplete: 200,
          removeOnFail: 500,
        },
      });

      this.worker = new Worker<LeadCreatedPayload>(
        NOTIFICATIONS_QUEUE_NAME,
        (job) => this.processLeadCreated(job.data),
        { connection: this.redisWorker, concurrency: 2 },
      );
      this.worker.on("failed", (job, err) => {
        this.logger.error(
          `Job ${job?.id ?? "?"} (${job?.name}) failed: ${err?.message}`,
        );
      });
      this.logger.log(
        `BullMQ worker listening on "${NOTIFICATIONS_QUEUE_NAME}" (${LEAD_CREATED_JOB})`,
      );
    } catch (e) {
      this.logger.error(
        `Не удалось подключить Redis для уведомлений: ${(e as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    await Promise.all([
      this.worker?.close(),
      this.queue?.close(),
      this.redisWorker?.quit().catch(() => undefined),
      this.redisPublisher?.quit().catch(() => undefined),
    ]);
  }

  async enqueueLeadCreated(leadId: string): Promise<void> {
    if (!this.queue) return;
    await this.queue.add(LEAD_CREATED_JOB, { leadId }, { jobId: `lead-${leadId}` });
  }

  private formatLeadHtml(lead: Lead, adminBase: string): string {
    const leadUrl = `${adminBase.replace(/\/$/, "")}/admin/leads/${lead.id}`;
    const lines = [
      `<b>Новая заявка · FAM</b>`,
      ``,
      `<b>Родитель:</b> ${escapeHtml(lead.parentName)}`,
      `<b>Ребёнок:</b> ${escapeHtml(lead.childName)}`,
      `<b>Телефон:</b> <code>${escapeHtml(lead.phone)}</code>`,
    ];
    if (lead.childAge != null)
      lines.push(`<b>Возраст (указано):</b> ${lead.childAge}`);
    if (lead.childBirthDate) {
      const d = lead.childBirthDate.toISOString().slice(0, 10);
      lines.push(`<b>Дата рождения:</b> ${escapeHtml(d)}`);
    }
    if (lead.email) lines.push(`<b>Email:</b> ${escapeHtml(lead.email)}`);
    if (lead.telegram) lines.push(`<b>Telegram:</b> ${escapeHtml(lead.telegram)}`);
    if (lead.whatsapp) lines.push(`<b>WhatsApp:</b> ${escapeHtml(lead.whatsapp)}`);
    if (lead.direction) lines.push(`<b>Направление:</b> ${escapeHtml(lead.direction)}`);
    if (lead.comment) {
      lines.push("", `<b>Комментарий:</b>`);
      lines.push(escapeHtml(lead.comment).slice(0, 900));
    }
    if (lead.utmSource || lead.utmMedium || lead.utmCampaign) {
      lines.push("", `<b>UTM:</b> ${escapeHtml([lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" · ") || "—")}`);
    }
    lines.push(
      "",
      `<b>ID:</b> <code>${escapeHtml(lead.id)}</code>`,
      `<a href="${escapeHtml(leadUrl)}">Открыть в админке</a>`,
    );
    return telegramLimit(lines.join("\n"));
  }

  private async processLeadCreated(payload: LeadCreatedPayload) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: payload.leadId },
    });
    if (!lead) {
      this.logger.warn(`lead ${payload.leadId} не найден, уведомление пропускаем`);
      return;
    }

    const adminBase =
      this.config.get<string>("ADMIN_PUBLIC_BASE_URL")?.trim() ||
      "https://morev.neeklo.ru";

    const text = this.formatLeadHtml(lead, adminBase);

    const token = this.config.get<string>("TELEGRAM_BOT_TOKEN")?.trim();
    const chatId = this.config.get<string>("TELEGRAM_CHAT_ID")?.trim();
    const hook = this.config.get<string>("LEAD_NOTIFICATION_WEBHOOK_URL")?.trim();

    let telegramSent = false;
    let telegramErr: Error | undefined;
    let webhookSent = false;
    let webhookErr: Error | undefined;

    if (token && chatId) {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: "HTML",
              disable_web_page_preview: false,
            }),
          },
        );
        const bodyJson = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            `HTTP ${res.status} ${JSON.stringify(bodyJson)}`,
          );
        }
        telegramSent = true;
      } catch (e) {
        telegramErr = e as Error;
        this.logger.warn(`Telegram: ${telegramErr.message}`);
      }
    }

    if (hook) {
      try {
        const res = await fetch(hook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "lead.created",
            lead: {
              id: lead.id,
              createdAt: lead.createdAt.toISOString(),
              parentName: lead.parentName,
              childName: lead.childName,
              phone: lead.phone,
              email: lead.email,
              telegram: lead.telegram,
              whatsapp: lead.whatsapp,
              direction: lead.direction,
              comment: lead.comment,
              source: lead.source,
              landingPage: lead.landingPage,
              utm: {
                source: lead.utmSource,
                medium: lead.utmMedium,
                campaign: lead.utmCampaign,
              },
              adminLeadUrl: `${adminBase.replace(/\/$/, "")}/admin/leads/${lead.id}`,
            },
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        webhookSent = true;
      } catch (e) {
        webhookErr = e as Error;
        this.logger.warn(`Webhook: ${webhookErr.message}`);
      }
    }

    const outboundConfigured = Boolean((token && chatId) || hook);

    if (!outboundConfigured) {
      this.logger.warn(
        "TELEGRAM_* и LEAD_NOTIFICATION_WEBHOOK_URL не заданы — текст заявки только в логе.",
      );
      this.logger.log(`[dry-run notify lead ${lead.id}]\n${text.replace(/<[^>]+>/g, "")}`);
      return;
    }

    if (telegramSent || webhookSent) {
      await this.persistNotificationLeadCreated(lead.id, telegramSent, webhookSent);
    }

    const needTgOk = Boolean(token && chatId);
    const needHookOk = Boolean(hook);

    const tgFailed = needTgOk && !telegramSent;
    const whFailed = needHookOk && !webhookSent;

    if (!tgFailed && !whFailed) {
      return;
    }

    if (telegramSent || webhookSent) {
      this.logger.warn(
        `Уведомление частично: telegram=${telegramSent} webhook=${webhookSent} (ретрай пропущен, чтобы не дублировать успешный канал)`,
      );
      return;
    }

    const detail = [
      tgFailed && telegramErr?.message && `telegram: ${telegramErr.message}`,
      whFailed && webhookErr?.message && `webhook: ${webhookErr.message}`,
    ]
      .filter(Boolean)
      .join("; ");
    throw new Error(`notify_failed:${detail || "all_channels"}`);
  }

  private async persistNotificationLeadCreated(
    leadId: string,
    hadTelegram: boolean,
    hadWebhook: boolean,
  ) {
    try {
      if (hadTelegram) {
        await this.prisma.notification.create({
          data: {
            channel: "TELEGRAM",
            recipient:
              this.config.get<string>("TELEGRAM_CHAT_ID")?.slice(0, 255) ??
              "telegram",
            payload: { leadId } as object,
            status: "SENT",
            attempts: 1,
            sentAt: new Date(),
          },
        });
      }
      if (hadWebhook) {
        await this.prisma.notification.create({
          data: {
            channel: "WEBHOOK",
            recipient:
              this.config.get<string>("LEAD_NOTIFICATION_WEBHOOK_URL")?.slice(0, 255) ??
              "webhook",
            payload: { leadId } as object,
            status: "SENT",
            attempts: 1,
            sentAt: new Date(),
          },
        });
      }
    } catch (e) {
      this.logger.warn(`notification row: ${(e as Error).message}`);
    }
  }
}
