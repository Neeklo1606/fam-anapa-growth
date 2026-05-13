import { fetchHomePageAdmin } from "@/lib/admin-api";
import { HomeBlocksForm } from "@/components/admin/HomeBlocksForm";
import { mergeStoredHomePage } from "@/lib/home-page-content";

export default async function AdminHomeBlocksPage() {
  const raw = await fetchHomePageAdmin();
  const initial = mergeStoredHomePage(raw.homeContent);

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
          Сайт
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Главная страница</h1>
        <p className="mt-1 text-sm text-ink/55">
          Тексты, ссылки на видео и изображения, привязка блоков к разделам с тренерами, галереей и
          видео из админки.
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-white p-5 md:p-8">
        <HomeBlocksForm initial={initial} />
      </section>
    </div>
  );
}
