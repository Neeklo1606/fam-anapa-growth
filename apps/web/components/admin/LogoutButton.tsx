"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";

import { logoutAction } from "@/lib/auth-actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      disabled={pending}
      className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/70 hover:text-flame transition disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
      Выйти
    </button>
  );
}
