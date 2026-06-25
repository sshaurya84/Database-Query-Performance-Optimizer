import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import type { AppConfig } from "./config/configuration";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Allow the Next.js dev server to call this API during local development.
  app.enableCors({ origin: true });

  const config = app.get(ConfigService<AppConfig, true>);
  const port = config.get("port", { infer: true });

  await app.listen(port);
  new Logger("Bootstrap").log(`Backend listening on http://localhost:${port}`);
}

void bootstrap();
