-- Target database: the database the advisor analyzes.
--
-- pg_stat_statements is preloaded via shared_preload_libraries in
-- docker-compose.yml. The library being loaded only makes the machinery
-- available; we still must register the extension in this database to expose
-- the pg_stat_statements view that we query.
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- A small but non-trivial sample schema. The point is to deliberately create
-- tables WITHOUT helpful indexes so that realistic slow queries show up in
-- pg_stat_statements and in EXPLAIN ANALYZE plans.
CREATE TABLE users (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      TEXT NOT NULL,
  country    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  status      TEXT NOT NULL,
  total_cents BIGINT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed data: enough rows that a sequential scan is measurably slow.
INSERT INTO users (email, country)
SELECT
  'user' || g || '@example.com',
  (ARRAY['US','GB','DE','FR','JP','IN'])[1 + (g % 6)]
FROM generate_series(1, 50000) AS g;

INSERT INTO orders (user_id, status, total_cents)
SELECT
  1 + (g % 50000),
  (ARRAY['pending','paid','shipped','cancelled'])[1 + (g % 4)],
  (g % 100000)
FROM generate_series(1, 200000) AS g;

-- Make the planner's statistics accurate for the seeded data.
ANALYZE users;
ANALYZE orders;
