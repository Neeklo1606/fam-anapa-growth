import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateKnowledgeDocumentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(240)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(SLUG_RE, { message: "slug: только строчные латинские буквы, цифры и дефисы" })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200_000)
  body!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === "" || value === null ? undefined : value,
  )
  @IsString()
  @IsUrl({ require_protocol: true }, { message: "sourceUrl: укажите полный URL" })
  sourceUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class UpdateKnowledgeDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(240)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(SLUG_RE, { message: "slug: только строчные латинские буквы, цифры и дефисы" })
  slug?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(2000)
  summary?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200_000)
  body?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @Transform(({ value }: { value: unknown }) =>
    value === "" || value === null ? undefined : value,
  )
  @IsString()
  @IsUrl({ require_protocol: true }, { message: "sourceUrl: укажите полный URL" })
  sourceUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsObject()
  meta?: Record<string, unknown> | null;
}

export class RetrieveKnowledgeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(800)
  query!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}
