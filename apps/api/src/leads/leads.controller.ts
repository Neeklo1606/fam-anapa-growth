import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import type { LeadStatus } from "@prisma/client";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedUser } from "../auth/auth.types";

import { CreateLeadDto } from "./dto/create-lead.dto";
import {
  AssignManagerDto,
  CreateLeadCommentDto,
  UpdateLeadStatusDto,
} from "./dto/update-status.dto";
import { LeadsService } from "./leads.service";

@Controller("leads")
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  // ────────────── PUBLIC ──────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async create(@Body() dto: CreateLeadDto, @Req() req: Request, @Ip() ip: string) {
    if (dto.website && dto.website.trim().length > 0) {
      throw new BadRequestException("Invalid submission");
    }
    const userAgent = req.headers["user-agent"] ?? null;
    const forwarded = (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim();
    const lead = await this.leads.create(dto, {
      ip: forwarded || ip || null,
      userAgent: typeof userAgent === "string" ? userAgent : null,
    });
    return {
      id: lead.id,
      status: lead.status,
      createdAt: lead.createdAt,
      message: "Заявка получена. Мы свяжемся с вами в ближайшее время.",
    };
  }

  // ────────────── ADMIN ──────────────
  @Get("export.csv")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", "attachment; filename=\"leads.csv\"")
  async exportCsv(@Query("status") status?: string, @Query("search") search?: string) {
    return this.leads.exportCsv({
      status: status as LeadStatus | "ALL" | undefined,
      search,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "VIEWER", "EDITOR")
  async list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("assignedManagerId") assignedManagerId?: string,
  ) {
    return this.leads.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as LeadStatus | "ALL" | undefined,
      search,
      assignedManagerId,
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "VIEWER", "EDITOR")
  async getOne(@Param("id") id: string) {
    return this.leads.findById(id);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateLeadStatusDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    if (!user) throw new ForbiddenException();
    return this.leads.updateStatus(id, dto.status, dto.note, user.id);
  }

  @Post(":id/comments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async addComment(
    @Param("id") id: string,
    @Body() dto: CreateLeadCommentDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    if (!user) throw new ForbiddenException();
    return this.leads.addComment(id, dto.body, user.id);
  }

  @Patch(":id/assign")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async assign(
    @Param("id") id: string,
    @Body() dto: AssignManagerDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    if (!user) throw new ForbiddenException();
    return this.leads.assignManager(id, dto.managerId ?? null, user.id);
  }
}
