"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { MaxNotifyAdminState } from "@/lib/admin-api";
import {
  reviewMaxSubscriberAction,
  revokeMaxSubscriberAction,
  syncMaxWebhookAction,
  updateMaxNotifyAction,
} from "@/lib/auth-actions";

const inputCls =
  "h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";

export function MaxNotificationsSection({
  initial,
  canEditIntegration,
}: {
  initial: MaxNotifyAdminState;
  canEditIntegration: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pub, setPub] = useState(initial.integration.publicAppUrl ?? "");
  const [token, setToken] = useState("");

  useEffect(() => {
    setPub(initial.integration.publicAppUrl ?? "");
  }, [initial.integration.publicAppUrl]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await updateMaxNotifyAction({
        botAccessToken: token.trim() || undefined,
        publicAppUrl: pub.trim() || null,
      });
      if (!r.ok) {
        toast.error("MAX: не сохранено", { description: r.error });
        return;
      }
      toast.success("MAX сохранён", { description: "Webhook на platform-api.max.ru обновлён." });
      setToken("");
      router.refresh();
    });
  };

  const removeTok = () => {
    if (!confirm("Отозвать токен MAX и отписаться от webhook?")) return;
    startTransition(async () => {
      const r = await updateMaxNotifyAction({ removeBot: true });
      if (!r.ok) {
        toast.error("Ошибка", { description: r.error });
        return;
      }
      toast.success("Токен MAX удалён");
      router.refresh();
    });
  };

  const syncWh = () => {
    startTransition(async () => {
      const r = await syncMaxWebhookAction();
      if (!r.ok) {
        toast.error("MAX webhook", { description: r.error });
        return;
      }
      toast.success("Webhook MAX синхронизирован");
      router.refresh();
    });
  };

  const review = (id: string, decision: "approve" | "reject") => {
    startTransition(async () => {
      const r = await reviewMaxSubscriberAction({ id, decision });
      if (!r.ok) {
        toast.error("Не выполнено", { description: r.error });
        return;
      }
      toast.success(decision === "approve" ? "Одобрено" : "Отклонено");
      router.refresh();
    });
  };

  const revoke = (id: string) => {
    if (!confirm("Отключить этого пользователя MAX от уведомлений?")) return;
    startTransition(async () => {
      const r = await revokeMaxSubscriberAction(id);
      if (!r.ok) {
        toast.error("Не выполнено", { description: r.error });
        return;
      }
      toast.success("Отключено");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 space-y-4">
        <h2 className="font-display text-lg tracking-tight">MAX (max.ru)</h2>
        <p className="text-sm text-ink/55">
          После сохранения токена платформа MAX подписывается на наш HTTPS-endpoint по{" "}
          <a
            href="https://dev.max.ru/docs-api/methods/POST/subscriptions"
            target="_blank"
            rel="noreferrer"
            className="text-flame hover:underline"
          >
            официальной схеме подписок
          </a>
          . В MAX-приложении пользователь отправляет <code className="text-ink/80">notify</code> или{" "}
          <code className="text-ink/80">/notify</code> или <code className="text-ink/80">/start notify</code>.
        </p>

        {initial.integration.webhookUrl && (
          <div className="text-xs font-mono-pro break-all bg-surface rounded-lg p-3 border border-line">
            <span className="text-ink/45">Webhook URL для MAX: </span>
            {initial.integration.webhookUrl}
          </div>
        )}
        {initial.integration.lastWebhookError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
            Последняя ошибка регистрации webhook: {initial.integration.lastWebhookError}
          </div>
        )}

        {initial.subscriptions != null && initial.subscriptions.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-flame">Текущие подписки (GET /subscriptions)</summary>
            <pre className="mt-2 p-3 bg-surface rounded-lg overflow-x-auto border border-line max-h-60">
              {JSON.stringify(initial.subscriptions, null, 2)}
            </pre>
          </details>
        )}

        {canEditIntegration ? (
          <form onSubmit={save} className="space-y-4">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
                Токен бота MAX
              </span>
              <input
                type="password"
                autoComplete="off"
                className={inputCls}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={initial.integration.hasBotToken ? "•••• оставьте пустым" : ""}
              />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
                HTTPS URL сайта для webhook (как Telegram)
              </span>
              <input
                className={inputCls}
                value={pub}
                onChange={(e) => setPub(e.target.value)}
                placeholder="https://morev.neeklo.ru"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-night text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
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
                Подписаться заново
              </button>
              {initial.integration.hasBotToken && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={removeTok}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-red-200 text-red-800 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Удалить токен
                </button>
              )}
            </div>
          </form>
        ) : (
          <p className="text-sm text-ink/50">Токен и URL MAX задаёт только роль ADMIN.</p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 space-y-3">
        <h3 className="font-display text-lg tracking-tight">MAX · ожидают одобрения</h3>
        {initial.subscribersPending.length === 0 ? (
          <p className="text-sm text-ink/45">Пока нет заявок.</p>
        ) : (
          <ul className="divide-y divide-line">
            {initial.subscribersPending.map((s) => (
              <li key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">{s.name ?? "—"} {s.username ? <span className="text-ink/50">@{s.username}</span> : null}</div>
                  <div className="text-xs font-mono-pro text-ink/45">user id {s.maxUserId}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={pending} onClick={() => review(s.id, "approve")} className="h-9 px-4 rounded-full bg-night text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50">
                    Одобрить
                  </button>
                  <button type="button" disabled={pending} onClick={() => review(s.id, "reject")} className="h-9 px-4 rounded-full border border-line text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50">
                    Отклонить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 space-y-3">
        <h3 className="font-display text-lg tracking-tight">MAX · подключены</h3>
        {initial.subscribersApproved.length === 0 ? (
          <p className="text-sm text-ink/45">Нет одобренных.</p>
        ) : (
          <ul className="divide-y divide-line">
            {initial.subscribersApproved.map((s) => (
              <li key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm">
                  <div className="font-medium">{s.name ?? "—"}</div>
                  <div className="text-xs font-mono-pro text-ink/45">{s.maxUserId}</div>
                </div>
                <button type="button" disabled={pending} onClick={() => revoke(s.id)} className="h-9 px-4 rounded-full border border-line text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50 self-start">
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
