"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

import { createUserAction, type CreateUserInput } from "@/lib/auth-actions";

const ROLES: CreateUserInput["role"][] = ["ADMIN", "MANAGER", "EDITOR", "VIEWER"];

export function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<CreateUserInput["role"]>("MANAGER");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await createUserAction({ email, password, fullName, role });
      if (!r.ok) {
        toast.error("Не удалось создать", { description: r.error });
        return;
      }
      toast.success("Пользователь создан");
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("MANAGER");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
      <Field label="ФИО">
        <input
          required
          minLength={2}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
          placeholder="Иванов Иван Иванович"
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          required
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
          placeholder="ivanov@example.com"
        />
      </Field>
      <Field label="Пароль (минимум 8 символов)">
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
        />
      </Field>
      <Field label="Роль">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as CreateUserInput["role"])}
          className="h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] uppercase tracking-wider font-semibold disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
          Создать
        </button>
      </div>
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
