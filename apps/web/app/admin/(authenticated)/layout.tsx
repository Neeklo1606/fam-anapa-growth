import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/admin/LogoutButton";
import { fetchMe } from "@/lib/admin-api";
import type { UserRole } from "@fam/types";

type NavItem = {
  href: string;
  label: string;
  roles?: UserRole[];
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/media", label: "Медиа" },
  { href: "/admin/settings/home", label: "Главная страница", roles: ["ADMIN", "EDITOR", "MANAGER"] },
  { href: "/admin/settings", label: "Настройки сайта" },
  { href: "/admin/users", label: "Пользователи", roles: ["ADMIN"] },
];

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await fetchMe();
  if (!user) {
    redirect("/admin/login?reason=session_expired");
  }

  const links = NAV.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-surface text-ink flex">
      <aside className="hidden md:flex md:w-56 shrink-0 bg-night text-white flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            FAM Admin
          </div>
          <div className="mt-1 font-display text-lg tracking-tight">Академия Морева</div>
        </div>
        <nav className="flex-1 px-2 py-5 space-y-0.5 text-sm">
          {links.map((item) => (
            <SidebarLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/admin/me" className="block text-xs text-white/70 hover:text-flame transition">
            {user.fullName}
          </Link>
          <div className="text-[10px] uppercase tracking-wider text-white/40">{user.role}</div>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-night text-white border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="font-display tracking-tight">FAM Admin</div>
            <LogoutButton />
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-[11px]">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 text-white/75 hover:bg-white/10 hover:text-white transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
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
