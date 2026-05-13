import { redirect } from "next/navigation";

import { fetchMe, fetchUsers } from "@/lib/admin-api";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UsersTable } from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const me = await fetchMe();
  if (!me || me.role !== "ADMIN") redirect("/admin");

  const users = await fetchUsers();

  return (
    <div className="space-y-8 max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            Операторы
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Пользователи</h1>
          <p className="mt-1 text-sm text-ink/55">Всего: {users.length}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg tracking-tight mb-4">Создать пользователя</h2>
        <CreateUserForm />
      </section>

      <section className="rounded-2xl border border-line bg-white overflow-hidden">
        <UsersTable users={users} currentUserId={me.id} />
      </section>
    </div>
  );
}
