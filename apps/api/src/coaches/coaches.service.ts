import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import {
  CreateCoachDto,
  ReorderCoachesDto,
  UpdateCoachDto,
} from "./dto/coach.dto";

@Injectable()
export class CoachesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic() {
    const rows = await this.prisma.coach.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { photo: true },
    });
    return rows.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      role: c.role,
      photoUrl: c.photo?.webpUrl ?? c.photo?.url ?? c.photoUrl ?? null,
      photoAlt: c.photo?.altDefault ?? c.fullName,
      education: c.education,
      license: c.license,
      experience: c.experience,
      shortDescription: c.shortDescription,
      fullDescription: c.fullDescription,
      order: c.order,
    }));
  }

  async listAdmin() {
    return this.prisma.coach.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        photo: { select: { id: true, url: true, webpUrl: true, thumbUrl: true, altDefault: true } },
      },
    });
  }

  async findById(id: string) {
    const c = await this.prisma.coach.findUnique({ where: { id } });
    if (!c) throw new NotFoundException("Тренер не найден");
    return c;
  }

  async create(dto: CreateCoachDto) {
    const maxOrder = await this.prisma.coach.aggregate({ _max: { order: true } });
    const nextOrder = dto.order ?? (maxOrder._max.order ?? -1) + 1;
    return this.prisma.coach.create({
      data: {
        fullName: dto.fullName.trim(),
        role: dto.role.trim(),
        shortDescription: dto.shortDescription.trim(),
        photoUrl: dto.photoUrl?.trim() ?? null,
        photoMediaId: dto.photoMediaId ?? null,
        education: dto.education ?? null,
        license: dto.license ?? null,
        experience: dto.experience ?? null,
        fullDescription: dto.fullDescription ?? null,
        order: nextOrder,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCoachDto) {
    await this.findById(id);
    return this.prisma.coach.update({
      where: { id },
      data: {
        fullName: dto.fullName?.trim(),
        role: dto.role?.trim(),
        shortDescription: dto.shortDescription?.trim(),
        photoUrl: dto.photoUrl === undefined ? undefined : dto.photoUrl?.trim() || null,
        photoMediaId: dto.photoMediaId === undefined ? undefined : dto.photoMediaId,
        education: dto.education,
        license: dto.license,
        experience: dto.experience,
        fullDescription: dto.fullDescription,
        order: dto.order,
        active: dto.active,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.coach.delete({ where: { id } });
  }

  async reorder(dto: ReorderCoachesDto) {
    await this.prisma.$transaction(
      dto.items.map((i) =>
        this.prisma.coach.update({ where: { id: i.id }, data: { order: i.order } }),
      ),
    );
  }
}
