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
import type { MediaFile as MediaRow, MediaKind, Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import {
  classifyBundledFileBasename,
  encodeBundledMediaId,
  isSafeBundledRelativePath,
  scanBundledPublicFiles,
  tryDecodeBundledMediaId,
  type ScannedBundledFile,
} from "./bundled-public-assets";

type ListedMediaDto = MediaRow & { fromBundle: boolean };

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);
const ALLOWED_VIDEO_MIMES = new Set(["video/mp4", "video/webm"]);
const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12MB
const MAX_VIDEO_BYTES = 120 * 1024 * 1024; // 120MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  /** Cached absolute path to `apps/web/public` (or SITE_STATIC_PUBLIC_DIR), or null if missing */
  private bundledPublicRootMemo: string | null | undefined = undefined;

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
    if (ALLOWED_VIDEO_MIMES.has(input.mime)) {
      if (input.sizeBytes > MAX_VIDEO_BYTES) {
        throw new BadRequestException(`Видео слишком большое (>${MAX_VIDEO_BYTES / 1024 / 1024}MB)`);
      }
      return this.persistVideoUpload(input);
    }

    if (input.sizeBytes > MAX_IMAGE_BYTES) {
      throw new BadRequestException(`Файл слишком большой (>${MAX_IMAGE_BYTES / 1024 / 1024}MB)`);
    }
    if (!input.mime.startsWith("image/")) {
      throw new BadRequestException("Поддерживаются только изображения и видео (MP4, WebM)");
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

  private async persistVideoUpload(input: {
    buffer: Buffer;
    originalName: string;
    mime: string;
    sizeBytes: number;
    alt?: string;
  }) {
    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const baseDir = path.join(this.uploadsDir(), yyyy, mm);
    await fs.mkdir(baseDir, { recursive: true });
    const id = randomUUID();
    const safeExt =
      this.extFromVideoMime(input.mime) ?? this.extFromName(input.originalName) ?? "mp4";
    const originalRel = path.posix.join(yyyy, mm, `${id}.${safeExt}`);
    const originalAbs = path.join(baseDir, `${id}.${safeExt}`);
    await fs.writeFile(originalAbs, input.buffer);
    const base = this.publicBase().replace(/\/$/, "");
    return this.prisma.mediaFile.create({
      data: {
        url: `${base}/${originalRel}`,
        webpUrl: null,
        thumbUrl: null,
        mime: input.mime,
        kind: "VIDEO" as MediaKind,
        width: null,
        height: null,
        sizeBytes: input.sizeBytes,
        altDefault: input.alt?.trim() || null,
        storagePath: originalRel,
      },
    });
  }

  private async resolveBundledPublicRoot(): Promise<string | null> {
    if (this.bundledPublicRootMemo !== undefined) return this.bundledPublicRootMemo;
    const fromEnv = this.config.get<string>("SITE_STATIC_PUBLIC_DIR")?.trim();
    const candidates: string[] = [];
    if (fromEnv) candidates.push(path.resolve(fromEnv));
    candidates.push(
      path.resolve(process.cwd(), "..", "web", "public"),
      path.resolve(process.cwd(), "..", "..", "apps", "web", "public"),
      path.resolve(process.cwd(), "apps", "web", "public"),
    );
    for (const dir of candidates) {
      try {
        const st = await fs.stat(dir);
        if (st.isDirectory()) {
          this.logger.log(`Bundled site media scanned from ${dir}`);
          this.bundledPublicRootMemo = dir;
          return dir;
        }
      } catch {
        /* try next */
      }
    }
    this.logger.warn("SITE_STATIC_PUBLIC_DIR / apps/web/public not found — bundle media list skipped");
    this.bundledPublicRootMemo = null;
    return null;
  }

  private bundledRowToListedDto(s: ScannedBundledFile): ListedMediaDto {
    const createdAt = new Date(s.mtimeMs);
    const updatedAt = new Date(s.mtimeMs);
    return {
      id: encodeBundledMediaId(s.relPosix),
      url: `/${s.relPosix}`,
      webpUrl: null,
      thumbUrl: null,
      mime: s.mime,
      kind: s.kind,
      width: null,
      height: null,
      sizeBytes: s.sizeBytes,
      altDefault: s.relPosix,
      storagePath: null,
      createdAt,
      updatedAt,
      fromBundle: true,
    };
  }

  async list(options: {
    page?: number;
    limit?: number;
    kind?: MediaKind;
    /** If false — only uploaded files (same as legacy). Default true — merges `public/` bundle assets first. */
    includeBundles?: boolean;
  } = {}) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 30));
    const skip = (page - 1) * limit;
    const where: Prisma.MediaFileWhereInput = options.kind ? { kind: options.kind } : {};
    const includeBundles = options.includeBundles !== false;

    if (!includeBundles) {
      const [items, total] = await Promise.all([
        this.prisma.mediaFile.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        this.prisma.mediaFile.count({ where }),
      ]);
      const withFlag = items.map((row) =>
        ({ ...row, fromBundle: false }) as ListedMediaDto,
      );
      return { items: withFlag as unknown[], total, page, limit };
    }

    let bundledRows: ListedMediaDto[] = [];
    const bundledRoot = await this.resolveBundledPublicRoot();
    if (bundledRoot) {
      const scanned = await scanBundledPublicFiles(bundledRoot);
      const filtered =
        options.kind !== undefined ? scanned.filter((row) => row.kind === options.kind) : scanned;
      bundledRows = filtered.map((s) => this.bundledRowToListedDto(s));
    }

    const bLen = bundledRows.length;
    const dbTotal = await this.prisma.mediaFile.count({ where });
    const total = bLen + dbTotal;

    let pageItems: ListedMediaDto[];

    if (skip < bLen) {
      const fromB = bundledRows.slice(skip, skip + limit);
      const need = limit - fromB.length;
      if (need > 0) {
        const dbSlice = await this.prisma.mediaFile.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: 0,
          take: need,
        });
        pageItems = [
          ...fromB,
          ...dbSlice.map((row) => ({ ...row, fromBundle: false }) as ListedMediaDto),
        ];
      } else {
        pageItems = fromB;
      }
    } else {
      const dbSkip = skip - bLen;
      const dbSlice = await this.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: dbSkip,
        take: limit,
      });
      pageItems = dbSlice.map((row) => ({ ...row, fromBundle: false }) as ListedMediaDto);
    }

    return { items: pageItems as unknown[], total, page, limit };
  }

  private async bundledFileDtoFromRelative(relPosix: string): Promise<ListedMediaDto | null> {
    const bundledRoot = await this.resolveBundledPublicRoot();
    if (!bundledRoot || !isSafeBundledRelativePath(relPosix, bundledRoot)) return null;
    const absTarget = path.join(bundledRoot, ...relPosix.split("/"));
    try {
      const st = await fs.stat(absTarget);
      if (!st.isFile()) return null;
      const base = path.basename(relPosix);
      const scanned = classifyBundledFileBasename(base);
      if (!scanned) return null;
      return this.bundledRowToListedDto({
        relPosix,
        mime: scanned.mime,
        kind: scanned.kind,
        sizeBytes: st.size,
        mtimeMs: st.mtimeMs,
      });
    } catch {
      return null;
    }
  }

  async findById(id: string): Promise<ListedMediaDto> {
    const relDecoded = tryDecodeBundledMediaId(id);
    if (relDecoded) {
      const dto = await this.bundledFileDtoFromRelative(relDecoded);
      if (dto) return dto;
      throw new NotFoundException("Файл не найден");
    }
    const m = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!m) throw new NotFoundException("Файл не найден");
    return { ...m, fromBundle: false };
  }

  async updateAlt(id: string, altDefault: string | null) {
    if (tryDecodeBundledMediaId(id)) {
      throw new ConflictException("Файлы из папки public сайта здесь недоступны для правки метаданных.");
    }
    const exists = await this.prisma.mediaFile.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException("Файл не найден");
    return this.prisma.mediaFile.update({
      where: { id },
      data: { altDefault },
    });
  }

  async remove(id: string) {
    if (tryDecodeBundledMediaId(id)) {
      throw new ConflictException(
        "Файлы из папки public сайта удаляются только при изменении сборки и деплое — не через медиатеку.",
      );
    }
    const m = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!m) throw new NotFoundException("Файл не найден");
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

  private extFromVideoMime(mime: string): string | null {
    const map: Record<string, string> = {
      "video/mp4": "mp4",
      "video/webm": "webm",
    };
    return map[mime] ?? null;
  }
  private extFromName(name: string): string | null {
    const m = /\.([a-z0-9]+)$/i.exec(name);
    return m && m[1] ? m[1].toLowerCase() : null;
  }
}
