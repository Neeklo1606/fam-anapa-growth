import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Check, ArrowRight, ArrowLeft, Trophy } from "lucide-react";

const ages = ["4–6", "7–9", "10–12", "13–14"];
const goals = ["Базовая техника", "Координация", "Игровое мышление", "Дисциплина и уверенность"];
const formats = ["Групповые тренировки", "Индивидуальные занятия", "Нужна консультация"];

const steps = [
  { n: 1, label: "Возраст" },
  { n: 2, label: "Цель" },
  { n: 3, label: "Формат" },
  { n: 4, label: "Контакты" },
];

export function JoinFlow() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({ age: "", goal: "", format: "", parent: "", phone: "", comment: "" });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof data, v: string) => setData((d) => ({ ...d, [k]: v }));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canNext =
    (step === 0 && data.age) || (step === 1 && data.goal) || (step === 2 && data.format) || step === 3;

  const submit = async () => {
    if (!data.parent || !data.phone) {
      toast.error("Заполните имя и телефон");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
          className="mx-auto h-20 w-20 rounded-full bg-flame text-white flex items-center justify-center shadow-flame"
        >
          <Trophy className="h-9 w-9" />
        </motion.div>
        <h3 className="mt-6 font-display text-3xl md:text-4xl tracking-wide text-white">Добро пожаловать в команду</h3>
        <p className="mt-3 text-white/65 max-w-md mx-auto">
          Спасибо! Мы получили заявку и поможем подобрать подходящую группу. Свяжемся в течение дня.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-wider text-white/70">
          FAM · Анапа · {data.age ? `${data.age} лет` : "Заявка принята"}
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress — match-style */}
      <div className="flex items-center gap-2 mb-7">
        {steps.map((s, i) => {
          const active = i === step;
          const passed = i < step;
          return (
            <div key={s.n} className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
                    passed
                      ? "bg-flame text-white"
                      : active
                      ? "bg-white text-night ring-4 ring-flame/30"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {passed ? <Check className="h-3.5 w-3.5" /> : s.n}
                </div>
                <div className={`text-[10px] uppercase tracking-[0.18em] hidden sm:block ${active ? "text-white" : "text-white/40"}`}>
                  {s.label}
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: passed ? "100%" : active ? "50%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-flame"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <Choice
                title="Выберите возраст ребёнка"
                hint="Подберём подходящую группу"
                options={ages}
                value={data.age}
                onSelect={(v) => { update("age", v); setTimeout(next, 220); }}
                suffix="лет"
                cols={2}
              />
            )}
            {step === 1 && (
              <Choice
                title="Что хотите развивать"
                hint="Можно уточнить позже с тренером"
                options={goals}
                value={data.goal}
                onSelect={(v) => { update("goal", v); setTimeout(next, 220); }}
                cols={2}
              />
            )}
            {step === 2 && (
              <Choice
                title="Удобный формат"
                hint="Выберите как вам комфортнее"
                options={formats}
                value={data.format}
                onSelect={(v) => { update("format", v); setTimeout(next, 220); }}
                cols={1}
              />
            )}
            {step === 3 && (
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Шаг 4</div>
                <h4 className="mt-2 font-display text-3xl tracking-wide text-white">Контактные данные</h4>
                <p className="mt-2 text-white/55 text-sm">Перезвоним и подтвердим запись.</p>
                <div className="mt-6 grid gap-3">
                  <input
                    placeholder="Имя родителя"
                    value={data.parent}
                    onChange={(e) => update("parent", e.target.value)}
                    className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame transition"
                  />
                  <input
                    placeholder="Телефон"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame transition"
                  />
                  <textarea
                    placeholder="Комментарий (по желанию)"
                    rows={3}
                    value={data.comment}
                    onChange={(e) => update("comment", e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame transition"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-2 h-12 px-5 rounded-full border border-white/15 text-white/80 text-sm font-semibold uppercase tracking-wider disabled:opacity-30 hover:bg-white/5 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        {step < 3 ? (
          <button
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-2 h-12 pl-6 pr-2 rounded-full bg-white text-night text-sm font-semibold uppercase tracking-wider disabled:opacity-30 hover:bg-flame hover:text-white transition"
          >
            Далее
            <span className="h-9 w-9 rounded-full bg-night/10 flex items-center justify-center">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={loading}
            className="inline-flex items-center gap-2 h-12 pl-6 pr-2 rounded-full bg-flame text-white text-sm font-semibold uppercase tracking-wider shadow-flame hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Отправляем…" : "Записаться в команду"}
            <span className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function Choice({
  title,
  hint,
  options,
  value,
  onSelect,
  suffix,
  cols = 2,
}: {
  title: string;
  hint: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  suffix?: string;
  cols?: 1 | 2;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-flame font-semibold">Шаг</div>
      <h4 className="mt-2 font-display text-3xl tracking-wide text-white">{title}</h4>
      <p className="mt-2 text-white/55 text-sm">{hint}</p>
      <div className={`mt-6 grid gap-3 ${cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {options.map((o) => {
          const active = value === o;
          return (
            <motion.button
              key={o}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(o)}
              className={`relative text-left p-5 rounded-2xl border transition overflow-hidden ${
                active
                  ? "border-flame bg-flame/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
              }`}
            >
              <div className="font-display text-2xl tracking-wide text-white">
                {o} {suffix && <span className="text-white/45 text-base font-sans normal-case tracking-normal">{suffix}</span>}
              </div>
              <div
                className={`mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                  active ? "text-flame" : "text-white/40"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {active ? "Выбрано" : "Выбрать"}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
