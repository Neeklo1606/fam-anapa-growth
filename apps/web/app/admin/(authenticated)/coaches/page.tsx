import Link from "next/link";

import { fetchCoachesAdmin } from "@/lib/admin-api";
import { CoachesList } from "@/components/admin/CoachesList";

export default async function AdminCoachesPage() {
  const coaches = await fetchCoachesAdmin();
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            Сайт
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Тренеры</h1>
          <p className="mt-1 text-sm text-ink/55">Всего: {coaches.length}</p>
        </div>
        <Link
          href="/admin/coaches/new"
          className="inline-flex h-10 items-center px-5 rounded-full bg-flame text-white text-[11px] uppercase tracking-wider font-semibold"
        >
          + Добавить
        </Link>
      </header>

      <CoachesList coaches={coaches} />
    </div>
  );
}
