import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { toSanitizedHomeJson } from "./home-content.sanitize";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    return this.prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
      include: {
        logoMedia: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
  }

  async update(patch: UpdateSettingsDto) {
    return this.prisma.siteSettings.upsert({
      where: { id: 1 },
      update: patch,
      create: { id: 1, ...patch },
      include: {
        logoMedia: {
          select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true },
        },
      },
    });
  }

  private async ensureRow() {
    await this.prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  async getHomeContentRaw() {
    await this.ensureRow();
    const r = await this.prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: { homeContent: true },
    });
    return { homeContent: r?.homeContent ?? null };
  }

  async patchHomeContent(payload: Record<string, unknown>) {
    const homeContent = toSanitizedHomeJson(payload);
    await this.ensureRow();
    await this.prisma.siteSettings.update({
      where: { id: 1 },
      data: { homeContent },
    });
    return { ok: true as const };
  }
}
