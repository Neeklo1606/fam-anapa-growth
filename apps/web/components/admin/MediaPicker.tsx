"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Film, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";

import type { AdminMedia } from "@/lib/admin-api";
import { listMediaAction, uploadMediaAction } from "@/lib/auth-actions";

export function MediaPicker({
  value,
  onChange,
  hint,
  fallbackPreviewUrl,
  siteStaticPaths,
  onPickSiteStatic,
  assetKind = "IMAGE",
  clearableFallback,
  onFallbackClear,
}: {
  value: { id: string; url: string; thumbUrl: string | null } | null;
  onChange: (v: { id: string; url: string; thumbUrl: string | null } | null) => void;
  hint?: string;
  fallbackPreviewUrl?: string | null;
  siteStaticPaths?: string[];
  onPickSiteStatic?: (path: string) => void;
  /** Только файлы нужного типа в списке и при загрузке. */
  assetKind?: "IMAGE" | "VIDEO";
  /** Показать «Очистить» при сохранённом URL в fallback (форма хранит только строку без `value`). */
  clearableFallback?: boolean;
  onFallbackClear?: () => void;
}) {
  const isVideo = assetKind === "VIDEO";
  const kindFilter = assetKind;

  const [open, setOpen] = useState(false);
  const [list, setList] = useState<AdminMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pendingUpload, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewSrc =
    value?.thumbUrl ??
    value?.url ??
    (fallbackPreviewUrl && fallbackPreviewUrl.trim().length > 0 ? fallbackPreviewUrl.trim() : null);

  const showClearBtn =
    Boolean(value) || Boolean(clearableFallback && fallbackPreviewUrl && fallbackPreviewUrl.trim().length > 0);
  const hasPreview = Boolean(previewSrc);
  const actionLabel = hasPreview ? "Заменить" : isVideo ? "Выбрать видео из медиа" : "Выбрать из медиа";

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    let cancelled = false;
    listMediaAction({ page: 1, limit: 100, kind: kindFilter, includeBundles: false })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) {
          toast.error("Не удалось загрузить список медиа", { description: r.error });
          setList([]);
          setTotal(0);
          setLastPage(0);
          return;
        }
        setList((r.items ?? []) as AdminMedia[]);
        setTotal(r.total ?? 0);
        setLastPage(1);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, kindFilter]);

  const loadMore = () => {
    if (loading || loadingMore) return;
    if (list.length >= total) return;
    const next = lastPage + 1;
    setLoadingMore(true);
    listMediaAction({ page: next, limit: 100, kind: kindFilter, includeBundles: false })
      .then((r) => {
        if (!r.ok) {
          toast.error("Не удалось подгрузить медиа", { description: r.error });
          return;
        }
        setList((prev) => [...prev, ...((r.items ?? []) as AdminMedia[])]);
        setLastPage(next);
        setTotal(r.total ?? total);
      })
      .finally(() => setLoadingMore(false));
  };

  const select = (m: AdminMedia) => {
    const pickedUrl = isVideo ? m.url : (m.webpUrl ?? m.url);
    onChange({ id: m.id, url: pickedUrl, thumbUrl: m.thumbUrl });
    setOpen(false);
  };

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    startUpload(async () => {
      const r = await uploadMediaAction(fd);
      if (!r.ok) {
        toast.error("Не удалось загрузить", { description: r.error });
        return;
      }
      toast.success("Файл загружен");
      if (r.id && r.url) {
        const pickedUrl = isVideo ? r.url : (r.webpUrl ?? r.url);
        onChange({ id: r.id, url: pickedUrl, thumbUrl: r.thumbUrl ?? null });
        setOpen(false);
      }
    });
  };

  const showStatic = Boolean(siteStaticPaths?.length && onPickSiteStatic && !isVideo);

  const clear = () => {
    onChange(null);
    onFallbackClear?.();
  };

  const fileAccept = isVideo ? "video/mp4,video/webm" : "image/*";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-surface border border-line shrink-0">
          {previewSrc ? (
            isVideo ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={previewSrc}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-ink/30">
              {isVideo ? <Film className="h-6 w-6" /> : <ImageIcon className="h-5 w-5" />}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-9 px-4 rounded-lg border border-line text-xs uppercase tracking-wider hover:bg-surface transition w-fit"
          >
            {actionLabel}
          </button>
          {showClearBtn && (
            <button
              type="button"
              onClick={() => clear()}
              className="h-9 px-4 rounded-lg text-xs uppercase tracking-wider text-red-600 hover:bg-red-50 transition w-fit"
            >
              Очистить
            </button>
          )}
          {hint && <p className="text-[10px] text-ink/45 leading-snug">{hint}</p>}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-night/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-line shrink-0">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-flame">Медиа</div>
                <h3 className="font-display text-lg">{isVideo ? "Выбор видео" : "Выбор изображения"}</h3>
                <p className="text-[10px] text-ink/45 mt-0.5">
                  Загружено в систему: {total ? `${list.length} из ${total}` : loading ? "…" : "0"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept={fileAccept}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={pendingUpload}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-flame text-white text-[11px] uppercase tracking-wider font-semibold disabled:opacity-50"
                >
                  {pendingUpload ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  Загрузить
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-line hover:bg-surface"
                  aria-label="Закрыть"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            <div className="overflow-y-auto p-4 flex-1 space-y-6">
              {showStatic && (
                <section>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-2">
                    Статика сайта (public/img)
                  </h4>
                  <p className="text-[10px] text-ink/40 mb-2 leading-snug">
                    Файлы из репозитория, не дублируются в медиатеке. Подставляют URL в форму (как fallback).
                  </p>
                  <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                    {siteStaticPaths!.map((path) => (
                      <li key={path}>
                        <button
                          type="button"
                          onClick={() => {
                            onPickSiteStatic!(path);
                            setOpen(false);
                          }}
                          className="relative aspect-square w-full rounded-xl overflow-hidden border border-line hover:border-flame transition"
                          title={path}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={path}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-2">
                  Загруженные файлы
                </h4>
                {loading ? (
                  <p className="text-center py-10 text-ink/40">Загрузка…</p>
                ) : list.length === 0 ? (
                  <p className="text-center py-10 text-ink/45 text-sm leading-relaxed max-w-md mx-auto px-2">
                    {isVideo ? (
                      <>
                        В библиотеке нет загруженных MP4/WebM. Ролик главной из кода сайта (<code className="text-[11px]">/hero.mp4</code>)
                        лежит в <code className="text-[11px]">public</code> и сюда автоматически не подставляется — нажмите «Загрузить» выше
                        или добавьте файл в разделе «Медиа» (до 120MB).
                      </>
                    ) : (
                      <>
                        Загруженных изображений ещё нет. Файлы из <code className="text-[11px]">public/img</code> для сайта здесь не
                        дублируются автоматически — при необходимости загрузите их вручную.
                      </>
                    )}
                  </p>
                ) : (
                  <>
                    <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {list.map((m) => (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => select(m)}
                            className="relative aspect-square w-full rounded-xl overflow-hidden border border-line hover:border-flame transition"
                          >
                            {(m.kind === "VIDEO" || (m.mime ?? "").startsWith("video/")) ? (
                              // eslint-disable-next-line jsx-a11y/media-has-caption
                              <video
                                src={m.url}
                                muted
                                playsInline
                                preload="metadata"
                                className="absolute inset-0 h-full w-full object-cover bg-night"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={m.thumbUrl ?? m.webpUrl ?? m.url}
                                alt={m.altDefault ?? ""}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {list.length < total && (
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          disabled={loadingMore}
                          onClick={() => loadMore()}
                          className="h-9 px-4 rounded-lg border border-line text-xs uppercase tracking-wider hover:bg-surface disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          {loadingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          Показать ещё ({total - list.length})
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
