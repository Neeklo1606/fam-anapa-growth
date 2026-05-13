import { timingSafeEqual } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

import { AuthService } from "../auth/auth.service";

const CSRF_HEADER = "x-csrf-token";

function pathname(req: Request): string {
  const raw = req.originalUrl ?? req.url ?? "";
  return raw.split("?")[0] || "/";
}

function shouldSkipCsrf(method: string, path: string): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;
  if (path.startsWith("/api/integrations/")) return true;
  if (method === "POST" && path === "/api/auth/login") return true;
  /** Без access cookie клиент обновляет пару токенов; CSRF на refresh откладываем (SameSite=Lax). */
  if (method === "POST" && path === "/api/auth/refresh") return true;
  if (method === "POST" && path === "/api/leads") return true;
  if (method === "POST" && path === "/api/analytics/events") return true;
  if (method === "POST" && path === "/api/knowledge/retrieve") return true;
  return false;
}

function safeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Double-submit: cookie `fam_csrf` + заголовок X-CSRF-Token для мутаций при наличии сессионных cookies. */
export function apiCsrfProtection() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const path = pathname(req);
    if (shouldSkipCsrf(req.method, path)) {
      next();
      return;
    }

    const jar = req.cookies as Record<string, string | undefined> | undefined;
    const hasAuthCookies = !!(
      jar?.[AuthService.ACCESS_COOKIE] || jar?.[AuthService.REFRESH_COOKIE]
    );
    if (!hasAuthCookies) {
      next();
      return;
    }

    const headerRaw = req.headers[CSRF_HEADER] ?? req.headers[CSRF_HEADER.toLowerCase()];
    const token = typeof headerRaw === "string" ? headerRaw : "";
    const cookieTok = jar?.[AuthService.CSRF_COOKIE] ?? "";
    if (
      token.length < 16 ||
      cookieTok.length < 16 ||
      typeof cookieTok !== "string" ||
      !safeEq(token, cookieTok)
    ) {
      res.status(403).json({ statusCode: 403, message: "CSRF validation failed" });
      return;
    }

    next();
  };
}
