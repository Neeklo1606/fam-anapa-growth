"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { TelegramNotifyAdminState } from "@/lib/admin-api";
import {
  revokeTelegramSubscriberAction,
  reviewTelegramSubscriberAction,
  syncTelegramWebhookAction,
  updateTelegramNotifyAction,
} from "@/lib/auth-actions";

const inputCls =
  "h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";

export function NotificationsSettingsPanel({
  initial,
  canEditIntegration,
}: {
  initial: TelegramNotifyAdminState;
  canEditIntegration: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pub, setPub] = useState(initial.integration.publicAppUrl ?? "");
  const [hook, setHook] = useState(initial.integration.leadOutboundWebhookUrl ?? "");
  const [token, setToken] = useState("");

  useEffect(() => {
    setPub(initial.integration.publicAppUrl ?? "");
    setHook(initial.integration.leadOutboundWebhookUrl ?? "");
  }, [initial.integration.publicAppUrl, initial.integration.leadOutboundWebhookUrl]);

  const submitConfig = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await updateTelegramNotifyAction({
        botToken: token.trim() || undefined,
        publicAppUrl: pub.trim() || null,
        leadOutboundWebhookUrl: hook.trim() || null,
      });
      if (!r.ok) {
        toast.error("Не удалось сохранить", { description: r.error });
        return;
      }
      toast.success("Сохранено", { description: "При указании токена и URL webhook обновлён в Telegram." });
      setToken("");
      router.refresh();
    });
  };

  const removeToken = () => {
    if (!confirm("Удалить токен бота и сбросить webhook в Telegram?")) return;
    startTransition(async () => {
      const r = await updateTelegramNotifyAction({ removeBotToken: true });
      if (!r.ok) {
        toast.error("Ошибка", { description: r.error });
        return;
      }
      toast.success("Токен удалён");
      router.refresh();
    });
  };

  const syncWh = () => {
    startTransition(async () => {
      const r = await syncTelegramWebhookAction();
      if (!r.ok) {
        toast.error("Webhook", { description: r.error });
        return;
      }
      toast.success("Webhook синхронизирован");
      router.refresh();
    });
  };

  const review = (id: string, decision: "approve" | "reject") => {
    startTransition(async () => {
      const r = await reviewTelegramSubscriberAction({ id, decision });
      if (!r.ok) {
        toast.error("Действие не выполнено", { description: r.error });
        return;
      }
      toast.success(decision === "approve" ? "Доступ выдан" : "Отклонено");
      router.refresh();
    });
  };

  const revoke = (id: string) => {
    if (!confirm("Отключить этот чат от уведомлений?")) return;
    startTransition(async () => {
      const r = await revokeTelegramSubscriberAction(id);
      if (!r.ok) {
        toast.error("Ошибка", { description: r.error });
        return;
      }
      toast.success("Доступ отключён");
      router.refresh();
    });
  };

  const whInfo = initial.webhookInfo;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-white p-5 space-y-4">
        <h2 className="font-display text-lg tracking-tight">Интеграция</h2>
        <p className="text-sm text-ink/55">
          В боте пользователь пишет команду <code className="text-ink/80">/notify</code> или{" "}
          <code className="text-ink/80">/start notify</code> — заявка попадает в список ниже; одобрите чат,
          чтобы слать туда новые заявки.
        </p>

        {initial.integration.webhookUrl && (
          <div className="text-xs font-mono-pro break-all bg-surface rounded-lg p-3 border border-line">
            <span className="text-ink/45">Ожидаемый URL webhook: </span>
            {initial.integration.webhookUrl}
          </div>
        )}

        {initial.integration.lastWebhookError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
            Ошибка последнего setWebhook: {initial.integration.lastWebhookError}
          </div>
        )}

        {whInfo && Object.keys(whInfo).length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-flame">Состояние webhook (getWebhookInfo)</summary>
            <pre className="mt-2 p-3 bg-surface rounded-lg overflow-x-auto border border-line">
              {JSON.stringify(whInfo, null, 2)}
            </pre>
          </details>
        )}

        {canEditIntegration ? (
          <form onSubmit={submitConfig} className="space-y-4">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
                Токен бота (BotFather)
              </span>
              <input
                type="password"
                autoComplete="off"
                className={inputCls}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={initial.integration.hasBotToken ? "•••• оставьте пустым, чтобы не менять" : "123456:ABC…"}
              />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
                Публичный HTTPS URL сайта (без /api)
              </span>
              <input
                className={inputCls}
                value={pub}
                onChange={(e) => setPub(e.target.value)}
                placeholder="https://example.com"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
                Исходящий webhook заявки (опционально)
              </span>
              <input
                className={inputCls}
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="https://…"
              />
              <span className="block mt-1 text-[11px] text-ink/40">
                Если пусто — используется переменная окружения LEAD_NOTIFICATION_WEBHOOK_URL на API.
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Сохранить
              </button>
              <button
                type="button"
                disabled={pending || !initial.integration.hasBotToken}
                onClick={syncWh}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-line text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                <RefreshCw className="h-3 w-3" />
                Повторно зарегистрировать webhook
              </button>
              {initial.integration.hasBotToken && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={removeToken}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-red-200 text-red-800 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Удалить токен
                </button>
              )}
            </div>
          </form>
        ) : (
          <p className="text-sm text-ink/50">
            Параметры бота и URL может менять только роль ADMIN. Вы можете одобрять чаты ниже.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 space-y-3">
        <h2 className="font-display text-lg tracking-tight">Ожидают подтверждения</h2>
        {initial.subscribersPending.length === 0 ? (
          <p className="text-sm text-ink/45">Пока нет заявок из Telegram.</p>
        ) : (
          <ul className="divide-y divide-line">
            {initial.subscribersPending.map((s) => (
              <li key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">
                    {s.firstName ?? "—"} {s.lastName ?? ""}{" "}
                    {s.username ? <span className="text-ink/50">@{s.username}</span> : null}
                  </div>
                  <div className="text-xs font-mono-pro text-ink/45">chat_id {s.chatId}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => review(s.id, "approve")}
                    className="h-9 px-4 rounded-full bg-night text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
                  >
                    Одобрить
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => review(s.id, "reject")}
                    className="h-9 px-4 rounded-full border border-line text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
                  >
                    Отклонить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 space-y-3">
        <h2 className="font-display text-lg tracking-tight">Подключённые чаты</h2>
        {initial.subscribersApproved.length === 0 ? (
          <p className="text-sm text-ink/45">Нет одобренных получателей.</p>
        ) : (
          <ul className="divide-y divide-line">
            {initial.subscribersApproved.map((s) => (
              <li key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">
                    {s.firstName ?? "—"} {s.lastName ?? ""}{" "}
                    {s.username ? <span className="text-ink/50">@{s.username}</span> : null}
                  </div>
                  <div className="text-xs font-mono-pro text-ink/45">chat_id {s.chatId}</div>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => revoke(s.id)}
                  className="h-9 px-4 rounded-full border border-line text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50 self-start sm:self-center"
                >
                  Отключить
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
