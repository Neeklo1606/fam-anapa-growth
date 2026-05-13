import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import type {
  CreateKnowledgeDocumentDto,
  UpdateKnowledgeDocumentDto,
} from "./dto/knowledge.dto";
import { KnowledgeService } from "./knowledge.service";

@Controller("knowledge/admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class KnowledgeAdminController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  @Roles("ADMIN", "EDITOR", "VIEWER")
  list() {
    return this.knowledge.listAdmin();
  }

  @Get(":id")
  @Roles("ADMIN", "EDITOR", "VIEWER")
  one(@Param("id") id: string) {
    return this.knowledge.getAdmin(id);
  }

  @Post()
  @Roles("ADMIN", "EDITOR")
  create(@Body() dto: CreateKnowledgeDocumentDto) {
    return this.knowledge.create(dto);
  }

  @Patch(":id")
  @Roles("ADMIN", "EDITOR")
  update(@Param("id") id: string, @Body() dto: UpdateKnowledgeDocumentDto) {
    return this.knowledge.update(id, dto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.knowledge.remove(id);
  }

  @Post(":id/chunks/rebuild")
  @Roles("ADMIN", "EDITOR")
  rebuildChunks(@Param("id") id: string) {
    return this.knowledge.rebuildChunks(id);
  }

  /** Запрос эмбеддингов во внешний провайдер (OpenAI при OPENAI_API_KEY). */
  @Post(":id/embeddings")
  @Roles("ADMIN", "EDITOR")
  refreshEmbeddings(@Param("id") id: string) {
    return this.knowledge.refreshEmbeddings(id);
  }
}
