import {
  Global,
  Module,
  OnModuleDestroy,
  Inject,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import type { AppConfig, DbConnectionConfig } from "../config/configuration";
import { APP_DB_POOL, TARGET_DB_POOL } from "./database.constants";

function createPool(cfg: DbConnectionConfig): Pool {
  return new Pool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    max: 10,
  });
}

/**
 * Provides two independent node-postgres connection pools as injectable
 * providers. Marked @Global so any feature module can inject either pool
 * without re-importing this module.
 *
 * We use raw `pg` (not an ORM) on purpose: the advisor runs arbitrary SQL such
 * as `EXPLAIN (ANALYZE, FORMAT JSON ...)` and reads the pg_stat_statements
 * view, which is exactly what node-postgres is good at.
 */
@Global()
@Module({
  providers: [
    {
      provide: APP_DB_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) =>
        createPool(config.get("appDb", { infer: true })),
    },
    {
      provide: TARGET_DB_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) =>
        createPool(config.get("targetDb", { infer: true })),
    },
  ],
  exports: [APP_DB_POOL, TARGET_DB_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    @Inject(APP_DB_POOL) private readonly appDb: Pool,
    @Inject(TARGET_DB_POOL) private readonly targetDb: Pool,
  ) {}

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Closing database pools");
    await Promise.allSettled([this.appDb.end(), this.targetDb.end()]);
  }
}
