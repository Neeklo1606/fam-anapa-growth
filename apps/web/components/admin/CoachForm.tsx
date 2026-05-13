"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import type { AdminCoach } from "@/lib/admin-api";
import {
  createCoachAction,
  updateCoachAction,
  type CoachInput,
} from "@/lib/auth-actions";
import { MediaPicker } from "./MediaPicker";

type Mode = "create" | "edit";

export function CoachForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: AdminCoach;
}) {
  const [form, setForm] = useState<CoachInput>({
    fullName: initial?.fullName ?? "",
    role: initial?.role ?? "",
    shortDescription: initial?.shortDescription ?? "",
    photoUrl: initial?.photoUrl ?? "",
    photoMediaId: initial?.photoMediaId ?? null,
    education: initial?.education ?? "",
    license: initial?.license ?? "",
    experience: initial?.experience ?? "",
    fullDescription: initial?.fullDescription ?? "",
    active: initial?.active ?? true,
  });

  const [picked, setPicked] = useState<{ id: string; url: string; thumbUrl: string | null } | null>(
    initial?.photo
      ? {
          id: initial.photo.id,
          url: initial.photo.webpUrl ?? initial.photo.url,
          thumbUrl: initial.photo.thumbUrl,
        }
      : null,
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const set = <K extends keyof CoachInput>(key: K, value: CoachInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.fullName.trim().length < 2) {
      toast.error("Укажите ФИО тренера");
      return;
    }
    if (form.role.trim().length < 2) {
      toast.error("Укажите должность");
      return;
    }
    if (form.shortDescription.trim().length < 2) {
      toast.error("Заполните короткое описание");
      return;
    }
    startTransition(async () => {
      const payload: CoachInput = {
        ...form,
        photoUrl: form.photoUrl?.trim() || undefined,
        photoMediaId: picked?.id ?? null,
        education: form.education?.trim() || undefined,
        license: form.license?.trim() || undefined,
        experience: form.experience?.trim() || undefined,
        fullDescription: form.fullDescription?.trim() || undefined,
      };
      const r =
        mode === "create"
          ? await createCoachAction(payload)
          : await updateCoachAction({ id: initial!.id, ...payload });
      if (!r.ok) {
        toast.error("Не удалось сохранить", { description: r.error });
        return;
      }
      toast.success(mode === "create" ? "Тренер добавлен" : "Изменения сохранены");
      router.push("/admin/coaches");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
      <Field label="ФИО" wide>
        <input required minLength={2} className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
      </Field>
      <Field label="Должность / роль">
        <input required minLength={2} className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Главный тренер" />
      </Field>
      <Field label="Фото" wide>
        <MediaPicker
          value={picked}
          onChange={setPicked}
          hint="Загрузите фотографию или выберите из библиотеки. Поле «URL фото» ниже используется как fallback, если не выбрано медиа."
        />
      </Field>
      <Field label="URL фото (fallback)" wide>
        <input className={inputCls} value={form.photoUrl ?? ""} onChange={(e) => set("photoUrl", e.target.value)} placeholder="/img/coach-gubin.jpg" />
      </Field>
      <Field label="Короткое описание" wide>
        <textarea required minLength={2} className={`${inputCls} min-h-20`} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
      </Field>
      <Field label="Образование">
        <input className={inputCls} value={form.education ?? ""} onChange={(e) => set("education", e.target.value)} />
      </Field>
      <Field label="Лицензия">
        <input className={inputCls} value={form.license ?? ""} onChange={(e) => set("license", e.target.value)} />
      </Field>
      <Field label="Опыт">
        <input className={inputCls} value={form.experience ?? ""} onChange={(e) => set("experience", e.target.value)} placeholder="10+ лет" />
      </Field>
      <Field label="Полное описание (для детальной страницы)" wide>
        <textarea className={`${inputCls} min-h-32`} value={form.fullDescription ?? ""} onChange={(e) => set("fullDescription", e.target.value)} />
      </Field>

      <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.active ?? true}
          onChange={(e) => set("active", e.target.checked)}
          className="h-4 w-4 rounded border-line"
        />
        Показывать на сайте
      </label>

      <div className="sm:col-span-2 flex justify-end gap-2">
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

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";

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
