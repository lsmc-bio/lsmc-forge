/**
 * LSMC Labor Model — rates, stages, and multipliers
 * Source: COGS Calculator v2 GSheet — Labor Model tab
 * Last synced: 2026-02-27
 */

import type { RateCategory, LaborStage } from "@/lib/engine/types";

// ---------------------------------------------------------------------------
// Hourly rates by category
// ---------------------------------------------------------------------------

export const RATE_PER_HOUR: Record<RateCategory, number> = {
  tech_1: 30,
  tech_2: 40,
  senior_tech: 55,
  scientist: 75,
};

// ---------------------------------------------------------------------------
// Multipliers
// ---------------------------------------------------------------------------

/** Rapid/stat TAT requires evening/weekend shifts → 2.5x labor cost */
export const SHIFT_MULTIPLIER: Record<string, number> = {
  standard: 1.0,
  expedited: 1.5,
  stat: 2.5,
};

/** Benefits, payroll tax, overhead burden on labor */
export const BURDEN_MULTIPLIER = 1.35;

// ---------------------------------------------------------------------------
// Labor stages — per-batch fixed time + per-sample incremental
// ---------------------------------------------------------------------------

export const LABOR_STAGES: LaborStage[] = [
  {
    stage: "accessioning",
    rateCategory: "tech_1",
    baseTimeMinutes: 30, // batch setup, label printing
    incrementalMinutesPerSample: 3,
  },
  {
    stage: "extraction",
    rateCategory: "tech_2",
    baseTimeMinutes: 45, // instrument setup, QC checks
    incrementalMinutesPerSample: 2,
  },
  {
    stage: "library_prep",
    rateCategory: "senior_tech",
    baseTimeMinutes: 60, // complex prep, pooling
    incrementalMinutesPerSample: 4,
  },
  {
    stage: "qc",
    rateCategory: "tech_2",
    baseTimeMinutes: 20, // qubit + tapestation setup
    incrementalMinutesPerSample: 2,
  },
  {
    stage: "sequencing",
    rateCategory: "senior_tech",
    baseTimeMinutes: 30, // loading, monitoring
    incrementalMinutesPerSample: 0.5,
  },
  {
    stage: "data_review",
    rateCategory: "scientist",
    baseTimeMinutes: 15, // QC review, sign-off
    incrementalMinutesPerSample: 1,
  },
];

// ---------------------------------------------------------------------------
// Calculation helper
// ---------------------------------------------------------------------------

/**
 * Calculate total labor cost per sample for all stages.
 *
 * Formula per stage:
 *   totalMinutes = baseTime + (incremental × batchSize)
 *   costPerBatch = (totalMinutes / 60) × hourlyRate × shiftMultiplier × burdenMultiplier
 *   costPerSample = costPerBatch / batchSize
 */
export function calculateLaborPerSample(
  batchSize: number,
  tatTier: "standard" | "expedited" | "stat",
): number {
  const shift = SHIFT_MULTIPLIER[tatTier];
  let total = 0;

  for (const stage of LABOR_STAGES) {
    const totalMinutes =
      stage.baseTimeMinutes + stage.incrementalMinutesPerSample * batchSize;
    const hours = totalMinutes / 60;
    const rate = RATE_PER_HOUR[stage.rateCategory];
    const costPerBatch = hours * rate * shift * BURDEN_MULTIPLIER;
    total += costPerBatch / batchSize;
  }

  return total;
}
