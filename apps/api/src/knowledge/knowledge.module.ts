import { Module } from "@nestjs/common";

import { KnowledgeAdminController } from "./knowledge-admin.controller";
import { KnowledgePublicController } from "./knowledge-public.controller";
import { EmbeddingService } from "./embedding.service";
import { KnowledgeService } from "./knowledge.service";

@Module({
  controllers: [KnowledgePublicController, KnowledgeAdminController],
  providers: [KnowledgeService, EmbeddingService],
  exports: [KnowledgeService, EmbeddingService],
})
export class KnowledgeModule {}
