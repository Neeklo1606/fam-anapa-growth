"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import type { AdminGalleryItem } from "@/lib/admin-api";
import {
  createGalleryItemAction,
  updateGalleryItemAction,
} from "@/lib/auth-actions";
import { MediaPicker } from "@/components/admin/MediaPicker";

const CATEGORIES = [
  { value: "TRAININGS", label: "Тренировки" },
  { value: "TOURNAMENTS", label: "Турниры" },
  { value: "GOALKEEPER_SCHOOL", label: "Школа вратарей" },
  { value: "FIELD", label: "Поле" },
  { value: "TEAM", label: "Команда" },
  { value: "OTHER", label: "Другое" },
] as const;

export function GalleryForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: AdminGalleryItem;
}) {
  const [picked, setPicked] = useState<{ id: string; url: string; thumbUrl: string | null } | null>(
    initial?.media ? { id: initial.media.id, url: initial.media.webpUrl ?? initial.media.url, thumbUrl: initial.media.thumbUrl } : null,
  );
  const [alt, setAlt] = useState(initial?.alt ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "OTHER");
  const [active, setActive] = useState(initial?.active ?? true);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked?.id) {
      toast.error("Выберите изображение из медиа");
      return;
    }
    if (!alt.trim()) {
      toast.error("Заполните alt");
      return;
    }
    startTransition(async () => {
      const base = {
        mediaId: picked.id,
        alt: alt.trim(),
        title: title.trim() || undefined,
        category,
        active,
      };
      const r =
        mode === "create"
          ? await createGalleryItemAction(base)
          : await updateGalleryItemAction({ id: initial!.id, ...base });
      if (!r.ok) {
        toast.error("Не удалось сохранить", { description: r.error });
        return;
      }
      toast.success(mode === "create" ? "Слайд добавлен" : "Сохранено");
      router.push("/admin/gallery");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5 max-w-xl">
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-2">
          Изображение (медиа)
        </span>
        <MediaPicker value={picked} onChange={setPicked} hint="Обязательно — загрузите в «Медиа» или выберите уже загруженное." />
      </label>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1">Заголовок на слайде</span>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Подпись под фото" />
      </label>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1">Alt (доступность)</span>
        <input required className={inputCls} value={alt} onChange={(e) => setAlt(e.target.value)} />
      </label>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1">Категория</span>
        <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-line" />
        Показывать на сайте
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
      >
        {pending && <Loader2 className="h-3 w-3 animate-spin" />}
        <Save className="h-3 w-3" /> Сохранить
      </button>
    </form>
  );
}

const inputCls =
  "h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";
