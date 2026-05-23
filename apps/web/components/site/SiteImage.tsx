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
