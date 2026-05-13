import { fetchMedia } from "@/lib/admin-api";
import { MediaGallery } from "@/components/admin/MediaGallery";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const list = await fetchMedia({ page, limit: 48 });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            Сайт
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Медиа</h1>
          <p className="mt-1 text-sm text-ink/55">
            Всего файлов: {list.total}. Загруженные изображения автоматически конвертируются в WebP.
          </p>
        </div>
      </header>

      <MediaGallery initial={list} />
    </div>
  );
}
