"use client";

import { useEffect } from "react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site-error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center bg-background">
      <p className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">ФАМ · Анапа</p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl tracking-tight text-deep">
        Страница не загрузилась
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink/60 leading-relaxed">
        Обновите страницу — после обновления сайта браузер иногда показывает устаревшую версию.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-11 px-6 rounded-full bg-flame text-white text-xs font-semibold uppercase tracking-wider shadow-flame hover:brightness-105 transition"
        >
          Обновить
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="h-11 px-6 rounded-full border border-line text-deep text-xs font-semibold uppercase tracking-wider hover:bg-surface transition"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
