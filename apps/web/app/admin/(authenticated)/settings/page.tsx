import { fetchSettings } from "@/lib/admin-api";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await fetchSettings();

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
          Сайт
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Настройки</h1>
        <p className="mt-1 text-sm text-ink/55">
          Бренд, контакты и реквизиты, которые отображаются по всему сайту.
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-white p-5">
        <SettingsForm initial={settings} />
      </section>
    </div>
  );
}
