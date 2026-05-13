import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedUser } from "../auth/auth.types";

import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles("ADMIN")
  async list() {
    return this.users.listAll();
  }

  @Get(":id")
  @Roles("ADMIN")
  async getOne(@Param("id") id: string) {
    const u = await this.users.findByIdSafe(id);
    if (!u) throw new NotFoundException();
    return u;
  }

  @Post()
  @Roles("ADMIN")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(":id")
  @Roles("ADMIN")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser | null,
  ) {
    if (!actor) throw new ForbiddenException();
    return this.users.update(id, actor.id, dto);
  }

  @Post(":id/reset-password")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Param("id") id: string, @Body() dto: ResetPasswordDto) {
    await this.users.resetPassword(id, dto.password);
  }
}
