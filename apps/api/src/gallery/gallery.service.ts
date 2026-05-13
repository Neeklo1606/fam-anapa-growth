import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import {
  CreateGalleryItemDto,
  ReorderGalleryDto,
  UpdateGalleryItemDto,
} from "./dto/gallery.dto";

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  mapPublicItem(m: {
    id: string;
    alt: string;
    title: string | null;
    order: number;
    media: { url: string; webpUrl: string | null };
  }) {
    return {
      id: m.id,
      src: m.media.webpUrl ?? m.media.url,
      label: m.title?.trim() || m.alt,
      alt: m.alt,
    };
  }

  async listPublic() {
    const rows = await this.prisma.galleryItem.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { media: { select: { url: true, webpUrl: true } } },
    });
    return rows.map((r) => this.mapPublicItem(r));
  }

  async listAdmin() {
    return this.prisma.galleryItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        media: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true, mime: true },
        },
      },
    });
  }

  async findById(id: string) {
    const g = await this.prisma.galleryItem.findUnique({
      where: { id },
      include: {
        media: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
    if (!g) throw new NotFoundException("Элемент галереи не найден");
    return g;
  }

  async create(dto: CreateGalleryItemDto) {
    const maxOrder = await this.prisma.galleryItem.aggregate({ _max: { order: true } });
    const nextOrder = dto.order ?? (maxOrder._max.order ?? -1) + 1;
    return this.prisma.galleryItem.create({
      data: {
        mediaId: dto.mediaId,
        alt: dto.alt.trim(),
        title: dto.title?.trim() ?? null,
        category: dto.category ?? "OTHER",
        order: nextOrder,
        active: dto.active ?? true,
      },
      include: {
        media: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateGalleryItemDto) {
    await this.findById(id);
    return this.prisma.galleryItem.update({
      where: { id },
      data: {
        mediaId: dto.mediaId,
        alt: dto.alt?.trim(),
        title: dto.title === undefined ? undefined : dto.title?.trim() || null,
        category: dto.category,
        order: dto.order,
        active: dto.active,
      },
      include: {
        media: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.galleryItem.delete({ where: { id } });
  }

  async reorder(dto: ReorderGalleryDto) {
    await this.prisma.$transaction(
      dto.items.map((i) =>
        this.prisma.galleryItem.update({ where: { id: i.id }, data: { order: i.order } }),
      ),
    );
  }
}
