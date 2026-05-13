import Link from "next/link";

import { KnowledgeDocsList } from "@/components/admin/KnowledgeDocsList";
import { fetchKnowledgeAdmin, fetchMe } from "@/lib/admin-api";

export default async function AdminKnowledgePage() {
  const [user, docs] = await Promise.all([fetchMe(), fetchKnowledgeAdmin()]);
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const canDelete = user?.role === "ADMIN";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            AI / RAG
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">База знаний</h1>
          <p className="mt-1 text-sm text-ink/55 max-w-xl">
            Материалы для семантического поиска и будущего чата: публичные эндпоинты{" "}
            <code className="text-[11px] bg-ink/5 px-1 rounded">GET /api/knowledge</code>,{" "}
            <code className="text-[11px] bg-ink/5 px-1 rounded">POST /api/knowledge/retrieve</code>.
          </p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/knowledge/new"
            className="inline-flex h-10 items-center px-5 rounded-full bg-flame text-white text-[11px] uppercase tracking-wider font-semibold"
          >
            + Новый материал
          </Link>
        ) : null}
      </header>

      <KnowledgeDocsList docs={docs} canEdit={Boolean(canEdit)} canDelete={canDelete} />
    </div>
  );
}
