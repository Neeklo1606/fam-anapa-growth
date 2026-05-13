import Link from "next/link";

import { MaxNotificationsSection } from "@/components/admin/MaxNotificationsSection";
import { NotificationsSettingsPanel } from "@/components/admin/NotificationsSettingsPanel";
import { fetchMaxNotifyState, fetchMe, fetchTelegramNotifyState } from "@/lib/admin-api";

export default async function AdminNotificationsSettingsPage() {
  const [user, telegram, maxState] = await Promise.all([
    fetchMe(),
    fetchTelegramNotifyState(),
    fetchMaxNotifyState(),
  ]);

  if (!user) return null;

  return (
    <div className="space-y-12 max-w-4xl">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            CRM
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Уведомления о заявках</h1>
          <p className="mt-1 text-sm text-ink/55 max-w-xl">
            Telegram и MAX — входящие webhooks и списки получателей. Исходящий webhook и SMTP настраиваются
            в блоке Telegram (общие параметры сайта для ссылок в письмах и карточке заявки).
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="text-sm text-flame hover:underline shrink-0"
        >
          ← Настройки сайта
        </Link>
      </header>

      <NotificationsSettingsPanel initial={telegram} canEditIntegration={user.role === "ADMIN"} />

      <MaxNotificationsSection initial={maxState} canEditIntegration={user.role === "ADMIN"} />
    </div>
  );
}
