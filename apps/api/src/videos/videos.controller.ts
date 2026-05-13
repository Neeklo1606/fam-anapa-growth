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
  CreateVideoDto,
  ReorderVideosDto,
  UpdateVideoDto,
} from "./dto/video.dto";
import { VideosService } from "./videos.service";

@Controller("videos")
export class VideosController {
  constructor(private readonly videos: VideosService) {}

  @Get()
  listPublic() {
    return this.videos.listPublic();
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR", "VIEWER")
  listAdmin() {
    return this.videos.listAdmin();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR", "VIEWER")
  getOne(@Param("id") id: string) {
    return this.videos.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVideoDto) {
    return this.videos.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  update(@Param("id") id: string, @Body() dto: UpdateVideoDto) {
    return this.videos.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.videos.remove(id);
  }

  @Post("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(@Body() dto: ReorderVideosDto) {
    await this.videos.reorder(dto);
  }
}
