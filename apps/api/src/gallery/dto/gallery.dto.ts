import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { GalleryCategory } from "@prisma/client";

export class CreateGalleryItemDto {
  @IsString() @MinLength(1) @MaxLength(40) mediaId!: string;
  @IsString() @MinLength(1) @MaxLength(300) alt!: string;
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsEnum(GalleryCategory) category?: GalleryCategory;
  @IsOptional() @IsInt() @Min(0) order?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdateGalleryItemDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(40) mediaId?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(300) alt?: string;
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsEnum(GalleryCategory) category?: GalleryCategory;
  @IsOptional() @IsInt() @Min(0) order?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

class ReorderItem {
  @IsString() id!: string;
  @IsInt() @Min(0) order!: number;
}

export class ReorderGalleryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items!: ReorderItem[];
}
