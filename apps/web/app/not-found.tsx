import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-night text-white px-4 text-center">
      <div className="max-w-sm">
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">404</div>
        <h1 className="mt-3 font-display text-3xl tracking-tight">Страница не найдена</h1>
        <p className="mt-2 text-sm text-white/55">Запрошенный ресурс не существует.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-flame px-5 text-[11px] uppercase tracking-wider font-semibold"
          >
            На главную
          </Link>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center rounded-full border border-white/15 px-5 text-[11px] uppercase tracking-wider"
          >
            В админку
          </Link>
        </div>
      </div>
    </div>
  );
}
