"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";

import type { AdminMedia, MediaList } from "@/lib/admin-api";
import {
  deleteMediaAction,
  listMediaAction,
  uploadMediaAction,
} from "@/lib/auth-actions";

export function MediaGallery({
  initial,
  canMutate = true,
}: {
  initial: MediaList;
  /** ADMIN / EDITOR / MANAGER; VIEWER — только просмотр */
  canMutate?: boolean;
}) {
  const [items, setItems] = useState<AdminMedia[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [page, setPage] = useState(initial.page);
  const [limit] = useState(initial.limit);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setItems(initial.items);
    setTotal(initial.total);
    setPage(initial.page);
  }, [initial.items, initial.total, initial.page, initial.limit]);

  const upload = async (file: File) => {
    if (!canMutate) return;
    const fd = new FormData();
    fd.append("file", file);
    if (file.name) fd.append("alt", file.name.replace(/\.[a-z0-9]+$/i, ""));
    startTransition(async () => {
      const r = await uploadMediaAction(fd);
      if (!r.ok) {
        toast.error("Не удалось загрузить", { description: r.error });
        return;
      }
      toast.success("Файл загружен");
      router.refresh();
    });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void upload(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
  };

  const remove = (m: AdminMedia) => {
    if (!canMutate) return;
    if (!confirm("Удалить файл? Восстановить не получится.")) return;
    startTransition(async () => {
      const r = await deleteMediaAction(m.id);
      if (!r.ok) {
        toast.error("Не удалось удалить", { description: r.error });
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== m.id));
      toast.success("Файл удалён");
      router.refresh();
    });
  };

  const loadMore = () => {
    if (items.length >= total || loadingMore) return;
    setLoadingMore(true);
    listMediaAction({ page: page + 1, limit })
      .then((r) => {
        if (!r.ok) {
          toast.error("Не удалось подгрузить", { description: r.error });
          return;
        }
        setItems((prev) => [...prev, ...((r.items ?? []) as AdminMedia[])]);
        setPage(r.page ?? page + 1);
        setTotal(r.total ?? total);
      })
      .finally(() => setLoadingMore(false));
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL скопирован");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <div className="space-y-6">
      {canMutate ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-2xl border-2 border-dashed border-line bg-white/60 p-8 text-center"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            className="hidden"
            onChange={onFile}
          />
          <Upload className="mx-auto h-6 w-6 text-flame" />
          <p className="mt-3 text-sm text-ink/65">
            Перетащите файл сюда или{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-flame hover:underline"
            >
              выберите файл
            </button>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-ink/40">
            Изображения: JPG · PNG · WebP · AVIF · GIF · SVG · до 12MB · Видео: MP4 · WebM · до 120MB
          </p>
          {pending && (
            <p className="mt-3 text-xs text-ink/55 inline-flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Обработка…
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white/60 p-6 text-center text-sm text-ink/55">
          Загрузка недоступна для вашей роли. Нужны права ADMIN, EDITOR или MANAGER.
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-center text-ink/40 py-10">Файлов пока нет.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((m) => {
            const preview = m.thumbUrl ?? m.webpUrl ?? m.url;
            const mime = m.mime ?? "";
            const isVid = m.kind === "VIDEO" || mime.startsWith("video/");
            return (
              <li
                key={m.id}
                className="group relative rounded-xl overflow-hidden border border-line bg-white aspect-square"
              >
                {isVid ? (
                  /* eslint-disable-next-line jsx-a11y/media-has-caption */
                  <video
                    aria-label={m.altDefault ?? "Видео"}
                    src={m.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover bg-night"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={preview}
                    alt={m.altDefault ?? ""}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-night/70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-2">
                  <div className="text-[9px] uppercase text-white/60 font-mono-pro mb-1">
                    {isVid ? mime.replace("video/", "video ") : mime.replace("image/", "")} ·{" "}
                    {prettySize(m.sizeBytes)}
                  </div>
                  <div
                    className={`flex items-center gap-1 ${canMutate ? "justify-between" : "justify-start"}`}
                  >
                    <button
                      type="button"
                      onClick={() => copy(m.webpUrl ?? m.url)}
                      className="h-7 px-2 inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-wider"
                      title="Скопировать URL"
                    >
                      <Copy className="h-3 w-3" /> URL
                    </button>
                    {canMutate ? (
                      <button
                        type="button"
                        onClick={() => remove(m)}
                        disabled={pending}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-red-500/20 hover:bg-red-500/30 text-white disabled:opacity-40"
                        title="Удалить"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > 0 && items.length < total && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => loadMore()}
            className="h-10 px-5 rounded-full border border-line text-xs uppercase tracking-wider hover:bg-surface disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Показать ещё ({total - items.length})
          </button>
        </div>
      )}
    </div>
  );
}

function prettySize(b: number | null): string {
  if (!b) return "—";
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1024 / 1024).toFixed(2)}MB`;
}
