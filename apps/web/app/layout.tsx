import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded, Bebas_Neue, JetBrains_Mono } from "next/font/google";

import { SITE_URL } from "@/lib/utils";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-loaded",
  display: "swap",
});
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display-loaded",
  display: "swap",
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-condensed-loaded",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-loaded",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1020",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Футбольная академия Морева", template: "%s · ФАМ Анапа" },
  description:
    "Детская футбольная школа в Анапе для детей 6–14 лет: профессиональная подготовка, опытные тренеры, записи на пробное занятие.",
  keywords: [
    "футбол дети Анапа",
    "футбольная школа Анапа",
    "футбольная академия",
    "записаться в футбольную школу",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico", apple: "/favicon.ico" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Футбольная академия Морева",
    title: "Футбольная академия Морева в Анапе",
    description:
      "Детская футбольная школа в Анапе для детей 6–14 лет. Тренировки, школа вратарей, пробное занятие.",
    images: [{ url: "/img/hero-kid.jpg", width: 1200, height: 630, alt: "Футбольная академия Морева" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Футбольная академия Морева · Анапа",
    description: "Детская футбольная школа для детей 6–14 лет. Запишитесь на пробное занятие.",
    images: [`${SITE_URL}/img/hero-kid.jpg`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${unbounded.variable} ${bebas.variable} ${jetbrains.variable}`}
    >
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
