"use client";

import { LazyMotion } from "framer-motion";

/** Фичи анимаций грузятся отдельным чанком после первой отрисовки (меньше JS на старте). */
const loadFeatures = () => import("./motion-features").then((m) => m.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
