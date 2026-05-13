import { fetchMe } from "@/lib/admin-api";
import { ChangeOwnPasswordForm } from "@/components/admin/ChangeOwnPasswordForm";
import { redirect } from "next/navigation";

export default async function AdminProfilePage() {
  const me = await fetchMe();
  if (!me) redirect("/admin/login?next=/admin/me");

  return (
    <div className="space-y-8 max-w-xl">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
          Профиль
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-tight">{me.fullName}</h1>
        <p className="mt-1 text-sm text-ink/55">
          {me.email} · <span className="uppercase tracking-wider text-xs">{me.role}</span>
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg tracking-tight mb-3">Сменить пароль</h2>
        <p className="text-xs text-ink/55 mb-4">
          После смены пароля все ваши сессии будут сброшены, и потребуется войти заново.
        </p>
        <ChangeOwnPasswordForm />
      </section>
    </div>
  );
}
