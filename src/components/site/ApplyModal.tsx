import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { JoinFlow } from "./JoinFlow";

function BallIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 4.5l3.05 2.25-1.15 3.6-3.8 0-1.15-3.6z" />
      <path d="M13.9 10.35l3.35 2.45-1.25 3.85-3.6 0" />
      <path d="M10.1 10.35L6.75 12.8l1.25 3.85 3.6 0" />
      <path d="M12 4.5V2.6M3.4 9.55l-1.7-.45M20.6 9.55l1.7-.45M8 20.65l-.7 1.6M16 20.65l.7 1.6" />
    </svg>
  );
}

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
    "group relative inline-flex items-center justify-center gap-3 font-semibold uppercase tracking-[0.18em] transition-all duration-300";
  const styles =
    variant === "primary"
      ? "pl-6 pr-2 h-12 rounded-full bg-flame text-white text-[11px] shadow-flame hover:brightness-[1.05] hover:shadow-[0_10px_30px_rgba(242,138,46,0.32)] active:scale-[0.98]"
      : "h-12 px-6 rounded-full border border-white/25 bg-white/5 backdrop-blur text-white text-[11px] hover:bg-white/10 hover:border-white/40 active:scale-[0.98]";

  return (
    <button onClick={open} className={`${base} ${styles} ${className}`}>
      <span className="relative z-10">{children ?? "Записать ребёнка"}</span>
      {variant === "primary" && (
        <span className="relative z-10 h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
          <BallIcon className="h-[18px] w-[18px] text-white transition-transform duration-500 ease-out group-hover:rotate-[140deg] group-active:rotate-[200deg]" />
        </span>
      )}
    </button>
  );
}
