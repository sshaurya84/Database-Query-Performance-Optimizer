/**
 * Centralized, typed configuration loaded from environment variables.
 *
 * Two completely independent connection blocks:
 *  - `appDb`    -> the advisor's own metadata database (read/write, we own it)
 *  - `targetDb` -> the database under analysis (mostly read-only + EXPLAIN)
 */
export interface DbConnectionConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface AppConfig {
  port: number;
  appDb: DbConnectionConfig;
  targetDb: DbConnectionConfig;
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default (): AppConfig => ({
  port: num(process.env.PORT, 3001),
  appDb: {
    host: process.env.APP_DB_HOST ?? "localhost",
    port: num(process.env.APP_DB_PORT, 5433),
    user: process.env.APP_DB_USER ?? "advisor",
    password: process.env.APP_DB_PASSWORD ?? "advisor",
    database: process.env.APP_DB_NAME ?? "advisor_meta",
  },
  targetDb: {
    host: process.env.TARGET_DB_HOST ?? "localhost",
    port: num(process.env.TARGET_DB_PORT, 5434),
    user: process.env.TARGET_DB_USER ?? "target",
    password: process.env.TARGET_DB_PASSWORD ?? "target",
    database: process.env.TARGET_DB_NAME ?? "target_app",
  },
});
