"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { assignManagerAction } from "@/lib/auth-actions";

export function AssignManager({
  leadId,
  current,
  managers,
}: {
  leadId: string;
  current: string | null;
  managers: Array<{ id: string; fullName: string; email: string; role: string }>;
}) {
  const [value, setValue] = useState<string>(current ?? "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const apply = (next: string) => {
    setValue(next);
    startTransition(async () => {
      const r = await assignManagerAction({
        id: leadId,
        managerId: next || null,
      });
      if (!r.ok) {
        toast.error("Не удалось назначить", { description: r.error });
        return;
      }
      toast.success(next ? "Менеджер назначен" : "Назначение снято");
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => apply(e.target.value)}
        disabled={pending}
        className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame disabled:opacity-60"
      >
        <option value="">— не назначен —</option>
        {managers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.fullName} ({m.role})
          </option>
        ))}
      </select>
      {pending && (
        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-ink/40" />
      )}
    </div>
  );
}
