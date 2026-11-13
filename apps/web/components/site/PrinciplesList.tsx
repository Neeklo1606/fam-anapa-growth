import type { PrincipleItem } from "@/lib/home-page-content";

export function PrinciplesList({ items }: { items: PrincipleItem[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <li key={p.title} className="relative rounded-3xl border border-line bg-white p-6 shadow-soft overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-flame to-flame/0" />
          <div className="font-mono-pro text-sm text-flame">{p.n}</div>
          <h3 className="mt-2 font-display text-xl tracking-tight text-deep">{p.title}</h3>
          <p className="mt-2 text-ink/70 text-sm leading-relaxed">{p.text}</p>
        </li>
      ))}
    </ol>
  );
}
