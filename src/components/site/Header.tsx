import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.webp";
import { ApplyButton } from "@/components/site/ApplyModal";

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
          ? "bg-night/85 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-full bg-white/5 ring-1 ring-white/15 overflow-hidden">
            <img src={logo} alt="Академия Морева" className="h-full w-full object-contain p-1" width={40} height={40} />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-display text-[15px] md:text-lg tracking-wide text-white truncate">Академия Морева</div>
            <div className="text-[9px] md:text-[10px] tracking-[0.2em] text-white/55 uppercase">Анапа</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/contacts"
            className="hidden md:inline-flex items-center h-10 px-4 text-[12px] uppercase tracking-wider text-white/70 hover:text-white transition"
          >
            Контакты
          </Link>
          <ApplyButton className="!h-10 md:!h-11 !pl-4 md:!pl-5 !pr-1.5 !text-[11px] md:!text-xs !py-1">
            Записаться
          </ApplyButton>
        </div>
      </div>
    </header>
  );
}
