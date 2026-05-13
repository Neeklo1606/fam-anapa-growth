import "reflect-metadata";

import compression from "compression";

import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { apiCsrfProtection } from "./security/csrf.middleware";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const logger = new Logger("Bootstrap");

  app.enableShutdownHooks();

  app.set("trust proxy", true);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      hidePoweredBy: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(apiCsrfProtection());
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? "*").split(",").map((s) => s.trim()),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.setGlobalPrefix("api", { exclude: ["health"] });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  logger.log(`API listening on http://0.0.0.0:${port}`);
}
void bootstrap();
