import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Lead } from "@prisma/client";
import nodemailer from "nodemailer";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

@Injectable()
export class LeadNotificationMailService {
  constructor(private readonly config: ConfigService) {}

  private recipients(): string[] {
    const raw = this.config.get<string>("LEAD_NOTIFICATION_EMAIL_TO")?.trim();
    if (!raw) return [];
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /** SMTP + получатели настроены — можно слать копию о новой заявке */
  isEnabled(): boolean {
    const host = this.config.get<string>("SMTP_HOST")?.trim();
    const from = this.config.get<string>("SMTP_FROM")?.trim();
    return Boolean(host && from && this.recipients().length > 0);
  }

  async sendLeadCreated(lead: Lead, adminBase: string): Promise<void> {
    const host = this.config.get<string>("SMTP_HOST")?.trim();
    const port = Number(this.config.get<string>("SMTP_PORT")?.trim() || "587");
    const user = this.config.get<string>("SMTP_USER")?.trim();
    const pass = this.config.get<string>("SMTP_PASS")?.trim();
    const from = this.config.get<string>("SMTP_FROM")?.trim();
    const toList = this.recipients();

    if (!host || !from || !toList.length) {
      throw new Error("email_not_configured");
    }

    const leadUrl = `${adminBase.replace(/\/$/, "")}/admin/leads/${lead.id}`;
    const text = formatLeadPlain(lead, leadUrl);
    const html = formatLeadHtml(lead, leadUrl);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      ignoreTLS: Boolean(this.config.get<string>("SMTP_IGNORE_TLS")?.trim()),
      auth:
        user && pass
          ? {
              user,
              pass,
            }
          : undefined,
    });

    await transporter.sendMail({
      from,
      to: toList.join(", "),
      subject: `Новая заявка FAM · ${lead.parentName.trim()}`,
      text,
      html,
    });
  }
}

function formatLeadPlain(lead: Lead, leadUrl: string): string {
  const lines: string[] = [
    "Новая заявка · Футбольная академия Морева",
    "",
    `Родитель: ${lead.parentName}`,
    `Ребёнок: ${lead.childName}`,
    `Телефон: ${lead.phone}`,
  ];
  if (lead.childAge != null) lines.push(`Возраст (поле формы): ${lead.childAge}`);
  if (lead.childBirthDate) lines.push(`Дата рождения: ${lead.childBirthDate.toISOString().slice(0, 10)}`);
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.telegram) lines.push(`Telegram: ${lead.telegram}`);
  if (lead.whatsapp) lines.push(`WhatsApp: ${lead.whatsapp}`);
  if (lead.direction) lines.push(`Направление: ${lead.direction}`);
  if (lead.comment) lines.push("", "Комментарий:", lead.comment.slice(0, 2000));
  if (lead.utmSource || lead.utmMedium || lead.utmCampaign) {
    lines.push(
      "",
      `UTM: ${[lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" · ")}`,
    );
  }
  lines.push("", `ID: ${lead.id}`, `Открыть в админке: ${leadUrl}`);
  return lines.join("\n");
}

function formatLeadHtml(lead: Lead, leadUrl: string): string {
  const correctRows: [string, string][] = [
    ["Родитель", escapeHtml(lead.parentName)],
    ["Ребёнок", escapeHtml(lead.childName)],
    ["Телефон", `<code>${escapeHtml(lead.phone)}</code>`],
  ];
  if (lead.childAge != null) correctRows.push(["Возраст (поле формы)", String(lead.childAge)]);
  if (lead.childBirthDate)
    correctRows.push(["Дата рождения", escapeHtml(lead.childBirthDate.toISOString().slice(0, 10))]);
  if (lead.email) correctRows.push(["Email", escapeHtml(lead.email)]);
  if (lead.telegram) correctRows.push(["Telegram", escapeHtml(lead.telegram)]);
  if (lead.whatsapp) correctRows.push(["WhatsApp", escapeHtml(lead.whatsapp)]);
  if (lead.direction) correctRows.push(["Направление", escapeHtml(lead.direction)]);
  if (lead.comment)
    correctRows.push(["Комментарий", escapeHtml(lead.comment).slice(0, 900).replace(/\n/g, "<br/>")]);

  const bodyRows = correctRows.map(
    ([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#444;font-weight:600">${k}</td><td style="padding:4px 0">${v}</td></tr>`,
  );
  const utm =
    lead.utmSource || lead.utmMedium || lead.utmCampaign
      ? `<tr><td style="padding:4px 12px 4px 0;color:#444;font-weight:600">UTM</td><td style="padding:4px 0">${escapeHtml([lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" · "))}</td></tr>`
      : "";

  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.45;color:#111">
<p><strong>Новая заявка · FAM</strong></p>
<table style="border-collapse:collapse">${bodyRows.join("")}${utm}</table>
<p style="margin-top:16px"><small>ID: <code>${escapeHtml(lead.id)}</code></small><br/>
<a href="${escapeHtml(leadUrl)}">Открыть в админке</a></p>
</body></html>`;
}
