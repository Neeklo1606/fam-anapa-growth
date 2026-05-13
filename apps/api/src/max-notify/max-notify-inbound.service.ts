import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { MaxNotifyIntegrationService } from "./max-notify-integration.service";

@Injectable()
export class MaxNotifyInboundService {
  private readonly logger = new Logger(MaxNotifyInboundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integration: MaxNotifyIntegrationService,
  ) {}

  async handleUpdate(payload: Record<string, unknown>): Promise<void> {
    const type = typeof payload.update_type === "string" ? payload.update_type : "";

    const token = await this.integration.getBotTokenForOutbound();
    if (!token) return;

    if (type === "bot_started") {
      const uid = extractMaxUserNumericId(payload);
      if (uid != null) {
        await this.integration.sendDmText(
          token,
          String(uid),
          "Чтобы получать уведомления о новых заявках с сайта академии, отправьте слово notify или команду /notify. Заявка будет проверена в админ-панели.",
        );
      }
      return;
    }

    if (type !== "message_created") return;

    const text = extractMessageText(payload).trim();
    if (!text) return;

    if (!this.isNotifyIntent(text)) return;

    const uid = extractMaxUserNumericId(payload);
    if (!uid) {
      this.logger.warn("MAX message_created: не удалось получить user_id отправителя");
      return;
    }

    await this.persistPending(payload, uid, token, undefined);
  }

  private isNotifyIntent(text: string): boolean {
    const raw = text.trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    const first = parts[0];
    if (!first) return false;
    if (/^\/notify\b/i.test(first) && parts.length === 1) return true;
    if (/^notify\b$/i.test(raw)) return true;
    if (/^\/start\b/i.test(first)) {
      const rest = parts.slice(1).join(" ").trim();
      return rest === "notify" || rest.startsWith("notify ");
    }
    return false;
  }

  private async persistPending(
    payload: Record<string, unknown>,
    uidNum: number,
    token: string,
    preamble?: string,
  ) {
    const maxUserId = String(uidNum);
    const { name, username } = metaFromSender(payload);

    const existing = await this.prisma.maxNotifySubscriber.findUnique({
      where: { maxUserId },
    });

    if (existing?.status === "APPROVED") {
      await this.integration.sendDmText(
        token,
        maxUserId,
        "✅ Вы уже в списке получателей уведомлений о новых заявках.",
      );
      return;
    }

    await this.prisma.maxNotifySubscriber.upsert({
      where: { maxUserId },
      create: {
        maxUserId,
        name,
        username,
        status: "PENDING",
      },
      update: {
        name,
        username,
        ...(existing?.status === "REJECTED" || existing?.status === "PENDING"
          ? {
              status: "PENDING" as const,
              reviewedAt: null,
              reviewedById: null,
            }
          : {}),
      },
    });

    const head = preamble ?? "📩 Заявка отправлена.";
    await this.integration.sendDmText(
      token,
      maxUserId,
      `${head} После проверки администратор одобрит чат в панели («Уведомления заявок» · MAX).`,
    );

    this.logger.log(`MAX notify subscribe pending user=${maxUserId}`);
  }
}

function extractMessageText(up: Record<string, unknown>): string {
  const m = up.message as Record<string, unknown> | undefined;
  const body = (m?.body ?? up.body) as Record<string, unknown> | undefined;
  const t = body?.text;
  return typeof t === "string" ? t : "";
}

function numId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
}

function extractMaxUserNumericId(up: Record<string, unknown>): number | null {
  const msg = up.message as Record<string, unknown> | undefined;
  const sender = (msg?.sender ?? up.user ?? msg?.user ?? up.sender) as
    | Record<string, unknown>
    | undefined;

  if (sender) {
    if (sender.is_bot === true || sender.isBot === true) return null;

    const id =
      numId(sender.user_id) ??
      numId(sender.id);

    if (id != null) return id;

    const usr = sender.user as Record<string, unknown> | undefined;
    const sid = numId(usr?.user_id) ?? numId(usr?.id);
    if (sid != null) return sid;
  }

  const u = up.user as Record<string, unknown> | undefined;
  return numId(u?.user_id) ?? numId(u?.id);
}

function metaFromSender(up: Record<string, unknown>): {
  name: string | null;
  username: string | null;
} {
  const msg = up.message as Record<string, unknown> | undefined;
  const sender = (msg?.sender ?? up.user ?? up.sender) as
    | Record<string, unknown>
    | undefined;

  if (!sender) return { name: null, username: null };

  const fn = sender.first_name;
  const ln = sender.last_name;
  const nm =
    `${typeof fn === "string" ? fn : ""} ${typeof ln === "string" ? ln : ""}`.trim();

  const un = sender.username;

  return {
    name: nm.length ? nm : null,
    username: typeof un === "string" ? un : null,
  };
}
