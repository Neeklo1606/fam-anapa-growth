import Link from "next/link";

import { fetchLeads } from "@/lib/admin-api";

const STATUS_CARDS: Array<{ key: "NEW" | "IN_PROGRESS" | "CONTACTED" | "TRAINING_BOOKED"; label: string; tone: string }> = [
  { key: "NEW", label: "Новые", tone: "bg-flame text-white" },
  { key: "IN_PROGRESS", label: "В работе", tone: "bg-royal text-white" },
  { key: "CONTACTED", label: "Связались", tone: "bg-electric/90 text-white" },
  { key: "TRAINING_BOOKED", label: "Записаны", tone: "bg-emerald-600 text-white" },
];

export default async function AdminDashboardPage() {
  const counts = await Promise.all(
    STATUS_CARDS.map(async (c) => {
      const list = await fetchLeads({ status: c.key, page: 1, limit: 1 });
      return { ...c, total: list.total };
    }),
  );
  const recent = await fetchLeads({ page: 1, limit: 5 });

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
          Дашборд
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Обзор</h1>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {counts.map((c) => (
          <Link
            key={c.key}
            href={`/admin/leads?status=${c.key}`}
            className={`block rounded-2xl p-5 shadow-soft ${c.tone}`}
          >
            <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">{c.label}</div>
            <div className="mt-2 font-display text-4xl tracking-tight">{c.total}</div>
          </Link>
        ))}
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-xl tracking-tight">Последние заявки</h2>
          <Link
            href="/admin/leads"
            className="text-xs uppercase tracking-wider text-flame hover:underline"
          >
            Все заявки →
          </Link>
        </div>
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-ink/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Когда</th>
                <th className="text-left px-4 py-3">Родитель</th>
                <th className="text-left px-4 py-3">Ребёнок</th>
                <th className="text-left px-4 py-3">Телефон</th>
                <th className="text-left px-4 py-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {recent.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                    Пока заявок нет.
                  </td>
                </tr>
              )}
              {recent.items.map((l) => (
                <tr key={l.id} className="border-t border-line hover:bg-surface/60 transition">
                  <td className="px-4 py-3 text-xs text-ink/60">
                    {new Date(l.createdAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/leads/${l.id}`} className="hover:text-flame">
                      {l.parentName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{l.childName}</td>
                  <td className="px-4 py-3 font-mono-pro text-xs">{l.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-night/5">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
