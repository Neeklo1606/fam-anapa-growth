import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { VideoForm } from "@/components/admin/VideoForm";

export default function NewVideoPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/videos"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink/60 hover:text-flame transition"
      >
        <ArrowLeft className="h-3 w-3" /> К видео
      </Link>
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">Видео</div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Новое видео</h1>
      </header>
      <section className="rounded-2xl border border-line bg-white p-5 max-w-3xl">
        <VideoForm mode="create" />
      </section>
    </div>
  );
}
