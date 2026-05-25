"use client";

import { useEffect } from "react";

const RELOAD_KEY = "fam_chunk_reload";

function isChunkLoadError(reason: unknown): boolean {
  if (!reason) return false;
  const msg = reason instanceof Error ? reason.message : String(reason);
  const name = reason instanceof Error ? reason.name : "";
  return (
    name === "ChunkLoadError" ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Loading chunk") ||
    msg.includes("Failed to fetch dynamically imported module") ||
    /MIME type \('text\/plain'\)/.test(msg)
  );
}

/** После деплоя браузер может держать старый HTML со ссылками на удалённые chunks — перезагружаем один раз. */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const reloadOnce = () => {
      try {
        const attempts = Number(sessionStorage.getItem(RELOAD_KEY) ?? "0");
        if (attempts >= 2) return;
        sessionStorage.setItem(RELOAD_KEY, String(attempts + 1));
      } catch {
        /* ignore */
      }
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) reloadOnce();
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* ignore */
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
