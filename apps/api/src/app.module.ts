import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";

import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { LeadsModule } from "./leads/leads.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { SettingsModule } from "./settings/settings.module";
import { CoachesModule } from "./coaches/coaches.module";
import { MediaModule } from "./media/media.module";
import { GalleryModule } from "./gallery/gallery.module";
import { VideosModule } from "./videos/videos.module";
import { KnowledgeModule } from "./knowledge/knowledge.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { MaxNotifyModule } from "./max-notify/max-notify.module";
import { TelegramNotifyModule } from "./telegram-notify/telegram-notify.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    LeadsModule,
    SettingsModule,
    CoachesModule,
    MediaModule,
    GalleryModule,
    VideosModule,
    TelegramNotifyModule,
    MaxNotifyModule,
    KnowledgeModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
