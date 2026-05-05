import { useState } from "react";
import { toast } from "sonner";

export function ContactForm({ dark = false }: { dark?: boolean; compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    (e.currentTarget as HTMLFormElement).reset();
    toast.success("Спасибо!", {
      description: "Мы свяжемся с вами и подскажем подходящую группу.",
    });
  };

  const input = dark
    ? "h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame transition"
    : "h-12 px-4 rounded-xl bg-background border border-border text-ink placeholder:text-muted-foreground focus:outline-none focus:border-royal transition";
  const textarea = dark
    ? "px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame transition"
    : "px-4 py-3 rounded-xl bg-background border border-border text-ink placeholder:text-muted-foreground focus:outline-none focus:border-royal transition";
  const note = dark ? "text-white/40" : "text-muted-foreground";

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      <input required name="parent" placeholder="Имя родителя" className={input} />
      <input required name="phone" type="tel" placeholder="Телефон" className={input} />
      <input required name="age" placeholder="Возраст ребёнка" className={`${input} md:col-span-2`} />
      <textarea name="comment" rows={3} placeholder="Комментарий" className={`${textarea} md:col-span-2`} />
      <button
        type="submit"
        disabled={loading}
        className="md:col-span-2 h-13 py-4 rounded-xl bg-flame text-white font-semibold uppercase tracking-wider text-sm shadow-flame hover:brightness-110 transition disabled:opacity-60"
      >
        {loading ? "Отправляем…" : "Отправить заявку"}
      </button>
      <p className={`text-xs md:col-span-2 ${note}`}>
        Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
      </p>
    </form>
  );
}
