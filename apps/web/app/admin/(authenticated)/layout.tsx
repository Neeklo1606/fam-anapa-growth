import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/admin/LogoutButton";
import { fetchMe } from "@/lib/admin-api";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchMe();
  if (!user) redirect("/admin/login?next=/admin");

  return (
    <div className="min-h-screen bg-surface text-ink flex">
      <aside className="hidden md:flex md:w-64 shrink-0 bg-night text-white flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            FAM Admin
          </div>
          <div className="mt-1 font-display text-xl tracking-tight">Академия Морева</div>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 text-sm">
          <SidebarLink href="/admin" label="Дашборд" />
          <SidebarLink href="/admin/leads" label="Заявки (CRM)" />
          <div className="pt-4 pb-1 px-3 text-[9px] uppercase tracking-[0.25em] text-white/30">
            Сайт
          </div>
          <SidebarLink href="/admin/coaches" label="Тренеры" />
          <SidebarLink href="/admin/gallery" label="Галерея" />
          <SidebarLink href="/admin/videos" label="Видео" />
          <SidebarLink href="/admin/media" label="Медиа" />
          <SidebarLink href="/admin/knowledge" label="База знаний (RAG)" />
          <SidebarLink href="/admin/settings" label="Настройки сайта" />
          <SidebarLink href="/admin/settings/notifications" label="Уведомления заявок" />
          {user.role === "ADMIN" && (
            <>
              <div className="pt-4 pb-1 px-3 text-[9px] uppercase tracking-[0.25em] text-white/30">
                Система
              </div>
              <SidebarLink href="/admin/users" label="Пользователи" />
            </>
          )}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/admin/me" className="block text-xs text-white/70 hover:text-flame transition">
            {user.fullName}
          </Link>
          <div className="text-[10px] uppercase tracking-wider text-white/40">{user.role}</div>
          <div className="mt-3"><LogoutButton /></div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between bg-night text-white px-4 py-3 border-b border-white/10">
          <div className="font-display tracking-tight">FAM Admin</div>
          <LogoutButton />
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition"
    >
      {label}
    </Link>
  );
}
