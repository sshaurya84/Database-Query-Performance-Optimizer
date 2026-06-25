-- App metadata database: the advisor's own storage.
-- This DB does NOT need pg_stat_statements; that extension lives on the
-- target database we analyze (see sql/target-db/001_init.sql).

-- Schema #1: slow query tracking.
-- Mirrors the pg_stat_statements columns we ingest from the target DB and adds
-- a durable, portable fingerprint plus first/last-seen bookkeeping.
CREATE TABLE slow_query (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  query_fingerprint TEXT             NOT NULL,           -- our stable hash of normalized_query
  pgss_queryid      BIGINT,                              -- pg_stat_statements queryid (may be null)
  database_name     TEXT             NOT NULL,
  normalized_query  TEXT             NOT NULL,           -- literals replaced with $n
  sample_query      TEXT,                                -- one representative concrete query
  calls             BIGINT           NOT NULL DEFAULT 0, -- frequency
  total_exec_time   DOUBLE PRECISION NOT NULL DEFAULT 0, -- ms, summed across calls
  mean_exec_time    DOUBLE PRECISION NOT NULL DEFAULT 0, -- ms
  min_exec_time     DOUBLE PRECISION,
  max_exec_time     DOUBLE PRECISION,
  stddev_exec_time  DOUBLE PRECISION,
  rows_returned     BIGINT           NOT NULL DEFAULT 0, -- total rows across calls
  first_seen_at     TIMESTAMPTZ      NOT NULL DEFAULT now(),
  last_seen_at      TIMESTAMPTZ      NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ      NOT NULL DEFAULT now(),
  UNIQUE (database_name, query_fingerprint)
);

CREATE INDEX idx_slow_query_mean_time ON slow_query (mean_exec_time DESC);
CREATE INDEX idx_slow_query_total_time ON slow_query (total_exec_time DESC);

-- Schema #3: diagnosis.
CREATE TYPE diagnosis_pattern AS ENUM (
  'MISSING_INDEX',
  'STALE_STATISTICS',
  'SEQ_SCAN_LARGE_TABLE',
  'INEFFICIENT_JOIN',
  'SORT_SPILL_TO_DISK',
  'ROW_ESTIMATE_MISMATCH',
  'REDUNDANT_INDEX',
  'OTHER'
);

CREATE TYPE diagnosis_confidence AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TYPE diagnosis_status AS ENUM (
  'DETECTED', 'VALIDATING', 'VALIDATED', 'REJECTED', 'APPLIED'
);

CREATE TABLE diagnosis (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slow_query_id    BIGINT               NOT NULL REFERENCES slow_query(id) ON DELETE CASCADE,
  pattern_type     diagnosis_pattern    NOT NULL,
  title            TEXT                 NOT NULL,
  explanation      TEXT                 NOT NULL,
  suggested_fix    TEXT                 NOT NULL,
  fix_sql          TEXT,
  confidence       diagnosis_confidence NOT NULL,
  confidence_score DOUBLE PRECISION,
  estimated_impact TEXT,
  evidence         JSONB,
  status           diagnosis_status     NOT NULL DEFAULT 'DETECTED',
  created_at       TIMESTAMPTZ          NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ          NOT NULL DEFAULT now()
);

CREATE INDEX idx_diagnosis_slow_query ON diagnosis (slow_query_id);
CREATE INDEX idx_diagnosis_status ON diagnosis (status);
