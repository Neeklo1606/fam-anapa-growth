import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { SettingsService } from "./settings.service";

@Controller("site")
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  // ────────────── PUBLIC ──────────────
  @Get()
  async getPublic() {
    const s = await this.settings.get();
    // Whitelist of fields publicly exposed (no audit fields needed by frontend).
    return {
      brandName: s.brandName,
      brandTagline: s.brandTagline,
      phone: s.phone,
      whatsapp: s.whatsapp,
      telegram: s.telegram,
      maxLink: s.maxLink,
      email: s.email,
      address: s.address,
      mapEmbed: s.mapEmbed,
      yandexMapUrl: s.yandexMapUrl,
    };
  }

  // ────────────── ADMIN ──────────────
  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  async getAdmin() {
    return this.settings.get();
  }

  @Patch("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR")
  async update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}
