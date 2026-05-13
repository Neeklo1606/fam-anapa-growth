import { IsBoolean, IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from "class-validator";

export class UpdateTelegramNotifyDto {
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(120)
  botToken?: string;

  @IsOptional()
  @IsBoolean()
  removeBotToken?: boolean;

  @ValidateIf((_, v) => v != null && String(v).trim() !== "")
  @IsUrl({ require_protocol: true, protocols: ["https"] })
  @IsString()
  @MaxLength(300)
  publicAppUrl?: string | null;

  @ValidateIf((_, v) => v != null && String(v).trim() !== "")
  @IsUrl({ require_protocol: true })
  @IsString()
  @MaxLength(2000)
  leadOutboundWebhookUrl?: string | null;
}

export class ReviewTelegramSubscriberDto {
  @IsString()
  @IsIn(["approve", "reject"])
  decision!: "approve" | "reject";
}
