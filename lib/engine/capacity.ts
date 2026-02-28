/**
 * LSMC Capacity & Utilization Model — Gb-Based Bandwidth Model
 *
 * Capacity is measured in Gb/week as the universal unit. Each instrument
 * is a pipe with throughput = positions × (eff_hours / run_time) × Gb/run.
 * Run rate = consumed Gb / capacity Gb.
 *
 * Deal fit classification:
 *   GREEN  (<60%)  — plenty of room
 *   YELLOW (60-85%) — healthy utilization
 *   ORANGE (85-100%) — tight, may need scheduling
 *   RED    (>100%)  — over capacity, needs new instruments
 *
 * Default fleet (sensible current volume, will eventually feed from Bloom LIMS):
 *   1 × NovaSeq X+ (2 positions), 15 samples/week @30x
 *   2 × UG 100 (1 position each), 50 samples/week @30x
 *   1 × PromethION 2 Solo (1 active position), 3 samples/week @10x
 */

import type {
  CapacityContext,
  CapacityResult,
  DealInput,
  DealFitClassification,
} from "./types";
import {
  getPlatform,
  samplesPerRun,
  seqCostPerSample,
  requiredGbPerSample,
  UPTIME_FACTOR,
  HOURS_PER_WEEK,
} from "@/lib/data/platforms";

// ---------------------------------------------------------------------------
// Deal fit thresholds
// ---------------------------------------------------------------------------

const DEAL_FIT_THRESHOLDS = {
  GREEN: 0.60,
  YELLOW: 0.85,
  ORANGE: 1.00,
} as const;

export function classifyRunRate(runRate: number): DealFitClassification {
  if (runRate < DEAL_FIT_THRESHOLDS.GREEN) return "GREEN";
  if (runRate < DEAL_FIT_THRESHOLDS.YELLOW) return "YELLOW";
  if (runRate <= DEAL_FIT_THRESHOLDS.ORANGE) return "ORANGE";
  return "RED";
}

// ---------------------------------------------------------------------------
// Default lab capacity
// ---------------------------------------------------------------------------

export const DEFAULT_CAPACITY: CapacityContext = {
  instruments: [
    { configId: "novaseq_25b", count: 1, activePositions: 2, weeklySamples: 15, coverageX: 30 },
    { configId: "ug100_s4", count: 2, activePositions: 1, weeklySamples: 50, coverageX: 30 },
    { configId: "promethion_s", count: 1, activePositions: 1, weeklySamples: 3, coverageX: 10 },
  ],
  currentWeeklySamples: 68, // 15 + 50 + 3
  currentCoverageX: 30,
};

// ---------------------------------------------------------------------------
// Gb-based capacity calculation per platform
// ---------------------------------------------------------------------------

/**
 * Calculate weekly Gb capacity for one instrument entry.
 * Formula: positions × instruments × (effective_hours / run_time) × Gb_per_run
 */
export function weeklyGbCapacity(
  configId: string,
  instrumentCount: number,
  activePositions?: number,
): number {
  const config = getPlatform(configId);
  if (!config) return 0;
  const positions = activePositions ?? config.positions;
  const effHoursPerWeek = HOURS_PER_WEEK * UPTIME_FACTOR;
  const runsPerWeekPerPosition = effHoursPerWeek / config.runTimeHours;
  return runsPerWeekPerPosition * positions * instrumentCount * config.outputGb;
}

/**
 * Calculate weekly sample capacity at a given coverage depth.
 */
export function weeklySampleCapacity(
  configId: string,
  instrumentCount: number,
  coverageX: number,
  activePositions?: number,
): number {
  const config = getPlatform(configId);
  if (!config) return 0;
  const gbPerWeek = weeklyGbCapacity(configId, instrumentCount, activePositions);
  const gbPerSample = requiredGbPerSample(coverageX, config);
  return gbPerSample > 0 ? gbPerWeek / gbPerSample : 0;
}

// ---------------------------------------------------------------------------
// Packing efficiency
// ---------------------------------------------------------------------------

/**
 * Calculate how efficiently samples pack into flow cells at a given coverage.
 * Returns efficiency (0-1) and wasted slots per run.
 */
export function packingEfficiency(
  configId: string,
  weeklySamples: number,
  coverageX: number,
): { efficiency: number; wastedSlotsPerRun: number; samplesPerRun: number } {
  const config = getPlatform(configId);
  if (!config || weeklySamples <= 0)
    return { efficiency: 0, wastedSlotsPerRun: 0, samplesPerRun: 0 };

  const spr = samplesPerRun(config, coverageX);
  if (spr <= 0) return { efficiency: 0, wastedSlotsPerRun: 0, samplesPerRun: 0 };

  const remainder = weeklySamples % spr;
  const fullRuns = Math.floor(weeklySamples / spr);

  if (fullRuns > 0 && remainder === 0) {
    return { efficiency: 1.0, wastedSlotsPerRun: 0, samplesPerRun: spr };
  }

  // Average packing across runs in a week
  const totalSlots = (fullRuns + (remainder > 0 ? 1 : 0)) * spr;
  const efficiency = weeklySamples / totalSlots;
  const wastedSlotsPerRun = remainder > 0 ? spr - remainder : 0;

  return {
    efficiency: Math.round(efficiency * 1000) / 1000,
    wastedSlotsPerRun,
    samplesPerRun: spr,
  };
}

// ---------------------------------------------------------------------------
// Lab capacity snapshot
// ---------------------------------------------------------------------------

export interface LabCapacitySnapshot {
  platforms: {
    configId: string;
    instrument: string;
    count: number;
    positions: number;
    weeklyGbCapacity: number;
    weeklySampleCapacity: number; // at current coverage
    currentWeeklySamples: number;
    currentCoverageX: number;
    runRate: number;
    classification: DealFitClassification;
    packing: { efficiency: number; wastedSlotsPerRun: number; samplesPerRun: number };
  }[];
  totalWeeklyGb: number;
  totalCurrentGb: number;
  totalCurrentSamples: number;
  overallRunRate: number;
  overallClassification: DealFitClassification;
}

export function calculateLabCapacity(
  capacity: CapacityContext = DEFAULT_CAPACITY,
): LabCapacitySnapshot {
  const platforms = capacity.instruments.map((inst) => {
    const config = getPlatform(inst.configId);
    const positions = inst.activePositions ?? config?.positions ?? 1;
    const weeklySamples = inst.weeklySamples ?? 0;
    const coverageX = inst.coverageX ?? capacity.currentCoverageX;

    const gbCap = weeklyGbCapacity(inst.configId, inst.count, positions);
    const sampleCap = weeklySampleCapacity(inst.configId, inst.count, coverageX, positions);
    const currentGb = config
      ? weeklySamples * requiredGbPerSample(coverageX, config)
      : 0;
    const runRate = gbCap > 0 ? currentGb / gbCap : 0;

    return {
      configId: inst.configId,
      instrument: config?.instrument ?? inst.configId,
      count: inst.count,
      positions,
      weeklyGbCapacity: Math.round(gbCap),
      weeklySampleCapacity: Math.round(sampleCap * 10) / 10,
      currentWeeklySamples: weeklySamples,
      currentCoverageX: coverageX,
      runRate: Math.round(runRate * 1000) / 1000,
      classification: classifyRunRate(runRate),
      packing: packingEfficiency(inst.configId, weeklySamples, coverageX),
    };
  });

  const totalWeeklyGb = platforms.reduce((sum, p) => sum + p.weeklyGbCapacity, 0);
  const totalCurrentGb = platforms.reduce((sum, p) => {
    const config = getPlatform(p.configId);
    return sum + (config ? p.currentWeeklySamples * requiredGbPerSample(p.currentCoverageX, config) : 0);
  }, 0);
  const totalCurrentSamples = platforms.reduce((sum, p) => sum + p.currentWeeklySamples, 0);
  const overallRunRate = totalWeeklyGb > 0 ? totalCurrentGb / totalWeeklyGb : 0;

  return {
    platforms,
    totalWeeklyGb,
    totalCurrentGb: Math.round(totalCurrentGb),
    totalCurrentSamples,
    overallRunRate: Math.round(overallRunRate * 1000) / 1000,
    overallClassification: classifyRunRate(overallRunRate),
  };
}

// ---------------------------------------------------------------------------
// Core capacity impact calculation (backward-compatible API)
// ---------------------------------------------------------------------------

export function calculateCapacityImpact(
  input: DealInput,
  capacity: CapacityContext = DEFAULT_CAPACITY,
): CapacityResult {
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

  // Find matching instrument in capacity context
  const matchingInstrument = capacity.instruments.find(
    (i) => i.configId === targetConfigId,
  );
  const instrumentCount = matchingInstrument?.count ?? 0;
  const activePositions = matchingInstrument?.activePositions ?? config.positions;
  const currentPlatformSamples = matchingInstrument?.weeklySamples ?? 0;
  const currentCoverageX = matchingInstrument?.coverageX ?? capacity.currentCoverageX;

  // Calculate Gb-based capacity for this platform
  const platformGbCapacity = weeklyGbCapacity(targetConfigId, instrumentCount, activePositions);

  // Current consumption in Gb
  const currentGb = currentPlatformSamples * requiredGbPerSample(currentCoverageX, config);
  const utilizationBefore = platformGbCapacity > 0 ? currentGb / platformGbCapacity : 0;

  // New deal's weekly demand in Gb
  const newWeeklySamples = input.annualVolume / 52;
  const newGb = newWeeklySamples * requiredGbPerSample(input.shortReadCoverageX, config);

  // Spare capacity in Gb
  const spareGb = Math.max(0, platformGbCapacity - currentGb);
  const absorbableGb = Math.min(newGb, spareGb);
  const incrementalGb = newGb - absorbableGb;

  const utilizationAfter = platformGbCapacity > 0
    ? (currentGb + newGb) / platformGbCapacity
    : 0;

  // Packing efficiency for the deal
  const spr = samplesPerRun(config, input.shortReadCoverageX);
  const packing = packingEfficiency(
    targetConfigId,
    currentPlatformSamples + newWeeklySamples,
    input.shortReadCoverageX,
  );

  // Sequencing cost
  const fullSeqCost = seqCostPerSample(config, input.shortReadCoverageX);

  // Additional runs needed for incremental volume
  const incrementalSamples = incrementalGb > 0
    ? incrementalGb / requiredGbPerSample(input.shortReadCoverageX, config)
    : 0;
  const additionalRunsNeeded = spr > 0
    ? Math.ceil((incrementalSamples * 52) / spr)
    : 0;

  // Determine scenario
  let scenario: CapacityResult["scenario"];
  if (incrementalGb <= 0) {
    scenario = "absorbed";
  } else if (absorbableGb <= 0) {
    scenario = "incremental";
  } else {
    scenario = "blended";
  }

  // Deal fit classification based on new utilization
  const dealFit = classifyRunRate(utilizationAfter);

  return {
    scenario,
    effectiveSeqCostPerSample: Math.round(fullSeqCost * 100) / 100,
    utilizationBefore: Math.round(utilizationBefore * 1000) / 1000,
    utilizationAfter: Math.round(utilizationAfter * 1000) / 1000,
    additionalRunsNeeded,
    dealFitClassification: dealFit,
    packingEfficiency: packing.efficiency,
    wastedSlotsPerRun: packing.wastedSlotsPerRun,
  };
}
