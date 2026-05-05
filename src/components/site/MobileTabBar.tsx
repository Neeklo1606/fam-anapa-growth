import { Link } from "@tanstack/react-router";
import { Home, Mail, Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileTabBar() {
  const [open, setOpen] = useState(false);
  const item = "flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-white/55 py-2.5 flex-1 transition";
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
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="relative bg-night/90 backdrop-blur-xl border border-white/10 rounded-full shadow-elevated">
          <div className="flex items-stretch px-2">
            <Link to="/" className={item} activeProps={{ className: active }} activeOptions={{ exact: true }}>
              <Home className="h-5 w-5" /> Главная
            </Link>
            <Link to="/contacts" className={item} activeProps={{ className: active }}>
              <Mail className="h-5 w-5" /> Контакты
            </Link>
            <a href="tel:+79000000000" className="flex-1 flex flex-col items-center justify-end gap-1 pb-2.5">
              <span className="h-12 w-12 -mt-7 rounded-full bg-flame text-white flex items-center justify-center shadow-flame ring-4 ring-night">
                <Phone className="h-5 w-5" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white font-semibold">Позвонить</span>
            </a>
            <button onClick={() => setOpen(true)} className={item}>
              <Menu className="h-5 w-5" /> Меню
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
              <a href="tel:+79000000000" className="h-14 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-sm flex items-center justify-center">Позвонить</a>
              <a href="#cta" onClick={() => setOpen(false)} className="h-14 rounded-full border border-white/20 text-white font-semibold uppercase tracking-wider text-sm flex items-center justify-center">Записаться</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
