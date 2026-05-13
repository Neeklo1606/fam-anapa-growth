"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { changeOwnPasswordAction } from "@/lib/auth-actions";

export function ChangeOwnPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Новый пароль слишком короткий");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Подтверждение не совпадает");
      return;
    }
    startTransition(async () => {
      const r = await changeOwnPasswordAction({ currentPassword, newPassword });
      if (!r.ok) {
        toast.error("Не удалось сменить пароль", { description: r.error });
        return;
      }
      toast.success("Пароль обновлён. Войдите заново.");
      router.push("/admin/login");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Текущий пароль">
        <input
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
        />
      </Field>
      <Field label="Новый пароль (минимум 8 символов)">
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
        />
      </Field>
      <Field label="Повторите новый пароль">
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
        />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] uppercase tracking-wider font-semibold disabled:opacity-50"
      >
        {pending && <Loader2 className="h-3 w-3 animate-spin" />}
        Сменить пароль
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
