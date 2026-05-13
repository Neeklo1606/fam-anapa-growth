import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { randomUUID, createHash } from "node:crypto";
import type { UserRole } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { AccessTokenPayload, AuthenticatedUser, RefreshTokenPayload } from "./auth.types";

const ACCESS_COOKIE = "fam_access";
const REFRESH_COOKIE = "fam_refresh";
const CSRF_COOKIE = "fam_csrf";

type TokenPair = { accessToken: string; refreshToken: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  static readonly ACCESS_COOKIE = ACCESS_COOKIE;
  static readonly REFRESH_COOKIE = REFRESH_COOKIE;
  static readonly CSRF_COOKIE = CSRF_COOKIE;

  async login(
    email: string,
    password: string,
    meta: { ip?: string | null; userAgent?: string | null },
  ): Promise<{ user: AuthenticatedUser; tokens: TokenPair }> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) throw new UnauthorizedException("Неверный email или пароль");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Неверный email или пароль");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokenPair(user, meta);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      tokens,
    };
  }

  async refresh(
    rawRefreshToken: string,
    meta: { ip?: string | null; userAgent?: string | null },
  ): Promise<{ user: AuthenticatedUser; tokens: TokenPair }> {
    const refreshSecret = this.config.get<string>("JWT_REFRESH_SECRET");
    if (!refreshSecret) throw new UnauthorizedException();

    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(rawRefreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException("Refresh token недействителен");
    }

    const hash = this.hashToken(rawRefreshToken);
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token недействителен");
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw new UnauthorizedException();

    // Rotate refresh token
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await this.issueTokenPair(user, meta);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      tokens,
    };
  }

  async logout(rawRefreshToken: string | null | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    const hash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken
      .updateMany({
        where: { tokenHash: hash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch((e) => this.logger.warn(`logout failed: ${(e as Error).message}`));
  }

  cookieOptions(maxAgeMs: number) {
    const isProd = this.config.get<string>("NODE_ENV") === "production";
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/",
      maxAge: maxAgeMs,
    };
  }

  /** CSRF double-submit cookie (эмиссия только с сервером SSR / Next cookie store). */
  csrfCookieOptions() {
    return this.cookieOptions(this.ttlRefreshMs());
  }

  ttlAccessMs(): number {
    return parseDurationMs(this.config.get<string>("JWT_ACCESS_TTL") ?? "15m");
  }
  ttlRefreshMs(): number {
    return parseDurationMs(this.config.get<string>("JWT_REFRESH_TTL") ?? "30d");
  }

  private async issueTokenPair(
    user: { id: string; email: string; role: UserRole; fullName: string },
    meta: { ip?: string | null; userAgent?: string | null },
  ): Promise<TokenPair> {
    const accessSecret = this.config.getOrThrow<string>("JWT_ACCESS_SECRET");
    const refreshSecret = this.config.getOrThrow<string>("JWT_REFRESH_SECRET");

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: accessSecret,
      expiresIn: this.config.get<string>("JWT_ACCESS_TTL") ?? "15m",
    });

    const jti = randomUUID();
    const refreshPayload: RefreshTokenPayload = { sub: user.id, jti };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: refreshSecret,
      expiresIn: this.config.get<string>("JWT_REFRESH_TTL") ?? "30d",
    });
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.ttlRefreshMs());

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        userAgent: meta.userAgent ?? null,
        ip: meta.ip ?? null,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

function parseDurationMs(spec: string): number {
  const m = /^(\d+)\s*([smhdwy])?$/i.exec(spec.trim());
  if (!m) return Number(spec) || 15 * 60_000;
  const n = Number(m[1]);
  const u = (m[2] ?? "s").toLowerCase();
  const mult: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000,
    y: 31_536_000_000,
  };
  return n * (mult[u] ?? 1000);
}
