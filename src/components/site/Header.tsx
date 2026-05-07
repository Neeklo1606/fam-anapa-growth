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
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-night/80 backdrop-blur-2xl border-b border-white/10"
          : "bg-gradient-to-b from-night/40 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-14 md:h-[68px] flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
          <div className="relative h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-full bg-white/5 ring-1 ring-white/15 overflow-hidden transition group-hover:ring-flame/60">
            <img src={logo} alt="Академия Морева" className="h-full w-full object-contain p-1" width={40} height={40} />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-display text-[14px] md:text-[16px] tracking-[0.02em] text-white truncate font-bold uppercase">Академия Морева</div>
            <div className="text-[9px] md:text-[10px] tracking-[0.32em] text-flame/90 uppercase font-mono-pro">FAM · Анапа</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[11px] uppercase tracking-[0.22em] text-white/65 font-medium">
          <a href="/#about" className="relative hover:text-white transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame after:transition-all hover:after:w-full">Академия</a>
          <a href="/#coaches" className="relative hover:text-white transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame after:transition-all hover:after:w-full">Тренеры</a>
          <a href="/#location" className="relative hover:text-white transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame after:transition-all hover:after:w-full">Локация</a>
          <Link to="/contacts" className="relative hover:text-white transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame after:transition-all hover:after:w-full">Контакты</Link>
        </nav>

        <div className="flex items-center gap-2">
          <ApplyButton className="!h-10 md:!h-11 !pl-4 md:!pl-5 !pr-1.5 !text-[10px] md:!text-[11px] !py-1">
            Записаться
          </ApplyButton>
        </div>
      </div>
    </header>
  );
}
