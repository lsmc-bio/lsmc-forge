/**
 * LSMC Sequencing Platform Configurations
 * Source: COGS Calculator v2 GSheet — Seq Config tab
 * Last synced: 2026-02-27
 *
 * CRITICAL FIX: samplesPerRun is now DYNAMIC — calculated from coverage
 * depth, not pre-baked. This is the root cause of the "$250 for lpWGS" bug.
 */

import type { PlatformConfig } from "@/lib/engine/types";

// ---------------------------------------------------------------------------
// Core formula: how many Gb does one sample need at a given coverage?
// ---------------------------------------------------------------------------

const GENOME_SIZE_GB = 3.1; // human genome
const DUP_RATE = 0.05; // 5% duplication
const UNMAPPED_RATE = 0.02; // 2% unmapped
const CV_BUFFER = 1.1; // 10% coefficient of variation buffer

export function requiredGbPerSample(coverageX: number): number {
  return (
    GENOME_SIZE_GB * coverageX * (1 + DUP_RATE) * (1 + UNMAPPED_RATE) * CV_BUFFER
  );
}

/**
 * Dynamic samples-per-run at any coverage depth.
 * At 30x on a 25B FC (2500 Gb): floor(2500 / 109.5) = 22
 * At 1.5x on UG S4 (2500 Gb): floor(2500 / 5.48) = 456
 */
export function samplesPerRun(
  config: PlatformConfig,
  coverageX: number,
): number {
  if (coverageX <= 0) return 0;
  const gbPerSample = requiredGbPerSample(coverageX);
  return Math.floor(config.outputGb / gbPerSample);
}

/**
 * Sequencing consumable cost per sample at a given coverage.
 * This is the per-run cost divided by samples that fit at that depth.
 */
export function seqCostPerSample(
  config: PlatformConfig,
  coverageX: number,
): number {
  const spr = samplesPerRun(config, coverageX);
  if (spr <= 0) return config.listCostPerRun; // single sample can't fill a run
  return config.listCostPerRun / spr;
}

/**
 * Instrument amortization cost per sample at a given coverage and throughput.
 */
export function instrumentAmortPerSample(
  config: PlatformConfig,
  coverageX: number,
): number {
  const spr = samplesPerRun(config, coverageX);
  if (spr <= 0) return 0;
  const annualAmort = config.instrumentCost / config.amortYears;
  return annualAmort / (config.maxRunsPerYear * spr);
}

// ---------------------------------------------------------------------------
// Platform definitions — from GSheet Seq Config tab
// ---------------------------------------------------------------------------

export const PLATFORMS: PlatformConfig[] = [
  // --- Illumina NovaSeq X Plus ---
  {
    id: "novaseq_25b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "25B Flowcell",
    outputGb: 2500,
    runTimeHours: 48,
    listCostPerRun: 8550,
    instrumentCost: 985_000,
    amortYears: 4,
    maxRunsPerYear: 156,
  },
  {
    id: "novaseq_10b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "10B Flowcell",
    outputGb: 1000,
    runTimeHours: 48,
    listCostPerRun: 5540,
    instrumentCost: 985_000,
    amortYears: 4,
    maxRunsPerYear: 156,
  },
  {
    id: "novaseq_1.5b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "1.5B Flowcell",
    outputGb: 150,
    runTimeHours: 24,
    listCostPerRun: 1675,
    instrumentCost: 985_000,
    amortYears: 4,
    maxRunsPerYear: 312,
  },

  // --- Ultima Genomics UG 100 ---
  {
    id: "ug100_s4",
    platform: "ultima",
    instrument: "UG 100",
    consumable: "S4 Wafer",
    outputGb: 2500,
    runTimeHours: 20,
    listCostPerRun: 2400,
    instrumentCost: 599_000,
    amortYears: 4,
    maxRunsPerYear: 365,
  },
  {
    id: "ug100_s2",
    platform: "ultima",
    instrument: "UG 100",
    consumable: "S2 Wafer",
    outputGb: 750,
    runTimeHours: 20,
    listCostPerRun: 1300,
    instrumentCost: 599_000,
    amortYears: 4,
    maxRunsPerYear: 365,
  },

  // --- Oxford Nanopore ---
  {
    id: "promethion_s",
    platform: "ont",
    instrument: "PromethION 2 Solo",
    consumable: "PromethION Flowcell",
    outputGb: 100,
    runTimeHours: 72,
    listCostPerRun: 900,
    instrumentCost: 25_000,
    amortYears: 4,
    maxRunsPerYear: 104,
  },
  {
    id: "promethion_48",
    platform: "ont",
    instrument: "PromethION 48",
    consumable: "PromethION Flowcell",
    outputGb: 100,
    runTimeHours: 72,
    listCostPerRun: 900,
    instrumentCost: 295_000,
    amortYears: 4,
    maxRunsPerYear: 2496,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getPlatform(id: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export function getPlatformsByType(
  platform: "illumina" | "ultima" | "ont",
): PlatformConfig[] {
  return PLATFORMS.filter((p) => p.platform === platform);
}

/**
 * Pick a sensible default config for a platform.
 * Illumina → 25B (highest throughput), Ultima → S4, ONT → P2 Solo
 */
export function defaultConfigId(
  platform: "illumina" | "ultima" | "ont",
): string {
  const defaults: Record<string, string> = {
    illumina: "novaseq_25b",
    ultima: "ug100_s4",
    ont: "promethion_s",
  };
  return defaults[platform];
}
