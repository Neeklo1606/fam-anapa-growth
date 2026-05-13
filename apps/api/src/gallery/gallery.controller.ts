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

import {
  CreateGalleryItemDto,
  ReorderGalleryDto,
  UpdateGalleryItemDto,
} from "./dto/gallery.dto";
import { GalleryService } from "./gallery.service";

@Controller("gallery")
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Get()
  listPublic() {
    return this.gallery.listPublic();
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR", "VIEWER")
  listAdmin() {
    return this.gallery.listAdmin();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR", "VIEWER")
  getOne(@Param("id") id: string) {
    return this.gallery.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGalleryItemDto) {
    return this.gallery.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  update(@Param("id") id: string, @Body() dto: UpdateGalleryItemDto) {
    return this.gallery.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.gallery.remove(id);
  }

  @Post("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(@Body() dto: ReorderGalleryDto) {
    await this.gallery.reorder(dto);
  }
}
