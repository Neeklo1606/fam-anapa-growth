import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ExperienceLevel } from "@prisma/client";

class UtmDto {
  @IsOptional() @IsString() @MaxLength(255) source?: string;
  @IsOptional() @IsString() @MaxLength(255) medium?: string;
  @IsOptional() @IsString() @MaxLength(255) campaign?: string;
  @IsOptional() @IsString() @MaxLength(255) content?: string;
  @IsOptional() @IsString() @MaxLength(255) term?: string;
}

export class CreateLeadDto {
  @IsString() @Length(2, 120) parentName!: string;

  @IsString() @Length(2, 120) childName!: string;

  @IsOptional() @IsDateString() childBirthDate?: string;

  @IsOptional() @IsInt() @Min(2) @Max(20) childAge?: number;

  /** Russian +7 phone format. We allow either E.164 (+7XXXXXXXXXX) or "+7 (XXX) XXX-XX-XX". */
  @IsString()
  @Matches(/^(\+7|7|8)[\s()-]*\d{3}[\s()-]*\d{3}[\s-]?\d{2}[\s-]?\d{2}$/, {
    message: "phone must be a valid Russian phone number",
  })
  phone!: string;

  @IsOptional() @IsEmail() @MaxLength(255) email?: string;
  @IsOptional() @IsString() @MaxLength(120) telegram?: string;
  @IsOptional() @IsString() @MaxLength(120) whatsapp?: string;
  @IsOptional() @IsString() @MaxLength(120) direction?: string;

  @IsOptional() @IsEnum(ExperienceLevel) experienceLevel?: ExperienceLevel;

  @IsOptional() @IsString() @MaxLength(2000) comment?: string;

  /** Required by ФЗ-152; the frontend must check the checkbox. */
  @IsBoolean()
  @Transform(({ value }) => value === true || value === "true")
  privacyAccepted!: boolean;

  @IsOptional() @IsString() @MaxLength(255) landingPage?: string;
  @IsOptional() @IsString() @MaxLength(20) source?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UtmDto)
  utm?: UtmDto;

  /** Honeypot — if filled, bot. The handler MUST reject silently. */
  @IsOptional() @IsString() @MaxLength(255) website?: string;
}
