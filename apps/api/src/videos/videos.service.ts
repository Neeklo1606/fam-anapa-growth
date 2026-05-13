import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import {
  CreateVideoDto,
  ReorderVideosDto,
  UpdateVideoDto,
} from "./dto/video.dto";

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  posterPublic(poster: { webpUrl: string | null; url: string } | null, posterUrl: string | null) {
    return poster?.webpUrl ?? poster?.url ?? posterUrl ?? null;
  }

  async listPublic() {
    const rows = await this.prisma.video.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { poster: { select: { url: true, webpUrl: true } } },
    });
    return rows.map((v) => ({
      id: v.id,
      title: v.title,
      url: v.url,
      posterUrl: this.posterPublic(v.poster, v.posterUrl),
      description: v.description,
      order: v.order,
    }));
  }

  async listAdmin() {
    return this.prisma.video.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        poster: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
  }

  async findById(id: string) {
    const v = await this.prisma.video.findUnique({
      where: { id },
      include: {
        poster: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
    if (!v) throw new NotFoundException("Видео не найдено");
    return v;
  }

  async create(dto: CreateVideoDto) {
    const maxOrder = await this.prisma.video.aggregate({ _max: { order: true } });
    const nextOrder = dto.order ?? (maxOrder._max.order ?? -1) + 1;
    return this.prisma.video.create({
      data: {
        title: dto.title.trim(),
        url: dto.url.trim(),
        posterMediaId: dto.posterMediaId ?? null,
        posterUrl: dto.posterUrl?.trim() ?? null,
        description: dto.description ?? null,
        order: nextOrder,
        active: dto.active ?? true,
      },
      include: {
        poster: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateVideoDto) {
    await this.findById(id);
    return this.prisma.video.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        url: dto.url?.trim(),
        posterMediaId: dto.posterMediaId === undefined ? undefined : dto.posterMediaId,
        posterUrl:
          dto.posterUrl === undefined ? undefined : dto.posterUrl === null ? null : dto.posterUrl.trim() || null,
        description:
          dto.description === undefined ? undefined : dto.description === null ? null : dto.description.trim() || null,
        order: dto.order,
        active: dto.active,
      },
      include: {
        poster: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.video.delete({ where: { id } });
  }

  async reorder(dto: ReorderVideosDto) {
    await this.prisma.$transaction(
      dto.items.map((i) =>
        this.prisma.video.update({ where: { id: i.id }, data: { order: i.order } }),
      ),
    );
  }
}
