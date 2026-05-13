import { fetchMedia, fetchMe, type MediaList } from "@/lib/admin-api";
import { MediaGallery } from "@/components/admin/MediaGallery";

const emptyList = (page: number): MediaList => ({
  items: [],
  total: 0,
  page,
  limit: 60,
});

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const user = await fetchMe();

  let list: MediaList = emptyList(page);
  let listError: string | null = null;
  try {
    list = await fetchMedia({ page, limit: 60 });
  } catch (e) {
    listError = e instanceof Error ? e.message : String(e);
  }

  const canMutate =
    user &&
    (user.role === "ADMIN" || user.role === "EDITOR" || user.role === "MANAGER");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            Сайт
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Медиа</h1>
          <p className="mt-1 text-sm text-ink/55 max-w-3xl">
            Всего объектов в списке: <strong className="font-medium text-ink/70">{list.total}</strong> — включает{" "}
            <strong className="font-medium text-ink/70">изображения и видео из папки public</strong> сборки сайта (/img/…, /hero.mp4 и др.){" "}
            и то, что вы загрузили на сервер (URL <code className="text-xs bg-surface px-1 rounded">/uploads/…</code>). Файлы с меткой «Сборка»
            живут только в коде деплоя: их нельзя удалить из этого экрана, но можно скопировать публичный URL. Новые загрузки по-прежнему
            конвертируются в WebP (кроме SVG/видео).
          </p>
          {user?.role === "VIEWER" && (
            <p className="mt-2 text-sm text-ink/65">
              Роль <strong className="font-medium">VIEWER</strong>: просмотр и копирование URL. Загрузка и
              удаление доступны только <strong className="font-medium">ADMIN / EDITOR / MANAGER</strong>.
            </p>
          )}
        </div>
      </header>

      {listError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 space-y-1"
        >
          <div className="font-semibold">Не удалось загрузить список медиа</div>
          <div className="text-red-800/90 font-mono-pro text-[12px] break-words">{listError}</div>
          <p className="text-red-800/80 pt-1">
            Обновите страницу или выполните вход заново. Если ошибка 403 — проверьте роль пользователя и версию API на сервере.
          </p>
        </div>
      )}

      <MediaGallery initial={list} canMutate={Boolean(canMutate)} />
    </div>
  );
}
