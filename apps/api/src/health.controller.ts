import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

@Controller()
@SkipThrottle()
export class HealthController {
  @Get("health")
  health() {
    return {
      status: "ok",
      service: "@fam/api",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
