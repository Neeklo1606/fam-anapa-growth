import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded, Bebas_Neue, JetBrains_Mono } from "next/font/google";

import { ChunkLoadRecovery } from "@/components/ChunkLoadRecovery";
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
  preload: false,
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-loaded",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1020",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Коды подтверждения прав: Яндекс.Вебмастер / Google Search Console (задаются в .env на сервере).
  verification: {
    ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ? { yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION } : {}),
    ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION } : {}),
  },
  title: { default: "Футбольная академия Морева", template: "%s · ФАМ Анапа" },
  description:
    "Детская футбольная школа в Анапе для детей 5–14 лет: профессиональная подготовка, опытные тренеры, записи на пробное занятие.",
  keywords: [
    "футбол дети Анапа",
    "футбольная школа Анапа",
    "футбольные школы Анапа",
    "футбольная секция Анапа",
    "футбол для детей Анапа",
    "футбольная академия Анапа",
    "футбольная академия",
    "детский футбольный клуб Анапа",
    "школа вратарей Анапа",
    "записать ребёнка на футбол Анапа",
    "записаться в футбольную школу",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    // Эмблема без полей — крупно во вкладке и в выдаче Google (кратно 48 px).
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Футбольная академия Морева",
    title: "Футбольная академия Морева в Анапе",
    description:
      "Детская футбольная школа в Анапе для детей 5–14 лет. Тренировки, школа вратарей, пробное занятие.",
    images: [{ url: "/img/hero-kid.jpg", width: 1200, height: 630, alt: "Футбольная академия Морева" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Футбольная академия Морева · Анапа",
    description: "Детская футбольная школа для детей 5–14 лет. Запишитесь на пробное занятие.",
    images: [`${SITE_URL}/img/hero-kid.jpg`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${unbounded.variable} ${bebas.variable} ${jetbrains.variable}`}
    >
      <body className="bg-background text-foreground">
        <ChunkLoadRecovery />
        {children}
      </body>
    </html>
  );
}
