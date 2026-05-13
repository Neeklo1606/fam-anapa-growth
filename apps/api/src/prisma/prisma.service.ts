import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === "production"
          ? ["error", "warn"]
          : ["query", "info", "warn", "error"],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log("PostgreSQL connected");
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
