import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.webp";

export function Footer() {
  return (
    <footer className="bg-brand-deep text-white/90 mt-24">
      <div className="mx-auto max-w-6xl px-5 py-16 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="FAM" className="h-12 w-12 rounded-full bg-white/5 p-1" width={48} height={48} />
            <div>
              <div className="font-display font-bold text-lg">FAM</div>
              <div className="text-xs opacity-70 tracking-wider uppercase">Football Academy Morev</div>
            </div>
          </div>
          <p className="mt-5 text-sm opacity-70 max-w-xs">
            Детская футбольная академия в Анапе. Бережное развитие через спорт.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider opacity-60">Навигация</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:opacity-100 opacity-80">Главная</Link></li>
            <li><Link to="/contacts" className="hover:opacity-100 opacity-80">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider opacity-60">Контакты</div>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            <li>Анапа, Россия</li>
            <li><a href="tel:+79000000000">+7 (900) 000-00-00</a></li>
            <li><a href="mailto:hello@fam-anapa.ru">hello@fam-anapa.ru</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-6 text-xs opacity-60 flex flex-wrap gap-3 justify-between">
          <span>© {new Date().getFullYear()} Football Academy Morev</span>
          <span>Анапа · Краснодарский край</span>
        </div>
      </div>
    </footer>
  );
}
