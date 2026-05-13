"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import type { AdminVideo } from "@/lib/admin-api";
import { createVideoAction, updateVideoAction } from "@/lib/auth-actions";
import { MediaPicker } from "@/components/admin/MediaPicker";

export function VideoForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: AdminVideo;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [posterUrl, setPosterUrl] = useState(initial?.posterUrl ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [picked, setPicked] = useState<{ id: string; url: string; thumbUrl: string | null } | null>(
    initial?.poster
      ? {
          id: initial.poster.id,
          url: initial.poster.webpUrl ?? initial.poster.url,
          thumbUrl: initial.poster.thumbUrl,
        }
      : null,
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Заполните название и ссылку");
      return;
    }
    startTransition(async () => {
      const payload = {
        title: title.trim(),
        url: url.trim(),
        posterUrl: posterUrl.trim() || null,
        posterMediaId: picked?.id ?? null,
        description: description.trim() || null,
        active,
      };
      const r =
        mode === "create"
          ? await createVideoAction(payload)
          : await updateVideoAction({ id: initial!.id, ...payload });
      if (!r.ok) {
        toast.error("Не удалось сохранить", { description: r.error });
        return;
      }
      toast.success(mode === "create" ? "Видео добавлено" : "Сохранено");
      router.push("/admin/videos");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5 max-w-2xl">
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1">Название</span>
        <input required className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1">Ссылка (YouTube / VK / другое)</span>
        <input
          required
          className={inputCls}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </label>
      <div>
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-2">Постер (медиа)</span>
        <MediaPicker
          value={picked}
          onChange={setPicked}
          hint="Необязательно. Если пусто — используется URL постера ниже."
        />
      </div>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1">Постер URL (fallback)</span>
        <input className={inputCls} value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="/img/fam-training.jpg" />
      </label>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1">Описание</span>
        <textarea className={`${inputCls} min-h-24`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-line" />
        Показывать блок на сайте
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Сохранить
      </button>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";
