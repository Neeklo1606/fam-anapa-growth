import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

export class UpdateAiSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  provider?: string | null;

  /** Модель чата (будущий LLM-слой), опционально. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  modelName?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  embeddingModel?: string | null;

  /** Если true — ключ из БД сбрасывается (`apiKey` в том же запросе игнорируется). */
  @IsOptional()
  @IsBoolean()
  clearApiKey?: boolean;

  /** Новый секретный ключ; не передавайте пустую строку. */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  apiKey?: string;
}
