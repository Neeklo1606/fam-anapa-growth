import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarIcon, CheckCircle2, Send } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { FORM_DIRECTIONS } from "@/content/site";
import { Link } from "@tanstack/react-router";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Experience = "none" | "yes";

type FormState = {
  direction: string;
  experience: Experience;
  childName: string;
  birthDate?: Date;
  parentName: string;
  email: string;
  phone: string;
  telegram: string;
  comment: string;
  consent: boolean;
};

const initial: FormState = {
  direction: FORM_DIRECTIONS[0],
  experience: "none",
  childName: "",
  birthDate: undefined,
  parentName: "",
  email: "",
  phone: "",
  telegram: "",
  comment: "",
  consent: false,
};

export function ApplicationForm({ onClose }: { onClose?: () => void }) {
  const [data, setData] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!data.parentName.trim()) e.parentName = "Укажите ФИО опекуна";
    if (!data.childName.trim()) e.childName = "Укажите ФИО ученика";
    if (!data.birthDate) e.birthDate = "Выберите дату рождения";
    if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 10)
      e.phone = "Укажите контактный телефон";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) e.email = "Проверьте email";
    if (!data.consent) e.consent = "Необходимо согласие на обработку данных";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setDone(true);
      toast.success("Заявка отправлена", {
        description: "Свяжемся с вами в течение дня.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="mx-auto h-16 w-16 rounded-full bg-flame text-white flex items-center justify-center shadow-flame">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-5 font-display text-2xl text-white">
          Спасибо, {data.parentName.split(" ")[0] || "заявка получена"}!
        </h3>
        <p className="mt-2 text-white/65 text-sm max-w-sm mx-auto">
          Мы получили заявку и свяжемся с вами в течение дня, чтобы подобрать подходящую группу.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full bg-white/10 text-white text-xs uppercase tracking-[0.2em] hover:bg-white/15 transition"
          >
            Закрыть
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3" noValidate>
      <Field label="Направление">
        <select
          value={data.direction}
          onChange={(e) => update("direction", e.target.value)}
          className={selectCls}
        >
          {FORM_DIRECTIONS.map((d) => (
            <option key={d} value={d} className="bg-night text-white">
              {d}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Опыт занятий в спортивных школах">
        <div
          role="radiogroup"
          aria-label="Опыт занятий"
          className="relative grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10"
        >
          <motion.div
            aria-hidden
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-flame shadow-flame"
            animate={{ left: data.experience === "none" ? 4 : "calc(50% + 0px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
          {([
            { v: "none", label: "Нет опыта" },
            { v: "yes", label: "Есть опыт" },
          ] as const).map((opt) => {
            const active = data.experience === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update("experience", opt.v)}
                className={cn(
                  "relative z-10 h-10 rounded-lg text-sm font-medium transition-colors",
                  active ? "text-white" : "text-white/65 hover:text-white"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="ФИО опекуна *" error={errors.parentName}>
        <input
          value={data.parentName}
          onChange={(e) => update("parentName", e.target.value)}
          className={inputCls(!!errors.parentName)}
          placeholder="Иванова Анна Сергеевна"
        />
      </Field>

      <Field label="ФИО ученика *" error={errors.childName}>
        <input
          value={data.childName}
          onChange={(e) => update("childName", e.target.value)}
          className={inputCls(!!errors.childName)}
          placeholder="Иванов Иван Иванович"
        />
      </Field>

      <Field label="Дата рождения *" error={errors.birthDate}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                inputCls(!!errors.birthDate),
                "flex items-center justify-between text-left",
                !data.birthDate && "text-white/40"
              )}
            >
              <span>
                {data.birthDate
                  ? format(data.birthDate, "d MMMM yyyy", { locale: ru })
                  : "Выберите дату"}
              </span>
              <CalendarIcon className="h-4 w-4 opacity-60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.birthDate}
              onSelect={(d) => update("birthDate", d)}
              captionLayout="dropdown"
              fromYear={2005}
              toYear={new Date().getFullYear()}
              defaultMonth={data.birthDate ?? new Date(2015, 0)}
              disabled={(date) => date > new Date() || date < new Date("2005-01-01")}
              initialFocus
              locale={ru}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </Field>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Телефон *" error={errors.phone}>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputCls(!!errors.phone)}
            placeholder="+7 (___) ___-__-__"
            inputMode="tel"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputCls(!!errors.email)}
            placeholder="you@example.com"
            inputMode="email"
          />
        </Field>
      </div>

      <Field label="Telegram">
        <input
          value={data.telegram}
          onChange={(e) => update("telegram", e.target.value)}
          className={inputCls(false)}
          placeholder="@username"
        />
      </Field>

      <Field label="Комментарий">
        <textarea
          value={data.comment}
          onChange={(e) => update("comment", e.target.value)}
          rows={3}
          className={`${inputCls(false)} h-auto py-3 resize-none`}
          placeholder="Дополнительные пожелания"
        />
      </Field>

      <label className="flex items-start gap-3 mt-1 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={data.consent}
          onChange={(e) => update("consent", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-flame shrink-0"
        />
        <span className="text-[12px] leading-relaxed text-white/70">
          Даю{" "}
          <Link
            to="/legal/consent"
            target="_blank"
            className="text-white underline decoration-white/40 hover:text-flame transition"
          >
            согласие на обработку персональных данных
          </Link>{" "}
          и принимаю{" "}
          <Link
            to="/legal/privacy"
            target="_blank"
            className="text-white underline decoration-white/40 hover:text-flame transition"
          >
            политику обработки персональных данных
          </Link>
          .
        </span>
      </label>
      {errors.consent && (
        <span className="text-[11px] text-red-300 -mt-1">{errors.consent}</span>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 h-12 rounded-full bg-flame text-white text-[12px] font-semibold uppercase tracking-[0.18em] shadow-flame hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60"
      >
        {loading ? "Отправляем…" : (
          <>
            Отправить заявку
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

const inputCls = (err: boolean) =>
  `h-12 w-full px-4 rounded-xl bg-white/5 border text-white placeholder:text-white/35 focus:outline-none focus:border-flame focus:bg-white/[0.07] transition ${
    err ? "border-red-400/70" : "border-white/10"
  }`;

const selectCls =
  "h-12 w-full px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-flame transition appearance-none";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-white/55 mb-1.5 font-medium">
        {label}
      </span>
      {children}
      {error && <span className="block mt-1 text-[11px] text-red-300">{error}</span>}
    </label>
  );
}
