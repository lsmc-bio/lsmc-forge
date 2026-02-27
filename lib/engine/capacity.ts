/**
 * LSMC Capacity & Utilization Model
 *
 * Three scenarios for how new deal volume affects cost:
 * - Absorbed: fits in spare capacity → marginal cost only (cheap)
 * - Incremental: needs dedicated runs → full standalone cost (expensive)
 * - Blended: partially absorbed → weighted average
 *
 * Default lab capacity (guesstimated, will eventually feed from Bloom LIMS):
 * - 2 × UG 100, ~500 samples/week at 30x
 * - 1 × NovaSeq X+, ~200 samples/week at 30x
 * - 1 × PromethION 2 Solo, ~20 samples/week at 10x
 */

import type { CapacityContext, CapacityResult, DealInput } from "./types";
import { getPlatform, samplesPerRun, seqCostPerSample } from "@/lib/data/platforms";

// ---------------------------------------------------------------------------
// Default lab capacity
// ---------------------------------------------------------------------------

export const DEFAULT_CAPACITY: CapacityContext = {
  instruments: [
    { configId: "ug100_s4", count: 2 },
    { configId: "novaseq_25b", count: 1 },
    { configId: "promethion_s", count: 1 },
  ],
  currentWeeklySamples: 720, // 500 UG + 200 ILMN + 20 ONT
  currentCoverageX: 30,
};

// ---------------------------------------------------------------------------
// Core capacity calculation
// ---------------------------------------------------------------------------

export function calculateCapacityImpact(
  input: DealInput,
  capacity: CapacityContext = DEFAULT_CAPACITY,
): CapacityResult {
  // Find the instrument config that matches the deal's SR platform
  const targetConfigId = input.shortReadConfigId;
  if (!targetConfigId) {
    return {
      scenario: "incremental",
      effectiveSeqCostPerSample: 0,
      utilizationBefore: 0,
      utilizationAfter: 0,
      additionalRunsNeeded: 0,
    };
  }

  const config = getPlatform(targetConfigId);
  if (!config) {
    return {
      scenario: "incremental",
      effectiveSeqCostPerSample: 0,
      utilizationBefore: 0,
      utilizationAfter: 0,
      additionalRunsNeeded: 0,
    };
  }

  // Find matching instruments in capacity context
  const matchingInstrument = capacity.instruments.find(
    (i) => i.configId === targetConfigId,
  );
  const instrumentCount = matchingInstrument?.count ?? 0;

  // Calculate weekly capacity
  const spr = samplesPerRun(config, capacity.currentCoverageX);
  const runsPerWeek = config.maxRunsPerYear / 52;
  const weeklyCapacity = spr * runsPerWeek * instrumentCount;

  // Current utilization
  const utilizationBefore =
    weeklyCapacity > 0 ? capacity.currentWeeklySamples / weeklyCapacity : 0;

  // New deal's weekly demand
  const newWeeklySamples = input.annualVolume / 52;

  // Spare capacity
  const spareWeekly = Math.max(0, weeklyCapacity - capacity.currentWeeklySamples);

  // How much of the new volume can be absorbed?
  const absorbable = Math.min(newWeeklySamples, spareWeekly);
  const incremental = newWeeklySamples - absorbable;

  const utilizationAfter =
    weeklyCapacity > 0
      ? (capacity.currentWeeklySamples + newWeeklySamples) / weeklyCapacity
      : 0;

  // Calculate costs
  const fullSeqCost = seqCostPerSample(config, input.shortReadCoverageX);

  // Absorbed samples: only consumable cost (the run is already happening)
  // This is the marginal cost — instrument and overhead already covered
  const absorbedCostPerSample = fullSeqCost; // consumable still consumed

  // For incremental samples: full standalone cost
  const incrementalCostPerSample = fullSeqCost;

  // Additional runs needed for incremental volume
  const sprAtDealCoverage = samplesPerRun(config, input.shortReadCoverageX);
  const additionalRunsNeeded =
    sprAtDealCoverage > 0
      ? Math.ceil((incremental * 52) / sprAtDealCoverage)
      : 0;

  // Determine scenario and effective cost
  let scenario: CapacityResult["scenario"];
  let effectiveSeqCostPerSample: number;

  if (incremental <= 0) {
    scenario = "absorbed";
    effectiveSeqCostPerSample = absorbedCostPerSample;
  } else if (absorbable <= 0) {
    scenario = "incremental";
    effectiveSeqCostPerSample = incrementalCostPerSample;
  } else {
    scenario = "blended";
    // Weighted average
    const totalWeekly = absorbable + incremental;
    effectiveSeqCostPerSample =
      (absorbedCostPerSample * absorbable +
        incrementalCostPerSample * incremental) /
      totalWeekly;
  }

  return {
    scenario,
    effectiveSeqCostPerSample: Math.round(effectiveSeqCostPerSample * 100) / 100,
    utilizationBefore: Math.round(utilizationBefore * 1000) / 1000,
    utilizationAfter: Math.round(utilizationAfter * 1000) / 1000,
    additionalRunsNeeded,
  };
}
