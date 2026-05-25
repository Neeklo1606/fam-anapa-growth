"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin-error]", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-2xl tracking-tight text-deep">Ошибка в админке</h1>
      <p className="mt-2 max-w-md text-sm text-ink/60">
        Возможно, истекла сессия. Войдите снова или обновите страницу.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link
          href="/admin/login"
          className="h-10 px-5 inline-flex items-center rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider"
        >
          Войти
        </Link>
        <button
          type="button"
          onClick={() => reset()}
          className="h-10 px-5 rounded-full border border-line text-[11px] font-semibold uppercase tracking-wider"
        >
          Повторить
        </button>
      </div>
    </div>
  );
}
