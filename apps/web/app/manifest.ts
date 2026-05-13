import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Футбольная академия Морева",
    short_name: "ФАМ Анапа",
    description: "Детская футбольная академия Морева в Анапе",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1020",
    theme_color: "#0B1020",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    lang: "ru",
    orientation: "portrait",
  };
}
