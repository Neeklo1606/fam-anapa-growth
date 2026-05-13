import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Вход в админку",
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <LoginPageInner searchParams={searchParams} />;
}

async function LoginPageInner({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-night text-white px-4 relative overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-25" />
      <div className="absolute -top-32 -right-32 h-96 w-96 bg-flame/15 blur-3xl rounded-full" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-night/80 backdrop-blur-2xl p-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
          FAM Admin
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Вход в админку</h1>
        <p className="mt-2 text-sm text-white/55">Только для сотрудников Академии</p>
        <div className="mt-7">
          <LoginForm next={sp.next ?? "/admin"} />
        </div>
      </div>
    </div>
  );
}
