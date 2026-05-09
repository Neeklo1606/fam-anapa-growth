import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { FORM_DIRECTIONS } from "@/content/site";
import { Link } from "@tanstack/react-router";

type FormState = {
  direction: string;
  childName: string;
  birthDate: string;
  parentName: string;
  email: string;
  phone: string;
  telegram: string;
  comment: string;
};

const initial: FormState = {
  direction: FORM_DIRECTIONS[0],
  childName: "",
  birthDate: "",
  parentName: "",
  email: "",
  phone: "",
  telegram: "",
  comment: "",
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
    if (!data.childName.trim()) e.childName = "Укажите ФИО ребёнка";
    if (!data.parentName.trim()) e.parentName = "Укажите ФИО родителя";
    if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 10)
      e.phone = "Укажите контактный телефон";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) e.email = "Проверьте email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Stub submission — replace with real endpoint when backend is ready.
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
        <h3 className="mt-5 font-display text-2xl text-white">Спасибо, {data.parentName.split(" ")[0] || "заявка получена"}!</h3>
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

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="ФИО ребёнка *" error={errors.childName}>
          <input
            value={data.childName}
            onChange={(e) => update("childName", e.target.value)}
            className={inputCls(!!errors.childName)}
            placeholder="Иванов Иван"
          />
        </Field>
        <Field label="Дата рождения">
          <input
            type="date"
            value={data.birthDate}
            onChange={(e) => update("birthDate", e.target.value)}
            className={inputCls(false)}
          />
        </Field>
      </div>

      <Field label="ФИО родителя *" error={errors.parentName}>
        <input
          value={data.parentName}
          onChange={(e) => update("parentName", e.target.value)}
          className={inputCls(!!errors.parentName)}
          placeholder="Иванова Анна"
        />
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

      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center gap-2 h-12 rounded-full bg-flame text-white text-[12px] font-semibold uppercase tracking-[0.18em] shadow-flame hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60"
      >
        {loading ? "Отправляем…" : (
          <>
            Отправить заявку
            <Send className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-[11px] text-white/45 leading-relaxed text-center">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <Link to="/legal/consent" className="underline decoration-white/30 hover:text-flame transition">
          политикой обработки персональных данных
        </Link>
        .
      </p>
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
