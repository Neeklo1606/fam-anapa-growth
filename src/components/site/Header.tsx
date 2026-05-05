import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.webp";

const nav = [
  { to: "/", label: "О нас", hash: "#about" },
  { to: "/", label: "Тренировки", hash: "#training" },
  { to: "/", label: "Тренеры", hash: "#coaches" },
  { to: "/", label: "Галерея", hash: "#gallery" },
  { to: "/", label: "Расписание", hash: "#schedule" },
  { to: "/contacts", label: "Контакты" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-night/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-14 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group min-w-0">
          <div className="relative h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-full bg-white/5 ring-1 ring-white/15 overflow-hidden">
            <img src={logo} alt="FAM" className="h-full w-full object-contain p-1" width={40} height={40} />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-display text-base md:text-xl tracking-wide text-white">FAM</div>
            <div className="text-[9px] md:text-[10px] tracking-[0.16em] text-white/55 uppercase truncate">Академия Морева · Анапа</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.to === "/" ? n.hash ?? "/" : n.to}
              className="px-3 py-2 text-[13px] tracking-wide uppercase font-medium text-white/70 hover:text-white transition"
            >
              {n.label}
            </a>
          ))}
          <a
            href="#cta"
            className="ml-3 inline-flex items-center gap-2 pl-5 pr-4 h-11 rounded-full bg-flame text-white text-sm font-semibold shadow-flame hover:brightness-110 transition uppercase tracking-wide"
          >
            Записаться
            <span className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center">→</span>
          </a>
        </nav>

        <a
          href="#cta"
          className="lg:hidden inline-flex items-center h-9 px-3.5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider shadow-flame"
        >
          Записаться
        </a>
      </div>

    </header>
  );
}
