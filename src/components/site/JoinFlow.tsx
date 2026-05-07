import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Users,
  User,
  Sparkles,
  Target,
  Brain,
  Shield,
  Flame,
} from "lucide-react";

const ages = [
  { v: "4–6", desc: "Первое касание мяча" },
  { v: "7–9", desc: "Базовая техника" },
  { v: "10–12", desc: "Игровое мышление" },
  { v: "13–14", desc: "Тактика и игра" },
];
const goals = [
  { v: "Базовая техника", icon: Target, desc: "Удар, приём, ведение" },
  { v: "Координация", icon: Flame, desc: "Скорость и движение" },
  { v: "Игровое мышление", icon: Brain, desc: "Решения на поле" },
  { v: "Дисциплина и уверенность", icon: Shield, desc: "Характер игрока" },
];
const formats = [
  { v: "Групповые тренировки", icon: Users, desc: "В команде, 2–3 раза в неделю" },
  { v: "Индивидуальные занятия", icon: User, desc: "Точечная работа над навыком" },
  { v: "Нужна консультация", icon: Sparkles, desc: "Подберём вместе с тренером" },
];

const stations = [
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

  const next = () => setStep((s) => Math.min(s + 1, stations.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canNext =
    (step === 0 && !!data.age) ||
    (step === 1 && !!data.goal) ||
    (step === 2 && !!data.format) ||
    step === 3;

  const submit = async () => {
    if (!data.parent || !data.phone) {
      toast.error("Заполните имя и телефон");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setDone(true);
  };

  if (done) return <Success data={data} />;

  return (
    <div className="relative">
      {/* Field-style progress */}
      <FieldProgress step={step} />

      <div className="mt-7 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <Stage title="Выберите возраст ребёнка" hint="Подберём подходящую группу" badge="Шаг 01 · Возраст">
                <div className="grid grid-cols-2 gap-3">
                  {ages.map((o) => (
                    <ChoiceCard
                      key={o.v}
                      active={data.age === o.v}
                      onClick={() => {
                        update("age", o.v);
                        setTimeout(next, 250);
                      }}
                      label={`${o.v} лет`}
                      hint={o.desc}
                    />
                  ))}
                </div>
              </Stage>
            )}
            {step === 1 && (
              <Stage title="Что хотите развивать" hint="Можно уточнить позже с тренером" badge="Шаг 02 · Цель">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goals.map((o) => (
                    <ChoiceCard
                      key={o.v}
                      icon={o.icon}
                      active={data.goal === o.v}
                      onClick={() => {
                        update("goal", o.v);
                        setTimeout(next, 250);
                      }}
                      label={o.v}
                      hint={o.desc}
                    />
                  ))}
                </div>
              </Stage>
            )}
            {step === 2 && (
              <Stage title="Удобный формат" hint="Выберите как комфортнее" badge="Шаг 03 · Формат">
                <div className="grid gap-3">
                  {formats.map((o) => (
                    <ChoiceCard
                      key={o.v}
                      icon={o.icon}
                      active={data.format === o.v}
                      onClick={() => {
                        update("format", o.v);
                        setTimeout(next, 250);
                      }}
                      label={o.v}
                      hint={o.desc}
                      horizontal
                    />
                  ))}
                </div>
              </Stage>
            )}
            {step === 3 && (
              <Stage title="Контактные данные" hint="Перезвоним и подтвердим запись" badge="Шаг 04 · Контакты">
                {/* Live summary · like a team sheet */}
                <div className="mb-5 grid grid-cols-3 gap-2">
                  {[
                    { k: "Возраст", v: data.age },
                    { k: "Цель", v: data.goal },
                    { k: "Формат", v: data.format?.split(" ")[0] },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-flame">{s.k}</div>
                      <div className="mt-1 text-sm font-semibold text-white truncate">{s.v || "·"}</div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3">
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
              </Stage>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
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
            <span className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function FieldProgress({ step }: { step: number }) {
  // Ball position 0..1 along the field
  const pct = step / (stations.length - 1);
  return (
    <div className="relative rounded-2xl bg-[oklch(0.32_0.10_150)] border border-white/10 px-4 pt-4 pb-3 overflow-hidden">
      {/* pitch grass */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(90deg, oklch(0.30 0.10 150) 0 32px, oklch(0.34 0.10 150) 32px 64px)",
        }}
      />
      {/* center line + circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-white/30" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />

      <div className="relative flex items-center justify-between gap-2">
        {stations.map((s, i) => {
          const passed = i < step;
          const active = i === step;
          return (
            <div key={s.n} className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition ${
                  passed
                    ? "bg-flame border-flame text-white"
                    : active
                    ? "bg-white border-white text-night"
                    : "bg-night/40 border-white/30 text-white/60"
                }`}
              >
                {passed ? <Check className="h-3.5 w-3.5" /> : s.n}
              </div>
              <div
                className={`text-[9px] uppercase tracking-[0.18em] hidden sm:block ${
                  active ? "text-white" : "text-white/60"
                }`}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Track + ball */}
      <div className="relative mt-3 h-1.5 rounded-full bg-white/15 overflow-visible">
        <motion.div
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-flame"
        />
        <motion.div
          initial={false}
          animate={{ left: `calc(${pct * 100}% - 10px)`, rotate: pct * 720 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -top-2 h-5 w-5 rounded-full bg-white shadow-flame border border-night/30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, white, white 35%, #0B1020 36%, #0B1020 42%, white 43%)",
          }}
        />
      </div>
    </div>
  );
}

function Stage({
  title,
  hint,
  badge,
  children,
}: {
  title: string;
  hint: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-flame font-semibold">{badge}</div>
      <h4 className="mt-2 font-display text-2xl md:text-3xl tracking-wide text-white">{title}</h4>
      <p className="mt-2 text-white/55 text-sm">{hint}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChoiceCard({
  label,
  hint,
  icon: Icon,
  active,
  onClick,
  horizontal = false,
}: {
  label: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  horizontal?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group relative text-left p-4 md:p-5 rounded-2xl border transition overflow-hidden ${
        active
          ? "border-flame bg-flame/10 shadow-flame"
          : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
      } ${horizontal ? "flex items-center gap-4" : ""}`}
    >
      {Icon && (
        <div
          className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition ${
            active ? "bg-flame text-white" : "bg-white/8 text-white/70 group-hover:text-white"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className={horizontal ? "flex-1 min-w-0" : "mt-3"}>
        <div className="font-display text-lg md:text-xl tracking-wide text-white leading-tight">{label}</div>
        {hint && <div className="mt-1 text-xs text-white/55">{hint}</div>}
      </div>
      <div
        className={`absolute top-3 right-3 h-5 w-5 rounded-full border flex items-center justify-center transition ${
          active ? "bg-flame border-flame" : "border-white/25"
        }`}
      >
        {active && <Check className="h-3 w-3 text-white" />}
      </div>
    </motion.button>
  );
}

function Success({ data }: { data: { age: string; goal: string; format: string; parent: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8 relative overflow-hidden"
    >
      {/* confetti-ish dots */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 280, opacity: [0, 1, 0] }}
          transition={{ duration: 1.6 + Math.random(), delay: i * 0.05, ease: "easeOut" }}
          className="absolute top-0 h-1.5 w-1.5 rounded-full"
          style={{
            left: `${(i * 7 + 5) % 95}%`,
            background: i % 2 === 0 ? "var(--flame)" : "white",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        className="mx-auto h-20 w-20 rounded-full bg-flame text-white flex items-center justify-center shadow-flame"
      >
        <Trophy className="h-9 w-9" />
      </motion.div>
      <h3 className="mt-6 font-display text-3xl md:text-4xl tracking-wide text-white">
        Добро пожаловать в команду
      </h3>
      <p className="mt-3 text-white/65 max-w-md mx-auto">
        {data.parent ? `${data.parent}, ` : ""}спасибо! Мы получили заявку и поможем подобрать подходящую группу.
        Свяжемся в течение дня.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        {[data.age && `${data.age} лет`, data.goal, data.format].filter(Boolean).map((t) => (
          <span
            key={t as string}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-wider text-white/75"
          >
            {t as string}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
