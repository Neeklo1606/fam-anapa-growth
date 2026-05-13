import type { TelegramNotifySubscriber, TelegramNotifySubscriberStatus } from "@prisma/client";

export const TELEGRAM_LEAD_INTEGRATION_KEY = "telegram_lead_bot";

export type TelegramLeadIntegrationConfig = {
  botToken?: string;
  webhookSecretToken?: string;
  publicAppUrl?: string;
  leadOutboundWebhookUrl?: string | null;
  lastWebhookError?: string | null;
};

export type TelegramSubscriberRow = TelegramNotifySubscriber;

export type TelegramSubscriberStatusDto = TelegramNotifySubscriberStatus;

export type TelegramNotifyAdminState = {
  integration: {
    hasBotToken: boolean;
    publicAppUrl: string | null;
    leadOutboundWebhookUrl: string | null;
    webhookUrl: string | null;
    lastWebhookError: string | null;
  };
  webhookInfo: Record<string, unknown> | null;
  subscribersPending: SubscriberPublic[];
  subscribersApproved: SubscriberPublic[];
};

export type SubscriberPublic = {
  id: string;
  chatId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  status: TelegramNotifySubscriberStatus;
  createdAt: string;
  reviewedAt: string | null;
};
