import type { LeadStatus } from "@fam/types";

const COLORS: Record<LeadStatus, string> = {
  NEW: "bg-flame/15 text-flame",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600",
  CONTACTED: "bg-amber-500/10 text-amber-600",
  TRAINING_BOOKED: "bg-emerald-500/10 text-emerald-700",
  NO_ANSWER: "bg-gray-500/10 text-gray-600",
  REJECTED: "bg-red-500/10 text-red-600",
  ARCHIVED: "bg-zinc-500/10 text-zinc-600",
};

const LABELS: Record<LeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  CONTACTED: "Связались",
  TRAINING_BOOKED: "Записан",
  NO_ANSWER: "Нет ответа",
  REJECTED: "Отказ",
  ARCHIVED: "Архив",
};

export function statusLabel(s: LeadStatus): string {
  return LABELS[s] ?? s;
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-[10px] uppercase tracking-wider ${COLORS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
