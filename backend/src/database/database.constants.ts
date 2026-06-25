/**
 * Dependency-injection tokens for the two connection pools.
 *
 * Using distinct tokens lets any service ask for exactly the pool it needs:
 *   constructor(@Inject(APP_DB_POOL) private readonly appDb: Pool) {}
 *   constructor(@Inject(TARGET_DB_POOL) private readonly targetDb: Pool) {}
 */
export const APP_DB_POOL = "APP_DB_POOL";
export const TARGET_DB_POOL = "TARGET_DB_POOL";
