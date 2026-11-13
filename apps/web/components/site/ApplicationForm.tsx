"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { m } from "framer-motion";
import { CheckCircle2, ChevronDown, Send } from "lucide-react";

import { trackSiteEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { submitLead, LeadSubmitError } from "@/lib/api";

type Experience = "none" | "yes";

type FormState = {
  experience: Experience;
  childName: string;
  /** YYYY-MM-DD (без часового пояса) или "" */
  birthDate: string;
  parentName: string;
  phone: string;
  comment: string;
  consent: boolean;
};

const initial: FormState = {
  experience: "none",
  childName: "",
  birthDate: "",
  parentName: "",
  phone: "",
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
    if (data.parentName.trim().length < 2) e.parentName = "Укажите ФИО родителя (минимум 2 буквы)";
    if (data.childName.trim().length < 2) e.childName = "Укажите ФИО ребёнка (минимум 2 буквы)";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate)) e.birthDate = "Укажите день, месяц и год рождения";
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length !== 11 || !/^[78]/.test(digits))
      e.phone = "Введите телефон в формате +7 (___) ___-__-__";
    if (!data.consent) e.consent = "Необходимо согласие на обработку данных";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitLead({
        parentName: data.parentName.trim(),
        childName: data.childName.trim(),
        // Строка YYYY-MM-DD: без сдвига на день из-за часового пояса (toISOString от полуночи МСК = вчера в UTC).
        childBirthDate: data.birthDate,
        phone: data.phone,
        experienceLevel: data.experience === "yes" ? "YES" : "NONE",
        comment: data.comment || undefined,
        privacyAccepted: data.consent,
        source: "website",
        landingPage: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      setDone(true);
      trackSiteEvent({
        type: "FORM_SUBMIT",
        page: typeof window !== "undefined" ? window.location.pathname : "/",
        section: "apply_form",
      });
      toast.success("Заявка отправлена", { description: "Свяжемся с вами в течение дня." });
    } catch (err) {
      if (err instanceof LeadSubmitError) {
        toast.error("Не удалось отправить заявку", {
          description: humanizeLeadError(err.details[0] ?? err.message),
        });
      } else {
        toast.error("Сервер недоступен", {
          description: "Попробуйте позвонить или написать в WhatsApp.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <m.div
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
      </m.div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3.5" noValidate>
      <Field label="Опыт занятий футболом">
        <div
          role="radiogroup"
          aria-label="Опыт занятий футболом"
          className="relative grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10"
        >
          <m.div
            aria-hidden
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-flame shadow-flame"
            animate={{ left: data.experience === "none" ? 4 : "calc(50% + 0px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
          {(
            [
              { v: "none", label: "Нет опыта" },
              { v: "yes", label: "Есть опыт" },
            ] as const
          ).map((opt) => {
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
                  active ? "text-night font-semibold" : "text-white/65 hover:text-white",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="ФИО опекуна / родителя *" error={errors.parentName}>
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

      <Field label="Дата рождения *" error={errors.birthDate} group>
        <BirthDatePicker
          value={data.birthDate}
          hasError={Boolean(errors.birthDate)}
          onChange={(d) => update("birthDate", d)}
        />
      </Field>

      <Field label="Телефон *" error={errors.phone}>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => update("phone", formatRuPhone(e.target.value))}
          onFocus={(e) => {
            if (!e.target.value) update("phone", "+7 ");
          }}
          onBlur={(e) => {
            if (e.target.value.replace(/\D/g, "").length <= 1) update("phone", "");
          }}
          className={inputCls(!!errors.phone)}
          placeholder="+7 (___) ___-__-__"
          inputMode="tel"
          maxLength={18}
          autoComplete="tel"
        />
      </Field>

      <Field label="Комментарий / дополнительные пожелания">
        <textarea
          value={data.comment}
          onChange={(e) => update("comment", e.target.value)}
          rows={3}
          className={`${inputCls(false)} h-auto py-3 resize-none`}
          placeholder="Например, удобное время для звонка"
        />
      </Field>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={data.consent}
          onChange={(e) => update("consent", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-flame shrink-0"
        />
        <span className="text-[12px] leading-relaxed text-white/70">
          Я согласен на{" "}
          <Link href="/legal/consent" target="_blank" className="underline underline-offset-2 hover:text-white">
            обработку персональных данных
          </Link>{" "}
          и подтверждаю, что являюсь родителем / законным представителем ребёнка.
        </span>
      </label>
      {errors.consent && <span className="text-[11px] text-red-300 -mt-2">{errors.consent}</span>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 h-12 rounded-full bg-flame text-night text-[12px] font-semibold uppercase tracking-[0.18em] shadow-flame hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60"
      >
        {loading ? (
          "Отправляем…"
        ) : (
          <>
            Отправить заявку
            <Send className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-[11px] leading-snug text-white/65 text-center px-1">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <Link
          href="/legal/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-white hover:text-flame transition"
        >
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

const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/** Ошибки валидации API (class-validator, англ.) → понятный русский текст. */
function humanizeLeadError(msg: string): string {
  if (/parentName/.test(msg)) return "ФИО родителя: минимум 2 буквы";
  if (/childName/.test(msg)) return "ФИО ребёнка: минимум 2 буквы";
  if (/phone/.test(msg)) return "Проверьте номер телефона: +7 (___) ___-__-__";
  if (/childBirthDate/.test(msg)) return "Проверьте дату рождения";
  if (/privacyAccepted/.test(msg)) return "Нужно согласие на обработку данных";
  if (/too many|throttl/i.test(msg)) return "Слишком много попыток. Подождите минуту и попробуйте снова.";
  return /[а-яё]/i.test(msg) ? msg : "Проверьте заполнение полей и попробуйте снова.";
}

/**
 * Дата рождения тремя нативными списками: на телефоне открывается системное «колесо»
 * (удобнее календаря для дат 5–15 лет назад). Значение — строка YYYY-MM-DD.
 */
function BirthDatePicker({
  value,
  hasError,
  onChange,
}: {
  value: string;
  hasError: boolean;
  onChange: (v: string) => void;
}) {
  const nowYear = new Date().getFullYear();
  const years = Array.from({ length: 18 }, (_, i) => nowYear - 2 - i); // дети от 2 до 19 лет
  const parts = value ? value.split("-") : [];
  const [day, setDay] = useState(parts[2] ? String(Number(parts[2])) : "");
  const [month, setMonth] = useState(parts[1] ? String(Number(parts[1])) : "");
  const [year, setYear] = useState(parts[0] ?? "");

  // 2016 — високосный: пока год не выбран, 29 февраля доступно.
  const daysInMonth = (yy: string, mm: string) =>
    mm ? new Date(Number(yy) || 2016, Number(mm), 0).getDate() : 31;

  const apply = (dd: string, mm: string, yy: string) => {
    const max = daysInMonth(yy, mm);
    const dFixed = dd && Number(dd) > max ? String(max) : dd;
    setDay(dFixed);
    setMonth(mm);
    setYear(yy);
    onChange(
      dFixed && mm && yy ? `${yy}-${mm.padStart(2, "0")}-${dFixed.padStart(2, "0")}` : "",
    );
  };

  const selCls = (empty: boolean) =>
    cn(inputCls(hasError), "appearance-none pr-8 cursor-pointer", empty && "text-white/40");
  const chevron = (
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
  );

  return (
    <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-2" role="group" aria-label="Дата рождения">
      <span className="relative">
        <select
          aria-label="День"
          className={selCls(!day)}
          value={day}
          onChange={(e) => apply(e.target.value, month, year)}
        >
          <option value="" disabled>День</option>
          {Array.from({ length: daysInMonth(year, month) }, (_, i) => String(i + 1)).map((d) => (
            <option key={d} value={d} className="text-ink">{d}</option>
          ))}
        </select>
        {chevron}
      </span>
      <span className="relative">
        <select
          aria-label="Месяц"
          className={selCls(!month)}
          value={month}
          onChange={(e) => apply(day, e.target.value, year)}
        >
          <option value="" disabled>Месяц</option>
          {MONTHS_RU.map((name, i) => (
            <option key={name} value={String(i + 1)} className="text-ink">{name}</option>
          ))}
        </select>
        {chevron}
      </span>
      <span className="relative">
        <select
          aria-label="Год"
          className={selCls(!year)}
          value={year}
          onChange={(e) => apply(day, month, e.target.value)}
        >
          <option value="" disabled>Год</option>
          {years.map((yy) => (
            <option key={yy} value={String(yy)} className="text-ink">{yy}</option>
          ))}
        </select>
        {chevron}
      </span>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  group = false,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  /** Несколько контролов внутри (дата рождения) — div вместо label. */
  group?: boolean;
}) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-white/55 mb-1.5 font-medium">
        {label}
      </span>
      {children}
      {error && <span className="block mt-1 text-[11px] text-red-300">{error}</span>}
    </Tag>
  );
}

function formatRuPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;
  digits = digits.slice(0, 11);
  const d = digits.slice(1);
  let out = "+7";
  if (d.length === 0) return `${out} `;
  out += " (" + d.slice(0, 3);
  if (d.length < 3) return out;
  out += ") " + d.slice(3, 6);
  if (d.length < 6) return out;
  out += "-" + d.slice(6, 8);
  if (d.length < 8) return out;
  out += "-" + d.slice(8, 10);
  return out;
}
