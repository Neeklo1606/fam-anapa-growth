import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { PatchHomeContentDto } from "./dto/patch-home-content.dto";
import { SettingsService } from "./settings.service";

function resolvePublicLogoUrl(s: {
  logoMedia: { webpUrl: string | null; url: string } | null;
  logoFallbackUrl: string | null;
}): string | null {
  const fromMedia = (s.logoMedia?.webpUrl ?? s.logoMedia?.url)?.trim();
  if (fromMedia) return fromMedia;
  const fb = s.logoFallbackUrl?.trim();
  return fb || null;
}

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
      logoUrl: resolvePublicLogoUrl(s),
      homeContent: s.homeContent,
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

  @Get("admin/home")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR", "MANAGER")
  async getHomeAdmin() {
    return this.settings.getHomeContentRaw();
  }

  @Patch("admin/home")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EDITOR", "MANAGER")
  async patchHomeAdmin(@Body() dto: PatchHomeContentDto) {
    return this.settings.patchHomeContent(dto.homeContent);
  }
}
