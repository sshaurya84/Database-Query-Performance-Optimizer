/**
 * Schema #2: parsed Postgres execution plan tree.
 *
 * Produced by running `EXPLAIN (ANALYZE, FORMAT JSON, BUFFERS, VERBOSE)` on the
 * target DB and parsing the resulting JSON. The raw fields mirror the JSON
 * keys; the `derived` block holds values our parser computes to encode the
 * subtleties of EXPLAIN ANALYZE output (per-loop averaging, child-inclusive
 * timing, and estimate-vs-actual row error).
 */

export type SortSpaceType = "Memory" | "Disk";

/**
 * Top-level wrapper. EXPLAIN ... FORMAT JSON returns an array with a single
 * element shaped like this; planning and execution time live here, not on the
 * plan nodes.
 */
export interface ExplainAnalyzeResult {
  planningTimeMs: number; // top-level "Planning Time"
  executionTimeMs: number; // top-level "Execution Time"
  plan: PlanNode; // root "Plan"
  triggers?: unknown[];
}

export interface PlanNode {
  // identity
  nodeType: string; // "Node Type" e.g. "Seq Scan", "Hash Join", "Sort"

  // planner estimates (always present)
  startupCost: number;
  totalCost: number; // cumulative, includes children
  planRows: number; // estimated rows, per loop
  planWidth: number;

  // actuals (present only with ANALYZE)
  actualStartupTimeMs?: number;
  actualTotalTimeMs?: number; // per loop, cumulative incl. children
  actualRows?: number; // per loop average
  actualLoops?: number;

  // scan / index context
  relationName?: string;
  alias?: string;
  indexName?: string;
  scanDirection?: string;
  indexCond?: string;
  filter?: string;
  rowsRemovedByFilter?: number;

  // join context
  joinType?: string;
  hashCond?: string;
  mergeCond?: string;

  // sort context
  sortKey?: string[];
  sortMethod?: string;
  sortSpaceUsedKb?: number;
  sortSpaceType?: SortSpaceType;

  // buffers (with BUFFERS)
  sharedHitBlocks?: number;
  sharedReadBlocks?: number;
  tempReadBlocks?: number;
  tempWrittenBlocks?: number;

  // children (parsed from "Plans"; empty array if leaf)
  children: PlanNode[];

  // derived by our parser (NOT present in the raw JSON)
  derived?: PlanNodeDerived;
}

export interface PlanNodeDerived {
  totalRows: number; // actualRows * actualLoops
  totalTimeMs: number; // actualTotalTimeMs * actualLoops (incl children)
  selfTimeMs: number; // totalTimeMs minus children's total time
  rowEstimateErrorRatio: number; // actualRows / max(planRows, 1)
  isExpensive: boolean; // selfTime over a threshold fraction of executionTime
}
