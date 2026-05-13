"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { loginAction } from "@/lib/auth-actions";

export function LoginForm({ next = "/admin" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginAction({ email, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(next);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-white/55 mb-1.5">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="h-12 w-full px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-flame transition"
        />
      </label>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-white/55 mb-1.5">
          Пароль
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="h-12 w-full px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-flame transition"
        />
      </label>
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-400/30 text-red-200 text-sm p-3">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-12 rounded-full bg-flame text-white text-[12px] font-semibold uppercase tracking-[0.2em] shadow-flame hover:brightness-105 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Вход…
          </>
        ) : (
          "Войти"
        )}
      </button>
    </form>
  );
}
