import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Lead, LeadStatus, Prisma } from "@prisma/client";

import { NotificationsQueueService } from "../notifications/notifications-queue.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";

function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;
  return "+" + digits.slice(0, 11);
}

export type LeadListFilters = {
  page?: number;
  limit?: number;
  status?: LeadStatus | "ALL";
  search?: string;
  assignedManagerId?: string | "unassigned";
};

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsQueue: NotificationsQueueService,
  ) {}

  async create(
    dto: CreateLeadDto,
    meta: { ip?: string | null; userAgent?: string | null },
  ): Promise<Lead> {
    const data: Prisma.LeadCreateInput = {
      parentName: dto.parentName.trim(),
      childName: dto.childName.trim(),
      childBirthDate: dto.childBirthDate ? new Date(dto.childBirthDate) : null,
      childAge: dto.childAge ?? null,
      phone: normalizePhone(dto.phone),
      email: dto.email?.trim() || null,
      telegram: dto.telegram?.trim() || null,
      whatsapp: dto.whatsapp?.trim() || null,
      direction: dto.direction?.trim() || null,
      experienceLevel: dto.experienceLevel ?? "NONE",
      comment: dto.comment?.trim() || null,
      privacyAccepted: dto.privacyAccepted,
      source: dto.source ?? "website",
      landingPage: dto.landingPage ?? null,
      utmSource: dto.utm?.source ?? null,
      utmMedium: dto.utm?.medium ?? null,
      utmCampaign: dto.utm?.campaign ?? null,
      utmContent: dto.utm?.content ?? null,
      utmTerm: dto.utm?.term ?? null,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
      status: "NEW",
      history: {
        create: {
          fromStatus: null,
          toStatus: "NEW",
          note: "Auto: created via public form",
        },
      },
    };

    const lead = await this.prisma.lead.create({ data });
    this.logger.log(
      `Lead created id=${lead.id} parent=${lead.parentName} phone=${lead.phone} source=${lead.source}`,
    );

    void this.notificationsQueue.enqueueLeadCreated(lead.id).catch((err: Error) => {
      this.logger.warn(`Очередь уведомлений по заявке ${lead.id}: ${err.message}`);
    });

    return lead;
  }

  async list(filters: LeadListFilters = {}): Promise<{
    items: Lead[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 25));
    const where: Prisma.LeadWhereInput = { archived: false };
    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }
    if (filters.assignedManagerId === "unassigned") {
      where.assignedManagerId = null;
    } else if (filters.assignedManagerId) {
      where.assignedManagerId = filters.assignedManagerId;
    }
    if (filters.search && filters.search.trim().length >= 2) {
      const q = filters.search.trim();
      where.OR = [
        { parentName: { contains: q, mode: "insensitive" } },
        { childName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
        { telegram: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignedManager: { select: { id: true, fullName: true, email: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignedManager: { select: { id: true, fullName: true, email: true } },
        history: {
          orderBy: { createdAt: "desc" },
          include: { changedBy: { select: { id: true, fullName: true } } },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { id: true, fullName: true } } },
        },
      },
    });
    if (!lead) throw new NotFoundException("Заявка не найдена");
    return lead;
  }

  async updateStatus(
    id: string,
    next: LeadStatus,
    note: string | undefined,
    changedById: string,
  ): Promise<Lead> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException("Заявка не найдена");
    if (lead.status === next) return lead;

    const [updated] = await this.prisma.$transaction([
      this.prisma.lead.update({
        where: { id },
        data: { status: next },
      }),
      this.prisma.leadStatusHistory.create({
        data: {
          leadId: id,
          fromStatus: lead.status,
          toStatus: next,
          changedById,
          note: note ?? null,
        },
      }),
    ]);
    return updated;
  }

  async addComment(leadId: string, body: string, authorId: string) {
    await this.findById(leadId);
    return this.prisma.leadComment.create({
      data: { leadId, body, authorId },
      include: { author: { select: { id: true, fullName: true } } },
    });
  }

  async assignManager(leadId: string, managerId: string | null, changedById: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException("Заявка не найдена");
    const updated = await this.prisma.lead.update({
      where: { id: leadId },
      data: { assignedManagerId: managerId },
    });
    await this.prisma.leadStatusHistory.create({
      data: {
        leadId,
        fromStatus: lead.status,
        toStatus: lead.status,
        changedById,
        note: managerId ? `Назначен менеджер ${managerId}` : "Менеджер снят",
      },
    });
    return updated;
  }

  async exportCsv(filters: Pick<LeadListFilters, "status" | "search">): Promise<string> {
    const { items } = await this.list({ ...filters, page: 1, limit: 5000 });
    const head = [
      "id",
      "createdAt",
      "status",
      "parentName",
      "childName",
      "childBirthDate",
      "phone",
      "email",
      "telegram",
      "whatsapp",
      "direction",
      "experienceLevel",
      "source",
      "landingPage",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "assignedManagerId",
      "comment",
    ];
    const rows = items.map((it) => [
      it.id,
      it.createdAt.toISOString(),
      it.status,
      it.parentName,
      it.childName,
      it.childBirthDate ? it.childBirthDate.toISOString().slice(0, 10) : "",
      it.phone,
      it.email ?? "",
      it.telegram ?? "",
      it.whatsapp ?? "",
      it.direction ?? "",
      it.experienceLevel,
      it.source ?? "",
      it.landingPage ?? "",
      it.utmSource ?? "",
      it.utmMedium ?? "",
      it.utmCampaign ?? "",
      it.assignedManagerId ?? "",
      (it.comment ?? "").replace(/"/g, '""'),
    ]);
    const escape = (cell: unknown): string => {
      const s = String(cell ?? "");
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [head.join(","), ...rows.map((r) => r.map(escape).join(","))];
    return "\uFEFF" + lines.join("\r\n");
  }
}
