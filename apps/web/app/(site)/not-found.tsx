import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-night text-white px-4 relative overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-30" />
      <div className="relative max-w-md text-center">
        <div className="font-display text-[10rem] leading-none text-gradient-brand">404</div>
        <h2 className="mt-2 font-display text-2xl tracking-wider">Страница не найдена</h2>
        <p className="mt-3 text-sm text-white/60">
          Возможно, она была перемещена или больше не существует.
        </p>
        <div className="mt-7">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-flame px-6 py-3 text-sm font-semibold uppercase tracking-wider shadow-flame"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
