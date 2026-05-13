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

export class CreateVideoDto {
  @IsString() @MinLength(2) @MaxLength(200) title!: string;
  @IsString() @MinLength(8) @MaxLength(2000) url!: string;

  @IsOptional() @IsString() @MaxLength(40) posterMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(500) posterUrl?: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;

  @IsOptional() @IsInt() @Min(0) order?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdateVideoDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(2000) url?: string;

  @IsOptional() @IsString() @MaxLength(40) posterMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(500) posterUrl?: string | null | undefined;
  @IsOptional() @IsString() @MaxLength(4000) description?: string | null | undefined;

  @IsOptional() @IsInt() @Min(0) order?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

class ReorderItem {
  @IsString() id!: string;
  @IsInt() @Min(0) order!: number;
}

export class ReorderVideosDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items!: ReorderItem[];
}
