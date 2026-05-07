import { Link } from "@tanstack/react-router";
import { Home, Mail, Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileTabBar() {
  const [open, setOpen] = useState(false);
  const item = "flex flex-col items-center justify-center gap-0.5 text-[9px] uppercase tracking-wider text-white/60 py-2 flex-1 transition";
  const active = item + " text-white";

  const menuItems = [
    { label: "О нас", href: "/#about" },
    { label: "Тренировки", href: "/#training" },
    { label: "Тренеры", href: "/#coaches" },
    { label: "Галерея", href: "/#gallery" },
    { label: "Расписание", href: "/#schedule" },
    { label: "Контакты", href: "/contacts" },
  ];

  return (
    <>
      <nav
        className="lg:hidden fixed left-3 right-3 z-40"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
      >
        <div className="relative bg-night/85 backdrop-blur-xl border border-white/10 rounded-full shadow-elevated">
          <div className="flex items-stretch px-1.5">
            <Link to="/" className={item} activeProps={{ className: active }} activeOptions={{ exact: true }}>
              <Home className="h-[18px] w-[18px]" /> Главная
            </Link>
            <Link to="/contacts" className={item} activeProps={{ className: active }}>
              <Mail className="h-[18px] w-[18px]" /> Контакты
            </Link>
            <a href="tel:+79180000000" className="flex-1 flex flex-col items-center justify-end gap-0.5 pb-2">
              <span className="h-11 w-11 -mt-6 rounded-full bg-flame text-white flex items-center justify-center shadow-flame ring-4 ring-night">
                <Phone className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white font-semibold">Звонок</span>
            </a>
            <button onClick={() => setOpen(true)} className={item}>
              <Menu className="h-[18px] w-[18px]" /> Меню
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-night text-white flex flex-col"
          >
            <div className="absolute inset-0 pitch-lines opacity-40" />
            <div className="absolute inset-x-0 -top-32 h-96 bg-gradient-pitch" />
            <div className="relative flex justify-between items-center p-5">
              <div className="font-display text-2xl">FAM</div>
              <button onClick={() => setOpen(false)} className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative mt-6 flex flex-col gap-1 px-5">
              {menuItems.map((m, i) => (
                <motion.a
                  key={m.label}
                  href={m.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  className="group flex items-center justify-between py-5 border-b border-white/10"
                >
                  <span className="font-display text-4xl tracking-wide">{m.label}</span>
                  <span className="text-flame opacity-0 group-hover:opacity-100 transition">→</span>
                </motion.a>
              ))}
            </div>
            <div className="relative mt-auto p-5 grid grid-cols-2 gap-3">
              <a href="tel:+79180000000" className="h-14 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-sm flex items-center justify-center shadow-flame">Позвонить</a>
              <a href="https://wa.me/79180000000" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="h-14 rounded-full border border-white/20 text-white font-semibold uppercase tracking-wider text-sm flex items-center justify-center">WhatsApp</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
