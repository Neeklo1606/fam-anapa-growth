import { Injectable } from "@nestjs/common";

import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { OPENAI_EMBEDDING_MODEL_OPTIONS } from "./ai-settings.constants";
import { UpdateAiSettingsDto } from "./dto/update-ai-settings.dto";

@Injectable()
export class AiSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureRow() {
    return this.prisma.aISettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  /** Админ: без секрета целиком, только факт наличия. */
  async getAdminView() {
    await this.ensureRow();
    const row = await this.prisma.aISettings.findUniqueOrThrow({ where: { id: 1 } });
    return {
      provider: row.provider,
      modelName: row.modelName,
      embeddingModel:
        row.embeddingModel?.trim() ?? "text-embedding-3-small",
      contextSize: row.contextSize,
      temperature: row.temperature,
      hasApiKey: Boolean(row.apiKeyVault?.trim()),
      embeddingModels: [...OPENAI_EMBEDDING_MODEL_OPTIONS],
    };
  }

  async update(dto: UpdateAiSettingsDto) {
    await this.ensureRow();
    const data: Prisma.AISettingsUpdateInput = {};

    if (dto.provider !== undefined) {
      data.provider =
        dto.provider === null ? null : dto.provider.trim() || null;
    }
    if (dto.modelName !== undefined) {
      data.modelName =
        dto.modelName === null ? null : dto.modelName.trim() || null;
    }
    if (dto.embeddingModel !== undefined) {
      data.embeddingModel =
        dto.embeddingModel === null ? null : dto.embeddingModel.trim() || null;
    }
    if (dto.clearApiKey === true) {
      data.apiKeyVault = null;
    } else if (dto.apiKey !== undefined && dto.apiKey.trim().length > 0) {
      data.apiKeyVault = dto.apiKey.trim();
    }

    await this.prisma.aISettings.update({
      where: { id: 1 },
      data,
    });
    return this.getAdminView();
  }

  /** Внутренний доступ для EmbeddingService и др. */
  async getSecretsForWorkers(): Promise<{ apiKeyVault: string | null; embeddingModel: string | null }> {
    await this.ensureRow();
    const row = await this.prisma.aISettings.findUniqueOrThrow({
      where: { id: 1 },
      select: {
        apiKeyVault: true,
        embeddingModel: true,
      },
    });
    return row;
  }
}
