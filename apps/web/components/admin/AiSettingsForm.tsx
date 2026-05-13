"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import type { AdminAiSettings } from "@/lib/admin-api";
import { updateAiSettingsAction } from "@/lib/auth-actions";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";

export function AiSettingsForm({ initial }: { initial: AdminAiSettings }) {
  const presetIds = useMemo(() => new Set(initial.embeddingModels.map((m) => m.id)), [initial.embeddingModels]);

  const initialIsPreset = presetIds.has(initial.embeddingModel);

  const [embeddingChoice, setEmbeddingChoice] = useState<"preset" | "custom">(
    initialIsPreset ? "preset" : "custom",
  );
  const [presetModel, setPresetModel] = useState(
    initialIsPreset ? initial.embeddingModel : initial.embeddingModels[0]?.id ?? "text-embedding-3-small",
  );
  const [embeddingCustom, setEmbeddingCustom] = useState(
    initialIsPreset ? "" : initial.embeddingModel,
  );

  const [provider, setProvider] = useState(initial.provider ?? "openai");
  const [modelName, setModelName] = useState(initial.modelName ?? "");
  const [apiKey, setApiKey] = useState("");
  const [clearApiKey, setClearApiKey] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clearApiKey && apiKey.trim().length > 0) {
      toast.error("Снимите «удалить ключ» или не заполняйте новое поле ключа");
      return;
    }

    const embeddingResolved =
      embeddingChoice === "preset"
        ? presetModel.trim()
        : embeddingCustom.trim() || null;
    if (!embeddingResolved) {
      toast.error("Укажите модель эмбеддингов");
      return;
    }

    startTransition(async () => {
      const r = await updateAiSettingsAction({
        provider: provider.trim() || null,
        modelName: modelName.trim() || null,
        embeddingModel: embeddingResolved,
        ...(clearApiKey ? { clearApiKey: true } : {}),
        ...(apiKey.trim().length > 0 ? { apiKey: apiKey.trim() } : {}),
      });
      if (!r.ok) {
        toast.error("Не удалось сохранить", { description: r.error });
        return;
      }
      toast.success("Настройки ИИ сохранены");
      setApiKey("");
      setClearApiKey(false);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5 max-w-xl">
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        Ключ хранится в базе данных (доступ только роли ADMIN). Переменная{" "}
        <code className="text-[11px] bg-white/80 px-1 rounded">OPENAI_API_KEY</code> в{" "}
        <code className="text-[11px] bg-white/80 px-1 rounded">.env</code> — запасной вариант, если ключ в админке
        не задан.
      </div>

      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
          Провайдер (зарезервировано)
        </span>
        <select
          className={inputCls}
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="openai">OpenAI</option>
        </select>
      </label>

      <fieldset className="space-y-3">
        <legend className="text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-2 block">
          Модель эмбеддингов (RAG / база знаний)
        </legend>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="embed-mode"
            checked={embeddingChoice === "preset"}
            onChange={() => setEmbeddingChoice("preset")}
            className="h-4 w-4 rounded border-line"
          />
          Пресеты
        </label>
        {embeddingChoice === "preset" ? (
          <select
            className={inputCls}
            value={presetModel}
            onChange={(e) => setPresetModel(e.target.value)}
          >
            {initial.embeddingModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        ) : null}

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="embed-mode"
            checked={embeddingChoice === "custom"}
            onChange={() => setEmbeddingChoice("custom")}
            className="h-4 w-4 rounded border-line"
          />
          Своя модель (slug OpenAI)
        </label>
        {embeddingChoice === "custom" ? (
          <input
            className={inputCls}
            placeholder="text-embedding-3-large"
            value={embeddingCustom}
            onChange={(e) => setEmbeddingCustom(e.target.value)}
          />
        ) : null}
      </fieldset>

      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
          Модель чата (LLM, на будущее)
        </span>
        <input
          className={inputCls}
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="gpt-4o-mini"
        />
      </label>

      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
          API-ключ OpenAI
        </span>
        <p className="text-xs text-ink/50 mb-2">
          Сейчас в базе: {initial.hasApiKey ? "ключ задан" : "не задан (fallback: .env при наличии)"}
        </p>
        <input
          type="password"
          autoComplete="new-password"
          className={inputCls}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Введите новый ключ или оставьте пустым"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={clearApiKey}
          onChange={(e) => setClearApiKey(e.target.checked)}
          className="h-4 w-4 rounded border-line"
        />
        Удалить ключ из базы
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Сохранить
        </button>
      </div>
    </form>
  );
}
