"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const STATUSES: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "Все" },
  { value: "NEW", label: "Новые" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "CONTACTED", label: "Связались" },
  { value: "TRAINING_BOOKED", label: "Тренировка" },
  { value: "NO_ANSWER", label: "Нет ответа" },
  { value: "REJECTED", label: "Отказ" },
  { value: "ARCHIVED", label: "Архив" },
];

export function LeadsFilters({
  status,
  search,
}: {
  status: string;
  search: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [s, setS] = useState(search);
  const [pending, startTransition] = useTransition();

  const apply = (next: Partial<{ status: string; search: string }>) => {
    const qs = new URLSearchParams(params.toString());
    const nextStatus = next.status ?? status;
    const nextSearch = next.search ?? s;
    if (nextStatus && nextStatus !== "ALL") qs.set("status", nextStatus);
    else qs.delete("status");
    if (nextSearch) qs.set("search", nextSearch);
    else qs.delete("search");
    qs.delete("page");
    startTransition(() => {
      router.push(`/admin/leads${qs.toString() ? `?${qs.toString()}` : ""}`);
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between rounded-2xl border border-ink/10 bg-white p-3">
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
        {STATUSES.map((opt) => {
          const isActive = (opt.value === "ALL" && !status) || opt.value === status;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => apply({ status: opt.value })}
              disabled={pending}
              className={
                "shrink-0 px-3 h-9 rounded-full border text-[11px] uppercase tracking-[0.15em] font-semibold transition " +
                (isActive
                  ? "bg-flame text-white border-flame shadow-flame"
                  : "bg-white text-ink/70 border-ink/10 hover:border-flame/40 hover:text-flame")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ search: s });
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          value={s}
          onChange={(e) => setS(e.target.value)}
          placeholder="Поиск: имя, телефон, email…"
          className="h-10 w-full md:w-72 px-4 rounded-full border border-ink/10 bg-surface text-sm focus:outline-none focus:border-flame transition"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-10 px-4 rounded-full bg-night text-white text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-flame transition disabled:opacity-60"
        >
          Найти
        </button>
      </form>
    </div>
  );
}
