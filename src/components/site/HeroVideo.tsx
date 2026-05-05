import { useEffect, useRef, useState } from "react";

type Props = {
  videoSrc: string;
  posterSrc: string;
  alt?: string;
  className?: string;
  objectPosition?: string;
};

export function HeroVideo({
  videoSrc,
  posterSrc,
  alt = "",
  className = "",
  objectPosition = "70% center",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => setReady(true);
    const onError = () => setFailed(true);
    v.addEventListener("canplay", onReady);
    v.addEventListener("loadeddata", onReady);
    v.addEventListener("error", onError);
    // attempt autoplay (iOS sometimes needs explicit call)
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    return () => {
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <img
        src={posterSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition }}
        loading="eager"
        decoding="async"
      />
      {!failed && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          {...({ "webkit-playsinline": "true" } as Record<string, string>)}
          disablePictureInPicture
          disableRemotePlayback
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition }}
        />
      )}
    </div>
  );
}
