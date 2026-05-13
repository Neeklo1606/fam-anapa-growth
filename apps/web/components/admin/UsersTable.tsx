"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound, ShieldOff, ShieldCheck } from "lucide-react";

import type { AdminUser } from "@/lib/admin-api";
import {
  resetUserPasswordAction,
  updateUserAction,
} from "@/lib/auth-actions";

const ROLES = ["ADMIN", "MANAGER", "EDITOR", "VIEWER"] as const;

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-surface text-ink/60 text-xs uppercase tracking-wider">
        <tr>
          <th className="text-left px-4 py-3">ФИО</th>
          <th className="text-left px-4 py-3">Email</th>
          <th className="text-left px-4 py-3">Роль</th>
          <th className="text-left px-4 py-3">Активен</th>
          <th className="text-left px-4 py-3">Последний вход</th>
          <th className="text-right px-4 py-3">Действия</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
        ))}
      </tbody>
    </table>
  );
}

function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onRole = (role: (typeof ROLES)[number]) => {
    if (role === user.role) return;
    startTransition(async () => {
      const r = await updateUserAction({ id: user.id, role });
      if (!r.ok) {
        toast.error("Не удалось", { description: r.error });
        return;
      }
      toast.success(`Роль изменена на ${role}`);
      router.refresh();
    });
  };

  const onToggleActive = () => {
    startTransition(async () => {
      const r = await updateUserAction({ id: user.id, isActive: !user.isActive });
      if (!r.ok) {
        toast.error("Не удалось", { description: r.error });
        return;
      }
      toast.success(user.isActive ? "Деактивирован" : "Активирован");
      router.refresh();
    });
  };

  const onResetPassword = () => {
    const password = window.prompt(`Новый пароль для ${user.email} (минимум 8 символов):`);
    if (!password) return;
    if (password.length < 8) {
      toast.error("Пароль слишком короткий");
      return;
    }
    startTransition(async () => {
      const r = await resetUserPasswordAction({ id: user.id, password });
      if (!r.ok) {
        toast.error("Не удалось", { description: r.error });
        return;
      }
      toast.success("Пароль обновлён, все сессии пользователя сброшены");
      router.refresh();
    });
  };

  return (
    <tr className={`border-t border-line ${user.isActive ? "" : "opacity-55"}`}>
      <td className="px-4 py-3 font-medium">
        {user.fullName}
        {isSelf && <span className="ml-2 text-[9px] uppercase text-flame">это вы</span>}
      </td>
      <td className="px-4 py-3 font-mono-pro text-xs">{user.email}</td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          disabled={pending || isSelf}
          onChange={(e) => onRole(e.target.value as (typeof ROLES)[number])}
          className="h-8 px-2 rounded-md border border-line bg-white text-xs focus:outline-none focus:border-flame disabled:opacity-60"
          title={isSelf ? "Свою роль изменить нельзя" : ""}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        {user.isActive ? (
          <span className="inline-flex px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-700">
            активен
          </span>
        ) : (
          <span className="inline-flex px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-zinc-500/10 text-zinc-600">
            отключён
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-ink/55">
        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("ru-RU") : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <IconBtn onClick={onResetPassword} disabled={pending} title="Сбросить пароль">
            <KeyRound className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn
            onClick={onToggleActive}
            disabled={pending || isSelf}
            title={isSelf ? "Себя деактивировать нельзя" : user.isActive ? "Деактивировать" : "Активировать"}
          >
            {user.isActive ? (
              <ShieldOff className="h-3.5 w-3.5 text-red-600" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            )}
          </IconBtn>
          {pending && <Loader2 className="h-3 w-3 animate-spin text-ink/40 ml-1" />}
        </div>
      </td>
    </tr>
  );
}

function IconBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-line hover:bg-surface transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
