import { randomBytes } from "node:crypto";

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { AuthenticatedUser } from "./auth.types";
import { ChangeOwnPasswordDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post("login")
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
    const forwarded = (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim();
    const result = await this.auth.login(dto.email, dto.password, {
      ip: forwarded || ip || null,
      userAgent: ua,
    });
    this.setCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return { user: result.user };
  }

  @Post("refresh")
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const raw = (req.cookies as Record<string, string> | undefined)?.[AuthService.REFRESH_COOKIE];
    if (!raw) throw new UnauthorizedException("Нет сессии");
    const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null;
    const forwarded = (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim();
    const result = await this.auth.refresh(raw, { ip: forwarded || ip || null, userAgent: ua });
    this.setCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return { user: result.user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req.cookies as Record<string, string> | undefined)?.[AuthService.REFRESH_COOKIE];
    await this.auth.logout(raw ?? null);
    this.clearCookies(res);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.issueCsrfIfNeeded(req, res);
    return { user };
  }

  @Patch("me/password")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeOwnPassword(
    @CurrentUser() user: AuthenticatedUser | null,
    @Body() dto: ChangeOwnPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!user) throw new ForbiddenException();
    await this.users.changeOwnPassword(user.id, dto.currentPassword, dto.newPassword);
    this.clearCookies(res);
  }

  private issueCsrfIfNeeded(req: Request, res: Response) {
    const c = (req.cookies as Record<string, string | undefined> | undefined)?.[
      AuthService.CSRF_COOKIE
    ];
    if (typeof c === "string" && c.length >= 16) return;
    const token = randomBytes(32).toString("hex");
    res.cookie(AuthService.CSRF_COOKIE, token, this.auth.csrfCookieOptions());
  }

  private setCookies(res: Response, access: string, refresh: string) {
    res.cookie(AuthService.ACCESS_COOKIE, access, this.auth.cookieOptions(this.auth.ttlAccessMs()));
    res.cookie(
      AuthService.REFRESH_COOKIE,
      refresh,
      this.auth.cookieOptions(this.auth.ttlRefreshMs()),
    );
    const token = randomBytes(32).toString("hex");
    res.cookie(AuthService.CSRF_COOKIE, token, this.auth.csrfCookieOptions());
  }

  private clearCookies(res: Response) {
    res.clearCookie(AuthService.ACCESS_COOKIE, { path: "/" });
    res.clearCookie(AuthService.REFRESH_COOKIE, { path: "/" });
    res.clearCookie(AuthService.CSRF_COOKIE, { path: "/" });
  }
}
