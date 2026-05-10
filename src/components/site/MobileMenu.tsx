import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NAV_LINKS, CONTACTS } from "@/content/site";
import { useApply } from "@/components/site/ApplyModal";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { open: openApply } = useApply();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Safety: always reset overflow on unmount
  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        className="h-11 w-11 rounded-full border border-white/15 bg-white/5 backdrop-blur flex items-center justify-center text-white hover:bg-white/10 transition"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]"
          >
            <div onClick={() => setOpen(false)} className="absolute inset-0 bg-night/80 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-[88vw] max-w-[420px] bg-night text-white border-l border-white/10 flex flex-col overflow-hidden"
            >
              <div className="absolute inset-0 pitch-lines opacity-20 pointer-events-none" />
              <div className="absolute -top-32 -right-32 h-80 w-80 bg-flame/20 blur-3xl rounded-full pointer-events-none" />

              <div className="relative flex items-center justify-between p-5">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/55 font-mono-pro">
                  Меню
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="relative flex-1 overflow-y-auto px-5 mt-2">
                <ul className="flex flex-col">
                  {NAV_LINKS.map((l, i) => (
                    <motion.li
                      key={l.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                      className="border-b border-white/10"
                    >
                      <a
                        href={`/${l.href}`}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between py-4 font-display text-3xl tracking-wide hover:text-flame transition"
                      >
                        <span>{l.label}</span>
                        <span className="text-flame opacity-0 group-hover:opacity-100 transition">→</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="relative p-5 space-y-3">
                <button
                  onClick={() => {
                    setOpen(false);
                    openApply();
                  }}
                  className="w-full h-12 rounded-full bg-flame text-white text-[12px] font-semibold uppercase tracking-[0.2em] shadow-flame hover:brightness-105 transition"
                >
                  Записать ребёнка
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${CONTACTS.phone}`}
                    className="h-11 rounded-full border border-white/15 bg-white/5 text-white text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center justify-center hover:bg-white/10 transition"
                  >
                    Позвонить
                  </a>
                  <a
                    href={CONTACTS.max}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-full border border-white/15 bg-white/5 text-white text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center justify-center hover:bg-white/10 transition"
                  >
                    MAX
                  </a>
                </div>
                <div className="text-center text-[10px] uppercase tracking-[0.25em] text-white/40 pt-1">
                  FAM · Анапа
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
