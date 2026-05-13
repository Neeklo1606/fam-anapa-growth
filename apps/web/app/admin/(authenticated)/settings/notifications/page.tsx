import Link from "next/link";

import { NotificationsSettingsPanel } from "@/components/admin/NotificationsSettingsPanel";
import { fetchMe, fetchTelegramNotifyState } from "@/lib/admin-api";

export default async function AdminNotificationsSettingsPage() {
  const [user, state] = await Promise.all([fetchMe(), fetchTelegramNotifyState()]);

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            CRM
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Уведомления о заявках</h1>
          <p className="mt-1 text-sm text-ink/55 max-w-xl">
            Telegram-бот (входящий webhook + список чатов) и исходящий JSON-webhook. После сохранения
            токена и HTTPS-URL webhook в Telegram регистрируется автоматически.
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="text-sm text-flame hover:underline shrink-0"
        >
          ← Настройки сайта
        </Link>
      </header>

      <NotificationsSettingsPanel initial={state} canEditIntegration={user.role === "ADMIN"} />
    </div>
  );
}
