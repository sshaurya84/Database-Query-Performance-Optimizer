import { Controller, Get, Inject } from "@nestjs/common";
import { Pool } from "pg";
import {
  APP_DB_POOL,
  TARGET_DB_POOL,
} from "../database/database.constants";

interface DbStatus {
  connected: boolean;
  error?: string;
}

@Controller("health")
export class HealthController {
  constructor(
    @Inject(APP_DB_POOL) private readonly appDb: Pool,
    @Inject(TARGET_DB_POOL) private readonly targetDb: Pool,
  ) {}

  @Get()
  async check(): Promise<{
    status: string;
    appDb: DbStatus;
    targetDb: DbStatus;
  }> {
    const [appDb, targetDb] = await Promise.all([
      this.ping(this.appDb),
      this.ping(this.targetDb),
    ]);

    const allUp = appDb.connected && targetDb.connected;
    return { status: allUp ? "ok" : "degraded", appDb, targetDb };
  }

  private async ping(pool: Pool): Promise<DbStatus> {
    try {
      await pool.query("SELECT 1");
      return { connected: true };
    } catch (err) {
      return {
        connected: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
