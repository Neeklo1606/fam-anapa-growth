import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { LeadStatus } from "@prisma/client";

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus)
  status!: LeadStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class CreateLeadCommentDto {
  @IsString()
  @MaxLength(4000)
  body!: string;
}

export class AssignManagerDto {
  @IsOptional()
  @IsString()
  managerId?: string | null;
}
