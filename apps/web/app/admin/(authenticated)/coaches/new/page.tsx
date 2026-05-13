import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CoachForm } from "@/components/admin/CoachForm";

export default function NewCoachPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/admin/coaches"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink/60 hover:text-flame transition"
      >
        <ArrowLeft className="h-3 w-3" /> К тренерам
      </Link>
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
          Тренеры
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Новый тренер</h1>
      </header>
      <section className="rounded-2xl border border-line bg-white p-5">
        <CoachForm mode="create" />
      </section>
    </div>
  );
}
