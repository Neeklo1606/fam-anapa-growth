import Link from "next/link";

import { fetchGalleryAdmin } from "@/lib/admin-api";
import { GalleryList } from "@/components/admin/GalleryList";

export default async function AdminGalleryPage() {
  const items = await fetchGalleryAdmin();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">Сайт</div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Галерея</h1>
          <p className="mt-1 text-sm text-ink/55">Слайды в блоке «Локация» на главной. Нужно изображение из медиа.</p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="inline-flex h-10 items-center px-5 rounded-full bg-flame text-white text-[11px] uppercase tracking-wider font-semibold"
        >
          + Слайд
        </Link>
      </header>
      <GalleryList items={items} />
    </div>
  );
}
