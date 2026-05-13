"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import type { AdminKnowledgeDocBrief } from "@/lib/admin-api";
import {
  deleteKnowledgeDocAction,
  updateKnowledgeDocAction,
} from "@/lib/auth-actions";

export function KnowledgeDocsList({
  docs,
  canEdit,
  canDelete,
}: {
  docs: AdminKnowledgeDocBrief[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const togglePub = (d: AdminKnowledgeDocBrief) => {
    if (!canEdit) return;
    startTransition(async () => {
      const r = await updateKnowledgeDocAction({
        id: d.id,
        published: !d.published,
      });
      if (!r.ok) {
        toast.error("Не удалось", { description: r.error });
        return;
      }
      toast.success(!d.published ? "Материал опубликован" : "Материал скрыт");
      router.refresh();
    });
  };

  const remove = (d: AdminKnowledgeDocBrief) => {
    if (!canDelete || !confirm(`Удалить «${d.title}» навсегда?`)) return;
    startTransition(async () => {
      const r = await deleteKnowledgeDocAction(d.id);
      if (!r.ok) {
        toast.error("Нет доступа или ошибка удаления", { description: r.error });
        return;
      }
      toast.success("Запись удалена");
      router.refresh();
    });
  };

  if (docs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/40">
        Записей пока нет. Нажмите «Новый материал», чтобы добавить текст для RAG или раздел «Вопросы родителей» позже на сайте.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {docs.map((d) => (
        <li
          key={d.id}
          className="rounded-2xl border border-line bg-white p-4 flex flex-wrap gap-3 items-start justify-between"
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  d.published ? "bg-emerald-50 text-emerald-800" : "bg-ink/5 text-ink/50"
                }`}
              >
                {d.published ? "В эфире" : "Черновик"}
              </span>
              <span className="text-[10px] font-mono text-ink/40">{d.slug}</span>
            </div>
            <Link
              href={`/admin/knowledge/${d.id}`}
              className="font-display text-lg text-ink hover:text-flame transition block truncate"
            >
              {d.title}
            </Link>
            {d.summary ? (
              <p className="text-sm text-ink/55 line-clamp-2">{d.summary}</p>
            ) : null}
            <p className="text-[11px] text-ink/35">
              Чанков: {d._count.chunks} · обновлено {new Date(d.updatedAt).toLocaleString("ru-RU")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {canEdit ? (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => togglePub(d)}
                  className="h-9 px-3 rounded-full border border-line text-[10px] uppercase tracking-wider hover:border-flame disabled:opacity-50"
                >
                  {d.published ? "Скрыть" : "Опубликовать"}
                </button>
                {canDelete ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(d)}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    title="Удалить"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </>
            ) : (
              <Link
                href={`/admin/knowledge/${d.id}`}
                className="h-9 px-4 inline-flex items-center rounded-full bg-ink/[0.04] text-[10px] uppercase tracking-wider"
              >
                Просмотр
              </Link>
            )}
            {pending ? <Loader2 className="h-4 w-4 animate-spin text-flame mt-2" /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
