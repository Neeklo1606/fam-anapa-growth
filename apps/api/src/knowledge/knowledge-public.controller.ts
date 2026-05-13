import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Body,
  Query,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import type { RetrieveKnowledgeDto } from "./dto/knowledge.dto";
import { KnowledgeService } from "./knowledge.service";

@Controller("knowledge")
export class KnowledgePublicController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  list() {
    return this.knowledge.listPublicBrief();
  }

  /** Полнотекстовый поиск по ключевым словам по опубликованным материалам. */
  @Get("search")
  @Throttle({ default: { limit: 45, ttl: 60_000 } })
  search(@Query("q") q?: string) {
    const s = typeof q === "string" ? q.trim() : "";
    if (s.length < 2) return [];
    return this.knowledge.searchPublished(s);
  }

  @Get("slug/:slug")
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async bySlug(@Param("slug") slug: string) {
    return this.knowledge.getPublishedBySlug(slug.trim().toLowerCase());
  }

  /**
   * RAG-retrieval: при наличии эмбеддингов чанков и OPENAI_API_KEY на API — cosine по semantic;
   * иначе — поиск по фрагментам чанков (ILIKE).
   */
  @Post("retrieve")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async retrieve(@Body() dto: RetrieveKnowledgeDto) {
    const limit = dto.limit ?? 5;
    return this.knowledge.retrieve(dto.query.trim(), limit);
  }
}
