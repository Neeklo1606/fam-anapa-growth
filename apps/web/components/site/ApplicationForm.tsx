"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { m } from "framer-motion";
import { CalendarIcon, CheckCircle2, Send } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trackSiteEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { submitLead, LeadSubmitError } from "@/lib/api";

type Experience = "none" | "yes";

type FormState = {
  experience: Experience;
  childName: string;
  birthDate?: Date;
  parentName: string;
  phone: string;
  comment: string;
  consent: boolean;
};

const initial: FormState = {
  experience: "none",
  childName: "",
  birthDate: undefined,
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
    if (!data.parentName.trim()) e.parentName = "Укажите ФИО опекуна";
    if (!data.childName.trim()) e.childName = "Укажите ФИО ученика";
    if (!data.birthDate) e.birthDate = "Выберите дату рождения";
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
        parentName: data.parentName,
        childName: data.childName,
        childBirthDate: data.birthDate?.toISOString(),
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
          description: err.details[0] ?? err.message,
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
                  active ? "text-white" : "text-white/65 hover:text-white",
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

      <Field label="Дата рождения *" error={errors.birthDate}>
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
          Согласен(на) на обработку персональных данных в соответствии с указанными в анкете сведениями.
        </span>
      </label>
      {errors.consent && <span className="text-[11px] text-red-300 -mt-2">{errors.consent}</span>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 h-12 rounded-full bg-flame text-white text-[12px] font-semibold uppercase tracking-[0.18em] shadow-flame hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60"
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

function BirthDatePicker({
  value,
  hasError,
  onChange,
}: {
  value?: Date;
  hasError: boolean;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            inputCls(hasError),
            "flex items-center justify-between text-left",
            !value && "text-white/40",
          )}
        >
          <span>
            {value ? format(value, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
          </span>
          <CalendarIcon className="h-4 w-4 opacity-60 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="z-[200] w-auto p-0 border-white/15 bg-night text-white shadow-elevated pointer-events-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (!d) return;
            onChange(d);
            setOpen(false);
          }}
          captionLayout="dropdown"
          fromYear={2005}
          toYear={new Date().getFullYear()}
          defaultMonth={value ?? new Date(2015, 0)}
          disabled={(date) => date > new Date() || date < new Date("2005-01-01")}
          locale={ru}
          className="p-3 bg-night text-white [--cell-size:2.25rem]"
          classNames={{
            dropdown_root: "border-white/15 bg-white/5 text-white",
            caption_label: "text-white",
            weekday: "text-white/45",
            outside: "text-white/25",
            disabled: "text-white/20",
            today: "bg-white/10 text-white",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

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
