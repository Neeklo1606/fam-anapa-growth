"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";

import type { AdminGalleryItem } from "@/lib/admin-api";
import {
  deleteGalleryItemAction,
  reorderGalleryAction,
  updateGalleryItemAction,
} from "@/lib/auth-actions";

export function GalleryList({ items }: { items: AdminGalleryItem[] }) {
  const [list, setList] = useState(items);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const persistOrder = (next: AdminGalleryItem[]) => {
    startTransition(async () => {
      const r = await reorderGalleryAction(next.map((g, idx) => ({ id: g.id, order: idx })));
      if (!r.ok) {
        toast.error("Не сохранился порядок", { description: r.error });
        return;
      }
      toast.success("Порядок обновлён");
      router.refresh();
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = list.findIndex((g) => g.id === id);
    const next = [...list];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    setList(next);
    persistOrder(next);
  };

  const toggle = (g: AdminGalleryItem) => {
    startTransition(async () => {
      const r = await updateGalleryItemAction({ id: g.id, active: !g.active });
      if (!r.ok) {
        toast.error("Не удалось", { description: r.error });
        return;
      }
      router.refresh();
    });
  };

  const remove = (g: AdminGalleryItem) => {
    if (!confirm(`Удалить слайд «${g.title || g.alt}»?`)) return;
    startTransition(async () => {
      const r = await deleteGalleryItemAction(g.id);
      if (!r.ok) {
        toast.error("Не удалось удалить", { description: r.error });
        return;
      }
      toast.success("Удалено");
      router.refresh();
    });
  };

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/40">
        Слайдов нет — добавьте изображение из медиа-библиотеки.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {list.map((g, idx) => {
        const src = g.media.thumbUrl ?? g.media.webpUrl ?? g.media.url;
        return (
          <li
            key={g.id}
            className={`grid grid-cols-[72px_1fr_auto] gap-4 items-center rounded-2xl border border-line bg-white p-3 ${
              g.active ? "" : "opacity-55"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={g.alt}
              className="h-[72px] w-[72px] rounded-xl object-cover bg-surface"
            />
            <div className="min-w-0">
              <div className="font-medium">
                <Link href={`/admin/gallery/${g.id}`} className="hover:text-flame">
                  {g.title || g.alt}
                </Link>
              </div>
              <div className="text-xs text-ink/50">{g.category}</div>
              <div className="text-xs text-ink/45 mt-1 truncate">{src}</div>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => move(g.id, -1)} disabled={pending || idx === 0} title="Выше">
                <ChevronUp className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn
                onClick={() => move(g.id, +1)}
                disabled={pending || idx === list.length - 1}
                title="Ниже"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn onClick={() => toggle(g)} disabled={pending} title={g.active ? "Скрыть" : "Показать"}>
                {g.active ? (
                  <Eye className="h-3.5 w-3.5 text-emerald-700" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-zinc-500" />
                )}
              </IconBtn>
              <IconBtn onClick={() => remove(g)} disabled={pending} title="Удалить">
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </IconBtn>
              {pending && <Loader2 className="h-3 w-3 animate-spin text-ink/40 ml-1" />}
            </div>
          </li>
        );
      })}
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
