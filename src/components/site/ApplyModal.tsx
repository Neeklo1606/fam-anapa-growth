import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { JoinFlow } from "./JoinFlow";

type Ctx = { open: () => void; close: () => void };
const ApplyCtx = createContext<Ctx>({ open: () => {}, close: () => {} });

export function useApply() {
  return useContext(ApplyCtx);
}

export function ApplyProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  return (
    <ApplyCtx.Provider value={{ open, close }}>
      {children}
      <AnimatePresence>{isOpen && <ApplyModal onClose={close} />}</AnimatePresence>
    </ApplyCtx.Provider>
  );
}

function ApplyModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-night/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative w-full sm:max-w-lg bg-night text-white sm:rounded-3xl rounded-t-3xl border border-white/10 overflow-hidden shadow-elevated max-h-[92svh] flex flex-col"
      >
        <div className="absolute inset-0 pitch-lines opacity-20 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-flame/25 blur-3xl rounded-full pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-5 sm:p-7 overflow-y-auto">
          <div className="sm:hidden mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-white/20" />
          <JoinFlow />
        </div>
      </motion.div>
    </motion.div>
  );
}


/* Reusable trigger button */
export function ApplyButton({
  children,
  className = "",
  variant = "primary",
}: {
  children?: ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
}) {
  const { open } = useApply();
  const base =
    "group relative inline-flex items-center justify-center gap-3 font-semibold uppercase tracking-[0.18em] transition-all duration-300 overflow-hidden";
  const styles =
    variant === "primary"
      ? "pl-6 pr-2 h-12 rounded-full bg-flame text-white text-[11px] shadow-flame hover:brightness-110 hover:shadow-[0_14px_40px_rgba(242,138,46,0.55)] active:scale-[0.98]"
      : "h-12 px-6 rounded-full border border-white/25 bg-white/5 backdrop-blur text-white text-[11px] hover:bg-white/10 hover:border-white/40 active:scale-[0.98]";

  return (
    <button onClick={open} className={`${base} ${styles} ${className}`}>
      <span className="relative z-10">{children ?? "Записать ребёнка"}</span>
      {variant === "primary" && (
        <span className="relative z-10 h-9 w-9 rounded-full bg-white/15 flex items-center justify-center overflow-hidden">
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-5" />
          <ArrowRight className="absolute h-4 w-4 -translate-x-5 transition-transform duration-300 group-hover:translate-x-0" />
        </span>
      )}
    </button>
  );
}
