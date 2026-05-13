import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "./embedding.service";
import type {
  CreateKnowledgeDocumentDto,
  UpdateKnowledgeDocumentDto,
} from "./dto/knowledge.dto";

const CHUNK_SOFT = 1400;
const CHUNK_HARD = 1800;

function hardSlice(s: string, maxLen: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += maxLen) {
    out.push(s.slice(i, i + maxLen));
  }
  return out;
}

/** Нарезка текста под RAG без LLM-токенайзера: абзацы, затем строки, затем по длине. */
export function splitBodyIntoChunks(body: string): string[] {
  const normalized = body.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const rawBlocks = normalized.split(/\n\s*\n/);
  const pieces: string[] = [];

  for (const block of rawBlocks) {
    const b = block.trim();
    if (!b) continue;

    const pushSized = (chunk: string) => {
      if (chunk.length <= CHUNK_HARD) {
        pieces.push(chunk);
        return;
      }
      pieces.push(...hardSlice(chunk, CHUNK_HARD));
    };

    if (b.length <= CHUNK_SOFT) {
      pushSized(b);
      continue;
    }

    const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      pushSized(b);
      continue;
    }

    let buf = "";
    const flushBuf = () => {
      const t = buf.trim();
      buf = "";
      if (!t) return;
      pushSized(t);
    };

    for (const line of lines) {
      if (!line) continue;
      if (buf.length + line.length + 1 <= CHUNK_SOFT) {
        buf += (buf ? "\n" : "") + line;
      } else {
        flushBuf();
        if (line.length <= CHUNK_SOFT) buf = line;
        else pushSized(line);
      }
    }
    flushBuf();
  }

  return pieces.map((s) => s.trim()).filter(Boolean);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length !== a.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "number");
}

export type RetrieveHit = {
  score: number;
  slug: string;
  title: string;
  excerpt: string;
};

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embedding: EmbeddingService,
  ) {}

  listPublicBrief() {
    return this.prisma.knowledgeDocument.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        sourceUrl: true,
        updatedAt: true,
      },
    });
  }

  async getPublishedBySlug(slug: string) {
    const doc = await this.prisma.knowledgeDocument.findFirst({
      where: { slug, published: true },
      select: {
        slug: true,
        title: true,
        summary: true,
        body: true,
        sourceUrl: true,
        meta: true,
        updatedAt: true,
      },
    });
    if (!doc) throw new NotFoundException("Document not found");
    return doc;
  }

  async searchPublished(qRaw: string) {
    const q = qRaw.trim().slice(0, 240);
    if (q.length < 2) return [];
    const parts = q.split(/\s+/).filter((p) => p.length >= 2).slice(0, 8);
    if (parts.length === 0) return [];

    return this.prisma.knowledgeDocument.findMany({
      where: {
        published: true,
        AND: parts.map((p) => ({
          OR: [
            { title: { contains: p, mode: "insensitive" } },
            { summary: { contains: p, mode: "insensitive" } },
            { body: { contains: p, mode: "insensitive" } },
          ],
        })),
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        slug: true,
        title: true,
        summary: true,
        sourceUrl: true,
        updatedAt: true,
      },
    });
  }

  async retrieve(query: string, limit: number): Promise<{ hits: RetrieveHit[] }> {
    const take = Math.min(Math.max(limit, 1), 20);
    const published = await this.prisma.knowledgeDocument.findMany({
      where: { published: true },
      select: { id: true, slug: true, title: true },
    });
    const idSet = new Set(published.map((d) => d.id));
    if (idSet.size === 0) return { hits: [] };

    const byId = new Map(published.map((d) => [d.id, d] as const));

    const chunks = await this.prisma.knowledgeChunk.findMany({
      where: { documentId: { in: [...idSet] } },
      select: {
        ordinal: true,
        content: true,
        embedding: true,
        documentId: true,
      },
      orderBy: [{ documentId: "asc" }, { ordinal: "asc" }],
    });

    const withVec = chunks.filter((c) => isNumberArray(c.embedding));
    const qVec =
      withVec.length > 0 && (await this.embedding.hasConfiguredKey())
        ? await this.embedding.embedOne(query)
        : null;

    if (qVec && withVec.length > 0) {
      const ranked = withVec
        .map((c) => ({
          score: cosineSimilarity(qVec, c.embedding as unknown as number[]),
          slug: byId.get(c.documentId)?.slug ?? "",
          title: byId.get(c.documentId)?.title ?? "",
          excerpt: c.content.slice(0, 400),
        }))
        .filter((r) => r.slug.length > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, take);
      return { hits: ranked };
    }

    const q = query.trim().slice(0, 240);
    const needles = q.split(/\s+/).filter((p) => p.length >= 3).slice(0, 6);
    const list = needles.length > 0 ? needles : [q.slice(0, Math.max(q.length, 2))];

    type Row = RetrieveHit & { documentId: string };
    const acc: Row[] = [];
    for (const needle of list) {
      const found = await this.prisma.knowledgeChunk.findMany({
        where: {
          documentId: { in: [...idSet] },
          content: { contains: needle, mode: "insensitive" },
        },
        take: take * 2,
        select: {
          documentId: true,
          content: true,
        },
      });
      for (const row of found) {
        const meta = byId.get(row.documentId);
        if (!meta) continue;
        acc.push({
          score: 0.5,
          slug: meta.slug,
          title: meta.title,
          excerpt: row.content.slice(0, 400),
          documentId: row.documentId,
        });
      }
    }

    const seen = new Set<string>();
    const dedup: RetrieveHit[] = [];
    for (const h of acc.sort(() => 0)) {
      const k = `${h.slug}:${h.excerpt.slice(0, 80)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      dedup.push({
        score: h.score,
        slug: h.slug,
        title: h.title,
        excerpt: h.excerpt,
      });
      if (dedup.length >= take) break;
    }
    return { hits: dedup };
  }

  listAdmin() {
    return this.prisma.knowledgeDocument.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        published: true,
        sourceUrl: true,
        updatedAt: true,
        createdAt: true,
        _count: { select: { chunks: true } },
      },
    });
  }

  async getAdmin(id: string) {
    const doc = await this.prisma.knowledgeDocument.findUnique({
      where: { id },
      include: {
        _count: { select: { chunks: true } },
      },
    });
    if (!doc) throw new NotFoundException("Document not found");

    const chunkRows = await this.prisma.knowledgeChunk.findMany({
      where: { documentId: id },
      select: { embedding: true },
    });
    const embeddedChunks = chunkRows.filter((r) =>
      isNumberArray(r.embedding),
    ).length;

    const { _count, ...rest } = doc;
    return {
      ...rest,
      chunkCount: _count.chunks,
      embeddedChunkCount: embeddedChunks,
    };
  }

  async create(dto: CreateKnowledgeDocumentDto) {
    try {
      const doc = await this.prisma.knowledgeDocument.create({
        data: {
          title: dto.title.trim(),
          slug: dto.slug.trim().toLowerCase(),
          summary: dto.summary?.trim() || null,
          body: dto.body.trim(),
          sourceUrl: dto.sourceUrl?.trim() || null,
          published: dto.published ?? false,
          ...(dto.meta !== undefined
            ? { meta: dto.meta as Prisma.InputJsonValue }
            : {}),
        },
      });
      await this.rebuildChunksInternal(doc.id, doc.body);
      return doc;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("slug already exists");
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateKnowledgeDocumentDto) {
    await this.ensureExists(id);

    const data: Prisma.KnowledgeDocumentUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.slug !== undefined) data.slug = dto.slug.trim().toLowerCase();
    if (dto.summary !== undefined)
      data.summary = dto.summary === null ? null : dto.summary.trim() || null;
    if (dto.body !== undefined) data.body = dto.body.trim();
    if (dto.sourceUrl !== undefined)
      data.sourceUrl = dto.sourceUrl === null ? null : dto.sourceUrl.trim() || null;
    if (dto.published !== undefined) data.published = dto.published;
    if (dto.meta !== undefined) {
      data.meta = dto.meta === null ? Prisma.DbNull : (dto.meta as Prisma.InputJsonValue);
    }

    try {
      const doc = await this.prisma.knowledgeDocument.update({
        where: { id },
        data,
      });
      if (dto.body !== undefined) {
        await this.rebuildChunksInternal(id, doc.body);
      }
      return doc;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("slug already exists");
      }
      throw e;
    }
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.knowledgeDocument.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const n = await this.prisma.knowledgeDocument.count({ where: { id } });
    if (!n) throw new NotFoundException("Document not found");
  }

  /** Пересборка чанков (эмбеддинги сбрасываются). */
  async rebuildChunks(id: string) {
    const doc = await this.prisma.knowledgeDocument.findUnique({
      where: { id },
      select: { body: true },
    });
    if (!doc) throw new NotFoundException("Document not found");
    await this.rebuildChunksInternal(id, doc.body);
    return { ok: true };
  }

  private async rebuildChunksInternal(documentId: string, body: string) {
    await this.prisma.$transaction([
      this.prisma.knowledgeChunk.deleteMany({ where: { documentId } }),
    ]);

    const parts = splitBodyIntoChunks(body);
    if (parts.length === 0) return;

    await this.prisma.knowledgeChunk.createMany({
      data: parts.map((content, ordinal) => ({
        documentId,
        ordinal,
        content,
      })),
    });
  }

  /** Заполняет `embedding` у чанков документа; нужен OPENAI_API_KEY на API. */
  async refreshEmbeddings(documentId: string) {
    if (!(await this.embedding.hasConfiguredKey())) {
      return {
        ok: false,
        message:
          "API-ключ не настроен: задайте в админке /admin/settings/ai или OPENAI_API_KEY в .env",
        updated: 0,
      };
    }

    await this.ensureExists(documentId);

    const chunks = await this.prisma.knowledgeChunk.findMany({
      where: { documentId },
      orderBy: { ordinal: "asc" },
      select: { id: true, content: true },
    });
    if (chunks.length === 0) return { ok: true, updated: 0 };

    const vectors = await this.embedding.embedTexts(chunks.map((c) => c.content));
    const updated = vectors.filter((v) => v && v.length > 0).length;

    await this.prisma.$transaction(
      vectors.map((vec, idx) => {
        const chunk = chunks[idx]!;
        const data =
          vec && vec.length > 0
            ? { embedding: vec as unknown as Prisma.InputJsonValue }
            : { embedding: Prisma.DbNull };
        return this.prisma.knowledgeChunk.update({
          where: { id: chunk.id },
          data,
        });
      }),
    );

    return { ok: true, updated };
  }
}
