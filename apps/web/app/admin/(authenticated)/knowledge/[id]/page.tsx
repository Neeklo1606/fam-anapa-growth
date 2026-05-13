import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { KnowledgeDocForm } from "@/components/admin/KnowledgeDocForm";
import { fetchKnowledgeDoc, fetchMe } from "@/lib/admin-api";

export default async function EditKnowledgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let doc;
  try {
    doc = await fetchKnowledgeDoc(id);
  } catch {
    notFound();
  }

  const user = await fetchMe();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/admin/knowledge"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink/60 hover:text-flame transition"
      >
        <ArrowLeft className="h-3 w-3" /> К базе знаний
      </Link>
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
          База знаний
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{doc.title}</h1>
      </header>
      <section className="rounded-2xl border border-line bg-white p-5">
        <KnowledgeDocForm mode="edit" initial={doc} canEdit={canEdit} />
      </section>
    </div>
  );
}
