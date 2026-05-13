import { IsObject } from "class-validator";

export class PatchHomeContentDto {
  @IsObject()
  homeContent!: Record<string, unknown>;
}
