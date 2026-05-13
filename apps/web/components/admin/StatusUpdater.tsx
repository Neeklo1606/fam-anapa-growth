"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { LeadStatus } from "@fam/types";

import { updateLeadStatusAction } from "@/lib/auth-actions";
import { statusLabel } from "./StatusBadge";

const STATUSES: LeadStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "TRAINING_BOOKED",
  "NO_ANSWER",
  "REJECTED",
  "ARCHIVED",
];

export function StatusUpdater({ leadId, current }: { leadId: string; current: LeadStatus }) {
  const [status, setStatus] = useState<LeadStatus>(current);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateLeadStatusAction({
        id: leadId,
        status,
        note: note.trim() || undefined,
      });
      if (!result.ok) {
        toast.error("Не удалось обновить", { description: result.error });
        return;
      }
      toast.success("Статус обновлён");
      setNote("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as LeadStatus)}
        className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Комментарий к смене статуса (необязательно)"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-flame resize-none"
      />
      <button
        type="submit"
        disabled={pending || status === current}
        className="w-full h-10 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider hover:brightness-105 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {pending && <Loader2 className="h-3 w-3 animate-spin" />}
        Применить
      </button>
    </form>
  );
}
