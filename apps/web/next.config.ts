import type { NextConfig } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://morev.neeklo.ru";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Загрузка файлов через server actions (`uploadMediaAction`): дефолтный лимит Next слишком мал.
  experimental: {
    serverActions: {
      bodySizeLimit: "125mb",
    },
  },

  // Output: stand-alone for slim docker/PM2 deploy
  output: "standalone",

  // Quiet sourcemaps in prod
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "morev.neeklo.ru" },
      { protocol: "https", hostname: "footballacademymorev.ru" },
      { protocol: "https", hostname: "www.footballacademymorev.ru" },
    ],
  },

  // Custom env (also surfaces NEXT_PUBLIC_* in client)
  env: {
    NEXT_PUBLIC_SITE_URL: SITE_URL,
  },

  // Security headers (tighten CSP later when backend wired)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "interest-cohort=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
