import { Link } from "@tanstack/react-router";
import { Home, Mail, Phone, Menu, X } from "lucide-react";
import { useState } from "react";

export function MobileTabBar() {
  const [open, setOpen] = useState(false);
  const item = "flex flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground py-2 flex-1";
  return (
    <>
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-background/95 backdrop-blur border border-border rounded-2xl shadow-elevated">
        <div className="flex items-stretch">
          <Link to="/" className={item} activeProps={{ className: item + " text-brand" }} activeOptions={{ exact: true }}>
            <Home className="h-5 w-5" /> Главная
          </Link>
          <Link to="/contacts" className={item} activeProps={{ className: item + " text-brand" }}>
            <Mail className="h-5 w-5" /> Контакты
          </Link>
          <a href="tel:+79000000000" className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2">
            <span className="h-10 w-10 -mt-6 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-elevated">
              <Phone className="h-5 w-5" />
            </span>
            <span className="text-[10px] text-brand-deep font-medium">Позвонить</span>
          </a>
          <button onClick={() => setOpen(true)} className={item}>
            <Menu className="h-5 w-5" /> Меню
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-brand-deep/95 backdrop-blur-md text-white flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-end">
            <button onClick={() => setOpen(false)} className="p-2 rounded-full bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-12 flex flex-col gap-6">
            <Link to="/" onClick={() => setOpen(false)} className="text-3xl font-display font-bold">Главная</Link>
            <Link to="/contacts" onClick={() => setOpen(false)} className="text-3xl font-display font-bold">Контакты</Link>
            <a href="tel:+79000000000" className="text-3xl font-display font-bold opacity-80">Позвонить</a>
          </div>
          <div className="mt-auto text-sm opacity-60">Анапа · FAM</div>
        </div>
      )}
    </>
  );
}
