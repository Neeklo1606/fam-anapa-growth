"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Trash2, ExternalLink } from "lucide-react";

import type { AdminVideo } from "@/lib/admin-api";
import {
  deleteVideoAction,
  reorderVideosAction,
  updateVideoAction,
} from "@/lib/auth-actions";

export function VideosList({ items }: { items: AdminVideo[] }) {
  const [list, setList] = useState(items);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const persistOrder = (next: AdminVideo[]) => {
    startTransition(async () => {
      const r = await reorderVideosAction(next.map((v, idx) => ({ id: v.id, order: idx })));
      if (!r.ok) {
        toast.error("Порядок не сохранён", { description: r.error });
        return;
      }
      toast.success("Порядок обновлён");
      router.refresh();
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = list.findIndex((v) => v.id === id);
    const next = [...list];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    setList(next);
    persistOrder(next);
  };

  const toggle = (v: AdminVideo) => {
    startTransition(async () => {
      const r = await updateVideoAction({ id: v.id, active: !v.active });
      if (!r.ok) toast.error(r.error ?? "ошибка");
      else router.refresh();
    });
  };

  const remove = (v: AdminVideo) => {
    if (!confirm(`Удалить «${v.title}»?`)) return;
    startTransition(async () => {
      const r = await deleteVideoAction(v.id);
      if (!r.ok) toast.error(r.error ?? "ошибка");
      else {
        toast.success("Удалено");
        router.refresh();
      }
    });
  };

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink/40">
        Видео пока не добавлены.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {list.map((v, idx) => {
        const poster = v.poster?.thumbUrl ?? v.poster?.webpUrl ?? v.poster?.url ?? v.posterUrl;
        return (
          <li
            key={v.id}
            className={`rounded-2xl border border-line bg-white p-4 flex flex-wrap gap-3 items-start justify-between ${
              v.active ? "" : "opacity-55"
            }`}
          >
            <div className="flex gap-3 min-w-0 flex-1">
              <div className="shrink-0 w-28 h-[4.5rem] rounded-xl bg-night/5 border border-line overflow-hidden relative">
                {poster ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-ink/35 text-center px-1">
                    нет постера
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium">
                  <Link href={`/admin/videos/${v.id}`} className="hover:text-flame">
                    {v.title}
                  </Link>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex text-ink/40 hover:text-flame"
                    title="Открыть ссылку"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="text-xs text-ink/50 truncate max-w-[min(90vw,28rem)] mt-1">{v.url}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <MiniBtn onClick={() => move(v.id, -1)} disabled={pending || idx === 0}>
                <ChevronUp className="h-3.5 w-3.5" />
              </MiniBtn>
              <MiniBtn onClick={() => move(v.id, +1)} disabled={pending || idx === list.length - 1}>
                <ChevronDown className="h-3.5 w-3.5" />
              </MiniBtn>
              <MiniBtn onClick={() => toggle(v)} disabled={pending}>
                {v.active ? (
                  <Eye className="h-3.5 w-3.5 text-emerald-700" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-zinc-500" />
                )}
              </MiniBtn>
              <MiniBtn onClick={() => remove(v)} disabled={pending}>
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </MiniBtn>
              {pending && <Loader2 className="h-3 w-3 animate-spin text-ink/40 ml-1" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function MiniBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-line hover:bg-surface transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
