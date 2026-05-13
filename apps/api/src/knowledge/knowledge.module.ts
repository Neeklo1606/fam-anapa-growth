import { Module } from "@nestjs/common";

import { SettingsModule } from "../settings/settings.module";

import { KnowledgeAdminController } from "./knowledge-admin.controller";
import { KnowledgePublicController } from "./knowledge-public.controller";
import { EmbeddingService } from "./embedding.service";
import { KnowledgeService } from "./knowledge.service";

@Module({
  imports: [SettingsModule],
  controllers: [KnowledgePublicController, KnowledgeAdminController],
  providers: [KnowledgeService, EmbeddingService],
  exports: [KnowledgeService, EmbeddingService],
})
export class KnowledgeModule {}
