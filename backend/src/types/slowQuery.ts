/**
 * Schema #1: slow query tracking.
 *
 * Sourced from pg_stat_statements (on the target DB), which normalizes query
 * text (so `WHERE id = 5` and `WHERE id = 9` collapse to `WHERE id = $1`) and
 * accumulates call counts and timing. `bigint` columns are represented as
 * `string` here to avoid JavaScript number precision loss.
 */
export interface SlowQuery {
  id: string;
  queryFingerprint: string; // stable hash of normalizedQuery
  pgssQueryId: string | null; // pg_stat_statements queryid (bigint as string)
  databaseName: string;
  normalizedQuery: string; // literals replaced with $n
  sampleQuery: string | null; // one representative concrete query
  calls: number; // frequency
  totalExecTimeMs: number;
  meanExecTimeMs: number;
  minExecTimeMs: number | null;
  maxExecTimeMs: number | null;
  stddevExecTimeMs: number | null;
  rowsReturned: number;
  firstSeenAt: string; // ISO timestamp
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}
