"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";

import type { AdminCoach } from "@/lib/admin-api";
import {
  deleteCoachAction,
  reorderCoachesAction,
  updateCoachAction,
} from "@/lib/auth-actions";

export function CoachesList({ coaches }: { coaches: AdminCoach[] }) {
  const [list, setList] = useState(coaches);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const persistOrder = (next: AdminCoach[]) => {
    startTransition(async () => {
      const r = await reorderCoachesAction(
        next.map((c, idx) => ({ id: c.id, order: idx })),
      );
      if (!r.ok) {
        toast.error("Не удалось сохранить порядок", { description: r.error });
        return;
      }
      toast.success("Порядок обновлён");
      router.refresh();
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = list.findIndex((c) => c.id === id);
    const next = [...list];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    setList(next);
    persistOrder(next);
  };

  const toggleActive = (c: AdminCoach) => {
    startTransition(async () => {
      const r = await updateCoachAction({ id: c.id, active: !c.active });
      if (!r.ok) {
        toast.error("Не удалось", { description: r.error });
        return;
      }
      router.refresh();
    });
  };

  const remove = (c: AdminCoach) => {
    if (!confirm(`Удалить тренера «${c.fullName}» безвозвратно?`)) return;
    startTransition(async () => {
      const r = await deleteCoachAction(c.id);
      if (!r.ok) {
        toast.error("Не удалось удалить", { description: r.error });
        return;
      }
      toast.success("Тренер удалён");
      router.refresh();
    });
  };

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/40">
        Тренеров пока нет. Нажмите «Добавить».
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {list.map((c, idx) => (
        <li
          key={c.id}
          className={`grid grid-cols-[64px_1fr_auto] gap-4 items-center rounded-2xl border border-line bg-white p-3 ${
            c.active ? "" : "opacity-55"
          }`}
        >
          <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-surface">
            {(() => {
              const src = c.photo?.thumbUrl ?? c.photo?.webpUrl ?? c.photo?.url ?? c.photoUrl;
              if (!src)
                return (
                  <span className="absolute inset-0 flex items-center justify-center text-ink/30 text-xs">
                    нет фото
                  </span>
                );
              return (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={src}
                  alt={c.fullName}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              );
            })()}
          </div>
          <div className="min-w-0">
            <div className="font-medium">
              <Link href={`/admin/coaches/${c.id}`} className="hover:text-flame">
                {c.fullName}
              </Link>
            </div>
            <div className="text-xs text-ink/60">{c.role}</div>
            <div className="text-xs text-ink/45 mt-1 line-clamp-1">{c.shortDescription}</div>
          </div>
          <div className="flex items-center gap-1">
            <IconBtn
              onClick={() => move(c.id, -1)}
              disabled={pending || idx === 0}
              title="Выше"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn
              onClick={() => move(c.id, +1)}
              disabled={pending || idx === list.length - 1}
              title="Ниже"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn
              onClick={() => toggleActive(c)}
              disabled={pending}
              title={c.active ? "Скрыть с сайта" : "Показать на сайте"}
            >
              {c.active ? (
                <Eye className="h-3.5 w-3.5 text-emerald-700" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-zinc-500" />
              )}
            </IconBtn>
            <IconBtn onClick={() => remove(c)} disabled={pending} title="Удалить">
              <Trash2 className="h-3.5 w-3.5 text-red-600" />
            </IconBtn>
            {pending && <Loader2 className="h-3 w-3 animate-spin text-ink/40 ml-1" />}
          </div>
        </li>
      ))}
    </ul>
  );
}

function IconBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-line hover:bg-surface transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
