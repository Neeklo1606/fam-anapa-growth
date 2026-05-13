import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GalleryForm } from "@/components/admin/GalleryForm";

export default function NewGalleryItemPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/admin/gallery"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink/60 hover:text-flame transition"
      >
        <ArrowLeft className="h-3 w-3" /> К галерее
      </Link>
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">Галерея</div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Новый слайд</h1>
      </header>
      <section className="rounded-2xl border border-line bg-white p-5">
        <GalleryForm mode="create" />
      </section>
    </div>
  );
}
