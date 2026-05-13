import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    return this.prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  async update(patch: UpdateSettingsDto) {
    return this.prisma.siteSettings.upsert({
      where: { id: 1 },
      update: patch,
      create: { id: 1, ...patch },
    });
  }
}
