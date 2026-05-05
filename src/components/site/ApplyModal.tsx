import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Trophy } from "lucide-react";
import { toast } from "sonner";

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
  const [data, setData] = useState({ parent: "", phone: "", age: "", comment: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k: keyof typeof data, v: string) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.parent.trim() || !data.phone.trim()) {
      toast.error("Заполните имя и телефон");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setDone(true);
  };

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
        className="relative w-full sm:max-w-md bg-night text-white sm:rounded-3xl rounded-t-3xl border border-white/10 overflow-hidden shadow-elevated max-h-[92svh] flex flex-col"
      >
        {/* Decorative pitch */}
        <div className="absolute inset-0 pitch-lines opacity-20 pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-flame/25 blur-3xl rounded-full pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-6 sm:p-8 overflow-y-auto">
          {/* drag handle */}
          <div className="sm:hidden mx-auto -mt-2 mb-4 h-1 w-10 rounded-full bg-white/20" />

          {!done ? (
            <>
              <div className="text-[10px] uppercase tracking-[0.22em] text-flame font-semibold">
                Первый шаг в команду
              </div>
              <h3 className="mt-2 font-display text-3xl sm:text-4xl tracking-tight">
                Записать ребёнка
              </h3>
              <p className="mt-2 text-white/60 text-sm">
                Оставьте заявку — мы свяжемся, чтобы подобрать подходящую группу.
              </p>

              <form onSubmit={submit} className="mt-6 grid gap-3">
                <Field
                  label="Имя родителя"
                  value={data.parent}
                  onChange={(v) => update("parent", v)}
                  placeholder="Имя"
                />
                <Field
                  label="Телефон"
                  type="tel"
                  value={data.phone}
                  onChange={(v) => update("phone", v)}
                  placeholder="+7 ___ ___ __ __"
                />
                <Field
                  label="Возраст ребёнка"
                  value={data.age}
                  onChange={(v) => update("age", v)}
                  placeholder="Например, 8 лет"
                />
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-semibold">
                    Комментарий
                  </label>
                  <textarea
                    value={data.comment}
                    onChange={(e) => update("comment", e.target.value)}
                    rows={2}
                    placeholder="По желанию"
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/35 text-sm focus:outline-none focus:border-flame transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex items-center justify-between gap-3 pl-5 pr-2 h-13 py-2 rounded-full bg-flame text-white font-semibold uppercase tracking-wider text-sm shadow-flame hover:brightness-110 transition disabled:opacity-60"
                >
                  {loading ? "Отправляем…" : "Отправить заявку"}
                  <span className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
                <p className="text-[11px] text-white/40 text-center">
                  Нажимая, вы соглашаетесь на обработку персональных данных
                </p>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="mx-auto h-20 w-20 rounded-full bg-flame text-white flex items-center justify-center shadow-flame"
              >
                <Trophy className="h-9 w-9" />
              </motion.div>
              <h3 className="mt-6 font-display text-3xl tracking-tight">Спасибо!</h3>
              <p className="mt-3 text-white/65 max-w-sm mx-auto text-sm">
                Мы получили заявку и свяжемся с вами, чтобы подобрать группу.
              </p>
              <button
                onClick={onClose}
                className="mt-7 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-night font-semibold uppercase tracking-wider text-sm hover:bg-flame hover:text-white transition"
              >
                <Check className="h-4 w-4" /> Готово
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-semibold">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/35 text-sm focus:outline-none focus:border-flame transition"
      />
    </div>
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
    "group inline-flex items-center justify-center gap-3 font-semibold uppercase tracking-wider transition";
  const styles =
    variant === "primary"
      ? "pl-6 pr-2 h-13 py-2 rounded-full bg-flame text-white text-sm shadow-flame hover:brightness-110"
      : "h-12 px-6 rounded-full border border-white/25 bg-white/5 backdrop-blur text-white text-sm hover:bg-white/10";

  return (
    <button onClick={open} className={`${base} ${styles} ${className}`}>
      {children ?? "Записать ребёнка"}
      {variant === "primary" && (
        <span className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition">
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
