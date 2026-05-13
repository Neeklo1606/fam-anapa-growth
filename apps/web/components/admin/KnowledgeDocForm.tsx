"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Puzzle, Layers } from "lucide-react";

import type { AdminKnowledgeDetail } from "@/lib/admin-api";
import {
  createKnowledgeDocAction,
  updateKnowledgeDocAction,
  rebuildKnowledgeChunksAction,
  embedKnowledgeChunksAction,
  type KnowledgeInput,
} from "@/lib/auth-actions";

type Mode = "create" | "edit";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";
const textareaCls = `${inputCls} min-h-[220px] font-mono text-[13px] leading-relaxed`;

export function KnowledgeDocForm({
  mode,
  initial,
  canEdit,
}: {
  mode: Mode;
  initial?: AdminKnowledgeDetail;
  canEdit: boolean;
}) {
  const [form, setForm] = useState<KnowledgeInput>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    summary: initial?.summary ?? "",
    body: initial?.body ?? "",
    sourceUrl: initial?.sourceUrl ?? "",
    published: initial?.published ?? false,
  });
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const set = <K extends keyof KnowledgeInput>(key: K, value: KnowledgeInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.trim().length < 2) {
      toast.error("Укажите заголовок");
      return;
    }
    if (form.slug.trim().length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      toast.error("Slug: только латиница в нижнем регистре, цифры и дефисы (направление-v-molodezhnyj)");
      return;
    }
    if (!form.body.trim()) {
      toast.error("Заполните текст");
      return;
    }
    startTransition(async () => {
      const payload: KnowledgeInput = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        summary: form.summary?.trim() || undefined,
        body: form.body.trim(),
        sourceUrl: form.sourceUrl?.trim() || undefined,
        published: form.published,
      };
      if (mode === "create") {
        const r = await createKnowledgeDocAction(payload);
        if (!r.ok) {
          toast.error("Не удалось сохранить", { description: r.error });
          return;
        }
        toast.success("Материал создан");
        router.push(`/admin/knowledge/${r.id}`);
        return;
      }
      const r = await updateKnowledgeDocAction({ id: initial!.id, ...payload });
      if (!r.ok) {
        toast.error("Не удалось сохранить", { description: r.error });
        return;
      }
      toast.success("Сохранено");
      router.refresh();
    });
  };

  const rebuild = () => {
    if (mode !== "edit" || !initial) return;
    startTransition(async () => {
      const r = await rebuildKnowledgeChunksAction(initial.id);
      if (!r.ok) {
        toast.error("Пересборка чанков", { description: r.error });
        return;
      }
      toast.success("Чанки пересобраны (эмбеддинги нужно заново запросить при необходимости)");
      router.refresh();
    });
  };

  const embed = () => {
    if (mode !== "edit" || !initial) return;
    startTransition(async () => {
      const r = await embedKnowledgeChunksAction(initial.id);
      if (!r.ok) {
        toast.error("Эмбеддинги", { description: r.error ?? r.message });
        return;
      }
      toast.success(`Обновлено векторов: ${r.updated ?? 0}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
      <Field label="Заголовок" wide>
        <input
          required
          minLength={2}
          className={inputCls}
          value={form.title}
          disabled={!canEdit}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Slug (URL)">
        <input
          required
          minLength={2}
          className={inputCls}
          value={form.slug}
          disabled={!canEdit}
          onChange={(e) => set("slug", e.target.value.toLowerCase())}
          placeholder="format-molodezhnyj"
        />
      </Field>
      <Field label="Краткое описание (для списков)" wide>
        <textarea
          className={textareaCls}
          rows={3}
          value={form.summary ?? ""}
          disabled={!canEdit}
          onChange={(e) => set("summary", e.target.value)}
        />
      </Field>
      <Field label="Источник (URL)" wide>
        <input
          className={inputCls}
          value={form.sourceUrl ?? ""}
          disabled={!canEdit}
          onChange={(e) => set("sourceUrl", e.target.value)}
          placeholder="https://…"
        />
      </Field>
      <Field label="Текст (основа для чанков / RAG)" wide>
        <textarea
          required
          className={`${textareaCls} min-h-[320px]`}
          value={form.body}
          disabled={!canEdit}
          onChange={(e) => set("body", e.target.value)}
        />
      </Field>

      <label className="sm:col-span-2 flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={form.published ?? false}
          disabled={!canEdit}
          onChange={(e) => set("published", e.target.checked)}
          className="h-4 w-4 rounded border-line"
        />
        Опубликовать (доступно публичному API и поиску)
      </label>

      {mode === "edit" && initial ? (
        <div className="sm:col-span-2 rounded-xl border border-line bg-ink/[0.02] p-4 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink/40">Индекс</div>
          <p className="text-xs text-ink/50">
            Чанков: {initial.chunkCount} · с эмбеддингами: {initial.embeddedChunkCount}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending || !canEdit}
              onClick={rebuild}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-line text-[10px] font-semibold uppercase tracking-wider hover:border-flame disabled:opacity-50"
            >
              <Layers className="h-3 w-3" /> Пересобрать чанки
            </button>
            <button
              type="button"
              disabled={pending || !canEdit}
              onClick={embed}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-line text-[10px] font-semibold uppercase tracking-wider hover:border-flame disabled:opacity-50"
            >
              <Puzzle className="h-3 w-3" /> Запросить эмбеддинги (OpenAI)
            </button>
          </div>
          <p className="text-[11px] text-ink/40">
            После сохранения текста чанки обновятся автоматически; эмбеддинги — при наличии OPENAI_API_KEY на сервере API.
          </p>
        </div>
      ) : null}

      <div className="sm:col-span-2 flex justify-end gap-2">
        {canEdit ? (
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Сохранить
          </button>
        ) : (
          <p className="text-sm text-ink/45">У вас нет прав редактировать материалы (роль VIEWER).</p>
        )}
      </div>
    </form>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
