import Image, { type ImageProps } from "next/image";

/** `/uploads/` раздаёт nginx с диска, не из `public` Next — `/_next/image` их не видит. */
export function siteImageNeedsUnoptimized(src: string): boolean {
  return src.startsWith("/uploads/");
}

type SiteImageProps = Omit<ImageProps, "src" | "unoptimized"> & {
  src: string;
};

export function SiteImage({ src, ...props }: SiteImageProps) {
  return <Image src={src} unoptimized={siteImageNeedsUnoptimized(src)} {...props} />;
}

/**
 * URL постера для <video poster>: статичные картинки из public пропускаем через
 * оптимизатор Next (AVIF/WebP, нужный размер), /uploads/ и внешние — как есть.
 */
export function optimizedPosterUrl(src: string, width = 1080, quality = 70): string {
  if (!src.startsWith("/") || src.startsWith("//") || siteImageNeedsUnoptimized(src) || src.endsWith(".svg")) {
    return src;
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
