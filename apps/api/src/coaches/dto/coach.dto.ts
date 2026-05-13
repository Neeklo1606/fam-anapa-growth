import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CreateCoachDto {
  @IsString() @MinLength(2) @MaxLength(120) fullName!: string;
  @IsString() @MinLength(2) @MaxLength(120) role!: string;
  @IsString() @MinLength(2) @MaxLength(500) shortDescription!: string;

  @IsOptional() @IsString() @MaxLength(500) photoUrl?: string;
  @IsOptional() @IsString() @MaxLength(40) photoMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(120) education?: string;
  @IsOptional() @IsString() @MaxLength(120) license?: string;
  @IsOptional() @IsString() @MaxLength(120) experience?: string;
  @IsOptional() @IsString() @MaxLength(4000) fullDescription?: string;

  @IsOptional() @IsInt() @Min(0) order?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdateCoachDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) fullName?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) role?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(500) shortDescription?: string;

  @IsOptional() @IsString() @MaxLength(500) photoUrl?: string;
  @IsOptional() @IsString() @MaxLength(40) photoMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(120) education?: string;
  @IsOptional() @IsString() @MaxLength(120) license?: string;
  @IsOptional() @IsString() @MaxLength(120) experience?: string;
  @IsOptional() @IsString() @MaxLength(4000) fullDescription?: string;

  @IsOptional() @IsInt() @Min(0) order?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

class ReorderItem {
  @IsString() id!: string;
  @IsInt() @Min(0) order!: number;
}

export class ReorderCoachesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items!: ReorderItem[];
}
