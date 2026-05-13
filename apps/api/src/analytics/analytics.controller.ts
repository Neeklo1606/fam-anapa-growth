import type { Request } from "express";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AnalyticsEventType, Prisma } from "@prisma/client";
import { Allow, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

import { PrismaService } from "../prisma/prisma.service";

class AnalyticsIngestDto {
  @IsEnum(AnalyticsEventType)
  type!: AnalyticsEventType;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  page?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  section?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sessionId?: string;

  /** Произвольный контекст (ограничен по размеру на уровне БД Json) */
  @IsOptional()
  @Allow()
  metadata?: unknown;
}

function clientIp(req: Request): string | null {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) {
    return xf.split(",")[0]!.trim().slice(0, 64) || null;
  }
  if (Array.isArray(xf) && xf[0]) return xf[0]!.trim().slice(0, 64);
  return req.ip?.slice(0, 64) ?? null;
}

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("events")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async ingest(@Req() req: Request, @Body() dto: AnalyticsIngestDto) {
    const ua = req.headers["user-agent"];
    const meta =
      dto.metadata !== undefined && dto.metadata !== null && typeof dto.metadata === "object"
        ? dto.metadata
        : undefined;

    await this.prisma.analyticsEvent.create({
      data: {
        type: dto.type,
        page: dto.page?.trim() || null,
        section: dto.section?.trim() || null,
        sessionId: dto.sessionId?.trim() || null,
        ...(meta !== undefined ? { metadata: meta as Prisma.InputJsonValue } : {}),
        userAgent: typeof ua === "string" ? ua.slice(0, 512) : null,
        ip: clientIp(req),
      },
    });
    return { ok: true };
  }
}
