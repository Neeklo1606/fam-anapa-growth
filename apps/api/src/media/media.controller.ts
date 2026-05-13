import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IsOptional, IsString, MaxLength } from "class-validator";
import type { MediaKind } from "@prisma/client";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { MediaService } from "./media.service";

class UpdateAltDto {
  @IsOptional() @IsString() @MaxLength(300) altDefault?: string | null;
}

@Controller("media")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @Roles("ADMIN", "EDITOR", "VIEWER", "MANAGER")
  list(
    @Query("page") pageRaw?: string,
    @Query("limit") limitRaw?: string,
    @Query("kind") kind?: MediaKind,
  ) {
    const page = pageRaw ? Number(pageRaw) : 1;
    const limit = limitRaw ? Number(limitRaw) : 30;
    return this.media.list({ page, limit, kind });
  }

  @Get(":id")
  @Roles("ADMIN", "EDITOR", "VIEWER", "MANAGER")
  getOne(@Param("id") id: string) {
    return this.media.findById(id);
  }

  @Post("upload")
  @Roles("ADMIN", "EDITOR", "MANAGER")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 12 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("alt") alt?: string,
  ) {
    if (!file) throw new BadRequestException("Файл не получен");
    return this.media.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mime: file.mimetype,
      sizeBytes: file.size,
      alt,
    });
  }

  @Patch(":id")
  @Roles("ADMIN", "EDITOR", "MANAGER")
  updateAlt(@Param("id") id: string, @Body() dto: UpdateAltDto) {
    return this.media.updateAlt(id, dto.altDefault ?? null);
  }

  @Delete(":id")
  @Roles("ADMIN", "EDITOR", "MANAGER")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.media.remove(id);
  }
}
