import { useState } from "react";
import { toast } from "sonner";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    (e.currentTarget as HTMLFormElement).reset();
    toast.success("Заявка отправлена", { description: "Мы свяжемся с вами в течение дня." });
  };
  return (
    <form onSubmit={onSubmit} className={`grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
      <input
        required
        name="name"
        placeholder="Имя ребёнка"
        className="h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
      />
      <input
        required
        name="phone"
        type="tel"
        placeholder="Телефон родителя"
        className="h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
      />
      <textarea
        name="message"
        rows={3}
        placeholder="Возраст ребёнка и удобное время"
        className={`px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition ${compact ? "" : "md:col-span-2"}`}
      />
      <button
        type="submit"
        disabled={loading}
        className={`h-12 rounded-xl bg-gradient-brand text-primary-foreground font-medium shadow-soft hover:opacity-95 transition disabled:opacity-60 ${compact ? "" : "md:col-span-2"}`}
      >
        {loading ? "Отправляем…" : "Записать на пробное занятие"}
      </button>
      <p className={`text-xs text-muted-foreground ${compact ? "" : "md:col-span-2"}`}>
        Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
      </p>
    </form>
  );
}
