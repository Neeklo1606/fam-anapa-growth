import { Module } from "@nestjs/common";

import { AiSettingsController } from "./ai-settings.controller";
import { AiSettingsService } from "./ai-settings.service";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  controllers: [SettingsController, AiSettingsController],
  providers: [SettingsService, AiSettingsService],
  exports: [SettingsService, AiSettingsService],
})
export class SettingsModule {}
