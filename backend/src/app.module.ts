import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      // Read backend/.env first, then fall back to the repo-root .env that
      // Docker Compose also uses, so there is a single source of truth.
      envFilePath: [".env", "../.env"],
    }),
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
