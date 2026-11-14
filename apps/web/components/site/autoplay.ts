/**
 * Надёжный автоплей фонового видео (без звука, по кругу).
 *
 * iOS Safari запускает видео сам, только если у элемента есть атрибуты muted и playsinline
 * (React выставляет muted свойством, без атрибута). В режиме энергосбережения или при
 * запрете автоплея браузер отклоняет play() — тогда пробуем снова на первом касании,
 * клике или прокрутке.
 */
export function forceAutoplay(v: HTMLVideoElement): () => void {
  v.muted = true;
  v.defaultMuted = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  v.setAttribute("webkit-playsinline", "true");

  const events = ["touchstart", "pointerdown", "click", "scroll", "keydown"] as const;
  let armed = false;
  const retry = () => {
    disarm();
    v.play().catch(() => {});
  };
  const disarm = () => {
    if (!armed) return;
    armed = false;
    for (const e of events) window.removeEventListener(e, retry);
  };
  const arm = () => {
    if (armed) return;
    armed = true;
    for (const e of events) window.addEventListener(e, retry, { passive: true, once: true });
  };

  const p = v.play();
  if (p && typeof p.catch === "function") p.catch(() => arm());
  return disarm;
}
