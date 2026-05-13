import type { MaxNotifySubscriberStatus } from "@prisma/client";

export const MAX_LEAD_INTEGRATION_KEY = "max_lead_bot";

export type MaxLeadIntegrationConfig = {
  botAccessToken?: string;
  /** X-Max-Bot-Api-Secret ([a-zA-Z0-9_-]{5,256}) */
  webhookSecret?: string;
  /** Same HTTPS site root as Telegram: https://domain */
  publicAppUrl?: string;
  lastWebhookError?: string | null;
};

export type MaxSubscriberPublic = {
  id: string;
  maxUserId: string;
  name: string | null;
  username: string | null;
  status: MaxNotifySubscriberStatus;
  createdAt: string;
  reviewedAt: string | null;
};

export type MaxNotifyAdminState = {
  integration: {
    hasBotToken: boolean;
    publicAppUrl: string | null;
    webhookUrl: string | null;
    lastWebhookError: string | null;
  };
  subscriptions: Record<string, unknown>[] | null;
  subscribersPending: MaxSubscriberPublic[];
  subscribersApproved: MaxSubscriberPublic[];
};