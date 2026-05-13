"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { ApplicationForm } from "./ApplicationForm";

function BallIcon({ className = "" }: { className?: string }) {
  return <img src="/img/ball.svg" alt="" className={className} aria-hidden="true" />;
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
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  // Safety: always reset overflow on unmount
  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  return (
    <ApplyCtx.Provider value={{ open, close }}>
      {children}
      <AnimatePresence>{isOpen && <ApplyDialog onClose={close} />}</AnimatePresence>
    </ApplyCtx.Provider>
  );
}

function ApplyDialog({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Запись в академию"
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
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="relative w-full sm:max-w-lg bg-night text-white sm:rounded-3xl rounded-t-3xl border border-white/10 overflow-hidden shadow-elevated max-h-[94svh] flex flex-col"
      >
        <div className="absolute inset-0 pitch-lines opacity-15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-flame/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-flame font-semibold">
              FAM · Запись
            </div>
            <h3 className="mt-1 font-display text-xl tracking-wide">Записать ребёнка</h3>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative px-5 pb-6 pt-2 overflow-y-auto"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
        >
          <div className="sm:hidden mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-white/20" />
          <ApplicationForm onClose={onClose} />
        </div>
      </motion.div>
    </motion.div>
  );
}

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
      ? "pl-6 pr-2 h-12 rounded-full bg-flame text-white text-[11px] shadow-flame hover:brightness-[1.05] active:scale-[0.98]"
      : "h-12 px-6 rounded-full border border-white/25 bg-white/5 backdrop-blur text-white text-[11px] hover:bg-white/10 hover:border-white/40 active:scale-[0.98]";

  return (
    <button onClick={open} className={`${base} ${styles} ${className}`}>
      <span className="relative z-10">{children ?? "Записать ребёнка"}</span>
      {variant === "primary" && (
        <span className="relative z-10 h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
          <BallIcon className="h-[18px] w-[18px] invert brightness-200 transition-transform duration-500 ease-out group-hover:rotate-[140deg] group-active:rotate-[200deg]" />
        </span>
      )}
    </button>
  );
}
