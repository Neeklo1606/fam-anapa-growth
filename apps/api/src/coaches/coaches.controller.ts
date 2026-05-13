import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { CoachesService } from "./coaches.service";
import {
  CreateCoachDto,
  ReorderCoachesDto,
  UpdateCoachDto,
} from "./dto/coach.dto";

@Controller("coaches")
export class CoachesController {
  constructor(private readonly coaches: CoachesService) {}

  // ────────────── PUBLIC ──────────────
  @Get()
  list() {
    return this.coaches.listPublic();
  }

  // ────────────── ADMIN ──────────────
  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR", "VIEWER")
  listAdmin() {
    return this.coaches.listAdmin();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR", "VIEWER")
  getOne(@Param("id") id: string) {
    return this.coaches.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  create(@Body() dto: CreateCoachDto) {
    return this.coaches.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  update(@Param("id") id: string, @Body() dto: UpdateCoachDto) {
    return this.coaches.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.coaches.remove(id);
  }

  @Post("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(@Body() dto: ReorderCoachesDto) {
    await this.coaches.reorder(dto);
  }
}
