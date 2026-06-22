/**
 * Schema #3: diagnosis.
 *
 * One record per detected problem, linked to the slow query it came from. The
 * pattern detector emits a controlled `patternType`; `confidence` is a coarse
 * enum with an optional numeric score. `fixSql` holds the concrete remediation
 * that the shadow-copy validator tests before it is applied, and `status`
 * tracks the self-healing lifecycle.
 */
import type { PlanNode } from "./executionPlan";

export type DiagnosisPattern =
  | "MISSING_INDEX"
  | "STALE_STATISTICS"
  | "SEQ_SCAN_LARGE_TABLE"
  | "INEFFICIENT_JOIN"
  | "SORT_SPILL_TO_DISK"
  | "ROW_ESTIMATE_MISMATCH"
  | "REDUNDANT_INDEX"
  | "OTHER";

export type DiagnosisConfidence = "LOW" | "MEDIUM" | "HIGH";

export type DiagnosisStatus =
  | "DETECTED"
  | "VALIDATING"
  | "VALIDATED"
  | "REJECTED"
  | "APPLIED";

export interface Diagnosis {
  id: string;
  slowQueryId: string;
  patternType: DiagnosisPattern;
  title: string;
  explanation: string; // plain-English why it's slow
  suggestedFix: string; // human description of the fix
  fixSql: string | null; // executable remediation
  confidence: DiagnosisConfidence;
  confidenceScore: number | null; // 0..1
  estimatedImpact: string | null;
  evidence: PlanNode | null; // offending node snapshot
  status: DiagnosisStatus;
  createdAt: string;
  updatedAt: string;
}
