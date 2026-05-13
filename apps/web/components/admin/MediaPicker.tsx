"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";

import type { AdminMedia } from "@/lib/admin-api";
import { listMediaAction, uploadMediaAction } from "@/lib/auth-actions";

export function MediaPicker({
  value,
  onChange,
  hint,
}: {
  value: { id: string; url: string; thumbUrl: string | null } | null;
  onChange: (v: { id: string; url: string; thumbUrl: string | null } | null) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<AdminMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingUpload, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    let cancelled = false;
    listMediaAction({ page: 1, limit: 60 })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) {
          toast.error("Не удалось загрузить список медиа", { description: r.error });
          return;
        }
        setList((r.items ?? []) as AdminMedia[]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const select = (m: AdminMedia) => {
    onChange({ id: m.id, url: m.webpUrl ?? m.url, thumbUrl: m.thumbUrl });
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
        onChange({ id: r.id, url: r.webpUrl ?? r.url, thumbUrl: r.thumbUrl ?? null });
        setOpen(false);
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-surface border border-line shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.thumbUrl ?? value.url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-ink/30">
              <ImageIcon className="h-5 w-5" />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-9 px-4 rounded-lg border border-line text-xs uppercase tracking-wider hover:bg-surface transition w-fit"
          >
            {value ? "Заменить" : "Выбрать из медиа"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
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
            <header className="flex items-center justify-between p-4 border-b border-line">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-flame">Медиа</div>
                <h3 className="font-display text-lg">Выбор изображения</h3>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
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

            <div className="overflow-y-auto p-4 flex-1">
              {loading ? (
                <p className="text-center py-10 text-ink/40">Загрузка…</p>
              ) : list.length === 0 ? (
                <p className="text-center py-10 text-ink/40">
                  Файлов нет. Загрузите первый файл.
                </p>
              ) : (
                <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {list.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => select(m)}
                        className="relative aspect-square w-full rounded-xl overflow-hidden border border-line hover:border-flame transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.thumbUrl ?? m.webpUrl ?? m.url}
                          alt={m.altDefault ?? ""}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
