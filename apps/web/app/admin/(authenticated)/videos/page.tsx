import Link from "next/link";

import { fetchVideosAdmin } from "@/lib/admin-api";
import { VideosList } from "@/components/admin/VideosList";

export default async function AdminVideosPage() {
  const items = await fetchVideosAdmin();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">Сайт</div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Видео</h1>
          <p className="mt-1 text-sm text-ink/55">
            Ролики на главной (YouTube встраивается; остальные — ссылка с постером).
          </p>
        </div>
        <Link
          href="/admin/videos/new"
          className="inline-flex h-10 items-center px-5 rounded-full bg-flame text-white text-[11px] uppercase tracking-wider font-semibold"
        >
          + Видео
        </Link>
      </header>
      <VideosList items={items} />
    </div>
  );
}
