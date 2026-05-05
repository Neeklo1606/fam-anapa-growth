import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.webp";

export function Footer() {
  return (
    <footer className="relative bg-night text-white overflow-hidden">
      <div className="absolute inset-0 pitch-lines opacity-30" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[480px] w-[800px] bg-gradient-pitch opacity-70" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-16">
        <div className="font-display text-[18vw] lg:text-[12rem] leading-[0.85] text-white/[0.04] tracking-tighter select-none pointer-events-none">
          FAM ANAPA
        </div>

        <div className="grid gap-12 md:grid-cols-12 mt-[-4rem] lg:mt-[-6rem] relative">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img src={logo} alt="FAM" className="h-12 w-12 rounded-full bg-white/5 p-1" width={48} height={48} />
              <div>
                <div className="font-display text-2xl">FAM</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">Академия Морева</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/60 max-w-sm leading-relaxed">
              Детская футбольная академия в Анапе. Техника, координация, игровое мышление и уверенность на поле.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Навигация</div>
            <ul className="mt-5 space-y-3 text-sm">
              <li><a href="/#about" className="text-white/80 hover:text-flame transition">Об академии</a></li>
              <li><a href="/#coaches" className="text-white/80 hover:text-flame transition">Тренеры</a></li>
              <li><a href="/#schedule" className="text-white/80 hover:text-flame transition">Расписание</a></li>
              <li><Link to="/contacts" className="text-white/80 hover:text-flame transition">Контакты</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Контакты</div>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li>Анапа, Краснодарский край</li>
              <li><a href="tel:+79000000000" className="hover:text-flame transition">+7 (900) 000-00-00</a></li>
              <li><a href="mailto:hello@fam-anapa.ru" className="hover:text-flame transition">hello@fam-anapa.ru</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-white/10 flex flex-wrap gap-3 justify-between text-xs text-white/40">
          <span>© {new Date().getFullYear()} Футбольная академия Морева</span>
          <span className="uppercase tracking-wider">FAM · Anapa · Russia</span>
        </div>
      </div>
    </footer>
  );
}
