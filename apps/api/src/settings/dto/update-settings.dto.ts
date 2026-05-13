import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(120) brandName?: string;
  @IsOptional() @IsString() @MaxLength(200) brandTagline?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(200) whatsapp?: string;
  @IsOptional() @IsString() @MaxLength(200) telegram?: string;
  @IsOptional() @IsString() @MaxLength(200) maxLink?: string;
  @IsOptional() @IsString() @MaxLength(120) email?: string;
  @IsOptional() @IsString() @MaxLength(300) address?: string;
  @IsOptional() @IsString() @MaxLength(2000) mapEmbed?: string;
  @IsOptional() @IsString() @MaxLength(500) yandexMapUrl?: string;
  @IsOptional() @IsString() @MaxLength(40) logoMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(500) logoFallbackUrl?: string | null;
}
