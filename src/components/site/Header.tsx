import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { MobileMenu } from "@/components/site/MobileMenu";
import { ApplyButton } from "@/components/site/ApplyModal";
import { NAV_LINKS } from "@/content/site";

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
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-night/85 backdrop-blur-2xl border-b border-white/10"
          : "bg-gradient-to-b from-night/55 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-3">
        {/* Logo with subtle premium glass backdrop for contrast on dark hero */}
        <Link to="/" className="flex items-center gap-2.5 min-w-0 group" aria-label="Академия Морева">
          <span className="relative inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 shrink-0">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/25 shadow-[0_4px_18px_rgba(0,0,0,0.35)]"
            />
            <span
              aria-hidden="true"
              className="absolute -inset-1 rounded-full bg-white/5 blur-md opacity-70"
            />
            <img
              src={logo}
              alt="Академия Морева"
              width={56}
              height={56}
              className="relative h-10 w-10 md:h-12 md:w-12 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition group-hover:scale-105"
            />
          </span>
          <span className="hidden sm:block leading-none min-w-0">
            <span className="block font-display text-[13px] md:text-[15px] tracking-[0.04em] text-white font-bold uppercase truncate">
              Академия Морева
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-[11px] uppercase tracking-[0.22em] text-white/65 font-medium">
          {NAV_LINKS.slice(0, 5).map((l) => (
            <a
              key={l.href}
              href={`/${l.href}`}
              className="relative hover:text-white transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame after:transition-all hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ApplyButton className="!h-11 !pl-5 !pr-1.5 !text-[11px]">
              Записаться
            </ApplyButton>
          </div>
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
