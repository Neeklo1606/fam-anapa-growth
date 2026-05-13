import Link from "next/link";
import { redirect } from "next/navigation";

import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { fetchAiSettingsAdmin, fetchMe } from "@/lib/admin-api";

export default async function AdminAiSettingsPage() {
  const user = await fetchMe();
  if (user?.role !== "ADMIN") {
    redirect("/admin/settings");
  }

  const ai = await fetchAiSettingsAdmin();

  return (
    <div className="space-y-8 max-w-3xl">
      <Link
        href="/admin/settings"
        className="inline-block text-xs uppercase tracking-wider text-ink/60 hover:text-flame transition"
      >
        ← Настройки сайта
      </Link>

      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
          После базовой инфраструктуры (этап 10 рекомендован первым для продакшена)
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">OpenAI и эмбеддинги</h1>
        <p className="mt-1 text-sm text-ink/55">
          Управление ключом API и моделью векторизации для базы знаний (RAG). Доступно только ADMIN.
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-white p-5">
        <AiSettingsForm initial={ai} />
      </section>
    </div>
  );
}
