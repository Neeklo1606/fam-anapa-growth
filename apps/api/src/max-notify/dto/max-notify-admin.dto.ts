import { IsBoolean, IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from "class-validator";

export class UpdateMaxNotifyDto {
  @IsOptional()
  @IsString()
  @MinLength(16)
  @MaxLength(500)
  botAccessToken?: string;

  @IsOptional()
  @IsBoolean()
  removeBot?: boolean;

  @ValidateIf((_, v) => v != null && String(v).trim() !== "")
  @IsUrl({ require_protocol: true, protocols: ["https"] })
  @IsString()
  @MaxLength(300)
  publicAppUrl?: string | null;
}

export class ReviewMaxSubscriberDto {
  @IsString()
  @IsIn(["approve", "reject"])
  decision!: "approve" | "reject";
}
