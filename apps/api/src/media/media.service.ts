import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { MediaKind, Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);
const MAX_BYTES = 12 * 1024 * 1024; // 12MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private uploadsDir(): string {
    return (
      this.config.get<string>("UPLOADS_DIR") ??
      path.resolve(process.cwd(), "..", "..", "uploads")
    );
  }

  private publicBase(): string {
    return this.config.get<string>("MEDIA_PUBLIC_BASE") ?? "/uploads";
  }

  async upload(input: {
    buffer: Buffer;
    originalName: string;
    mime: string;
    sizeBytes: number;
    alt?: string;
  }) {
    if (input.sizeBytes > MAX_BYTES) {
      throw new BadRequestException(`Файл слишком большой (>${MAX_BYTES / 1024 / 1024}MB)`);
    }
    if (!input.mime.startsWith("image/")) {
      throw new BadRequestException("Поддерживаются только изображения");
    }
    if (!ALLOWED_IMAGE_MIMES.has(input.mime)) {
      throw new BadRequestException(`Неподдерживаемый формат: ${input.mime}`);
    }

    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const baseDir = path.join(this.uploadsDir(), yyyy, mm);
    const thumbDir = path.join(baseDir, "thumb");
    await fs.mkdir(thumbDir, { recursive: true });

    const id = randomUUID();
    const safeExt = this.extFromMime(input.mime) || this.extFromName(input.originalName) || "bin";
    const isSvg = input.mime === "image/svg+xml";
    const originalRel = path.posix.join(yyyy, mm, `${id}.${safeExt}`);
    const originalAbs = path.join(baseDir, `${id}.${safeExt}`);
    await fs.writeFile(originalAbs, input.buffer);

    let width: number | null = null;
    let height: number | null = null;
    let webpRel: string | null = null;
    let thumbRel: string | null = null;

    if (!isSvg) {
      try {
        const img = sharp(input.buffer, { failOn: "none" });
        const meta = await img.metadata();
        width = meta.width ?? null;
        height = meta.height ?? null;

        const webpOpts =
          meta.hasAlpha === true ? { quality: 88 as const, alphaQuality: 100 as const } : { quality: 82 as const };
        const webpAbs = path.join(baseDir, `${id}.webp`);
        await img.clone().webp(webpOpts).toFile(webpAbs);
        webpRel = path.posix.join(yyyy, mm, `${id}.webp`);

        const thumbOpts =
          meta.hasAlpha === true ? { quality: 78 as const, alphaQuality: 100 as const } : { quality: 78 as const };

        const thumbAbs = path.join(thumbDir, `${id}.webp`);
        await img
          .clone()
          .resize({ width: 320, height: 320, fit: "cover", position: "centre" })
          .webp(thumbOpts)
          .toFile(thumbAbs);
        thumbRel = path.posix.join(yyyy, mm, "thumb", `${id}.webp`);
      } catch (e) {
        this.logger.warn(`sharp processing failed: ${(e as Error).message}`);
      }
    }

    const base = this.publicBase().replace(/\/$/, "");
    return this.prisma.mediaFile.create({
      data: {
        url: `${base}/${originalRel}`,
        webpUrl: webpRel ? `${base}/${webpRel}` : null,
        thumbUrl: thumbRel ? `${base}/${thumbRel}` : null,
        mime: input.mime,
        kind: "IMAGE" as MediaKind,
        width,
        height,
        sizeBytes: input.sizeBytes,
        altDefault: input.alt?.trim() || null,
        storagePath: originalRel,
      },
    });
  }

  async list(options: { page?: number; limit?: number; kind?: MediaKind } = {}) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 30));
    const skip = (page - 1) * limit;
    const where: Prisma.MediaFileWhereInput = options.kind ? { kind: options.kind } : {};
    const [items, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.mediaFile.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    const m = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!m) throw new NotFoundException("Файл не найден");
    return m;
  }

  async updateAlt(id: string, altDefault: string | null) {
    await this.findById(id);
    return this.prisma.mediaFile.update({
      where: { id },
      data: { altDefault },
    });
  }

  async remove(id: string) {
    const m = await this.findById(id);
    const usedAsCoach = await this.prisma.coach.count({ where: { photoMediaId: id } });
    const usedAsGallery = await this.prisma.galleryItem.count({ where: { mediaId: id } });
    const usedAsVideo = await this.prisma.video.count({ where: { posterMediaId: id } });
    const usedAsSiteLogo = await this.prisma.siteSettings.count({
      where: { logoMediaId: id },
    });
    if (usedAsSiteLogo > 0) {
      throw new ConflictException("Это изображение задано как логотип сайта — смените логотип в «Настройках».");
    }
    if (usedAsCoach + usedAsGallery + usedAsVideo > 0) {
      throw new ConflictException("Файл используется в сущностях, сначала отвяжите его");
    }
    if (m.storagePath) {
      const candidates = [
        path.join(this.uploadsDir(), m.storagePath),
        m.webpUrl ? path.join(this.uploadsDir(), m.webpUrl.replace(this.publicBase(), "").replace(/^\//, "")) : null,
        m.thumbUrl ? path.join(this.uploadsDir(), m.thumbUrl.replace(this.publicBase(), "").replace(/^\//, "")) : null,
      ].filter(Boolean) as string[];
      await Promise.all(
        candidates.map((p) => fs.unlink(p).catch(() => undefined)),
      );
    }
    await this.prisma.mediaFile.delete({ where: { id } });
  }

  private extFromMime(mime: string): string | null {
    const map: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
      "image/gif": "gif",
      "image/svg+xml": "svg",
    };
    return map[mime] ?? null;
  }
  private extFromName(name: string): string | null {
    const m = /\.([a-z0-9]+)$/i.exec(name);
    return m && m[1] ? m[1].toLowerCase() : null;
  }
}
