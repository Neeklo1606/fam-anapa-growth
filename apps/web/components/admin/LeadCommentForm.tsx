"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";

import { addLeadCommentAction } from "@/lib/auth-actions";

export function LeadCommentForm({ leadId }: { leadId: string }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      const result = await addLeadCommentAction({ id: leadId, body: body.trim() });
      if (!result.ok) {
        toast.error("Не удалось добавить", { description: result.error });
        return;
      }
      setBody("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Добавить комментарий…"
        className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:border-flame resize-none"
      />
      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="h-9 px-4 rounded-full bg-flame text-white text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50 hover:brightness-105 transition"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
        Добавить
      </button>
    </form>
  );
}
