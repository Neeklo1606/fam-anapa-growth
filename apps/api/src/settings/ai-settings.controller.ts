import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { AiSettingsService } from "./ai-settings.service";
import { UpdateAiSettingsDto } from "./dto/update-ai-settings.dto";

@Controller("ai")
export class AiSettingsController {
  constructor(private readonly ai: AiSettingsService) {}

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async getAdmin() {
    return this.ai.getAdminView();
  }

  @Patch("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async patchAdmin(@Body() dto: UpdateAiSettingsDto) {
    await this.ai.update(dto);
    return this.ai.getAdminView();
  }
}
