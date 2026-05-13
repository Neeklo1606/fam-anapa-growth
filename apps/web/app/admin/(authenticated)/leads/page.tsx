import Link from "next/link";

import { fetchLeads } from "@/lib/admin-api";
import { StatusBadge, statusLabel } from "@/components/admin/StatusBadge";

const STATUSES = ["ALL", "NEW", "IN_PROGRESS", "CONTACTED", "TRAINING_BOOKED", "NO_ANSWER", "REJECTED", "ARCHIVED"] as const;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const status = (sp.status as (typeof STATUSES)[number] | undefined) ?? "ALL";
  const search = sp.search ?? "";

  const { items, total, limit } = await fetchLeads({
    page,
    limit: 50,
    status,
    search: search || undefined,
  });
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            CRM
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Заявки</h1>
          <p className="mt-1 text-sm text-ink/55">Всего: {total}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/leads/export.csv?status=${status === "ALL" ? "" : status}&search=${encodeURIComponent(search)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center px-4 rounded-full bg-night text-white text-[11px] uppercase tracking-wider hover:bg-deep transition"
          >
            Экспорт CSV
          </a>
        </div>
      </header>

      <form className="flex flex-wrap gap-2 items-center bg-white border border-line rounded-2xl p-3 shadow-soft" method="GET">
        <input
          name="search"
          defaultValue={search}
          placeholder="Поиск по ФИО / телефону / email"
          className="flex-1 min-w-[200px] h-10 px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-10 px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "Все статусы" : statusLabel(s)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 px-5 rounded-lg bg-flame text-white text-[11px] uppercase tracking-wider"
        >
          Применить
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Когда</th>
              <th className="text-left px-4 py-3">Родитель</th>
              <th className="text-left px-4 py-3">Ребёнок</th>
              <th className="text-left px-4 py-3">Телефон</th>
              <th className="text-left px-4 py-3">Мессенджеры</th>
              <th className="text-left px-4 py-3">Направление</th>
              <th className="text-left px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink/50">
                  Заявок по фильтру нет.
                </td>
              </tr>
            )}
            {items.map((l) => (
              <tr key={l.id} className="border-t border-line hover:bg-surface/60 transition">
                <td className="px-4 py-3 text-xs text-ink/60 whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString("ru-RU")}
                </td>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/leads/${l.id}`} className="hover:text-flame">
                    {l.parentName}
                  </Link>
                </td>
                <td className="px-4 py-3">{l.childName}</td>
                <td className="px-4 py-3 font-mono-pro text-xs whitespace-nowrap">
                  <a href={`tel:${l.phone}`} className="hover:text-flame">
                    {l.phone}
                  </a>
                </td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {l.whatsapp || l.phone ? (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://wa.me/${(l.whatsapp ?? l.phone).replace(/\D/g, "")}`}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      WA
                    </a>
                  ) : null}
                  {l.telegram ? (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={l.telegram.startsWith("@") ? `https://t.me/${l.telegram.slice(1)}` : l.telegram}
                      className="text-xs text-blue-700 hover:underline"
                    >
                      TG
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs">{l.direction ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <Pagination pages={pages} current={page} search={search} status={status} />
      )}
    </div>
  );
}

function Pagination({
  pages,
  current,
  status,
  search,
}: {
  pages: number;
  current: number;
  status: string;
  search: string;
}) {
  const arr = Array.from({ length: pages }, (_, i) => i + 1).slice(
    Math.max(0, current - 4),
    Math.min(pages, current + 3),
  );
  return (
    <div className="flex justify-center gap-1">
      {arr.map((p) => {
        const params = new URLSearchParams();
        params.set("page", String(p));
        if (status && status !== "ALL") params.set("status", status);
        if (search) params.set("search", search);
        return (
          <Link
            key={p}
            href={`/admin/leads?${params.toString()}`}
            className={
              p === current
                ? "h-9 w-9 inline-flex items-center justify-center rounded-lg bg-night text-white text-xs"
                : "h-9 w-9 inline-flex items-center justify-center rounded-lg border border-line text-xs hover:bg-surface"
            }
          >
            {p}
          </Link>
        );
      })}
    </div>
  );
}
