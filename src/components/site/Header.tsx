import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.webp";

const nav = [
  { to: "/", label: "Главная" },
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
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="FAM" className="h-9 w-9 rounded-full" width={36} height={36} />
          <div className="leading-tight">
            <div className="font-display font-bold text-[15px] text-brand-deep">FAM</div>
            <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Football Academy Morev</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-4 py-2 rounded-full text-sm text-foreground/80 hover:text-brand transition"
              activeProps={{ className: "px-4 py-2 rounded-full text-sm bg-secondary text-brand-deep font-medium" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
          <a
            href="tel:+79000000000"
            className="ml-2 px-5 py-2.5 rounded-full bg-gradient-brand text-primary-foreground text-sm font-medium shadow-soft hover:opacity-95 transition"
          >
            Позвонить
          </a>
        </nav>
      </div>
    </header>
  );
}
