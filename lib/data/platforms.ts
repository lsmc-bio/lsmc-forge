/**
 * LSMC Sequencing Platform Configurations
 * Source: COGS Calculator v2 GSheet — Seq Config + Lab Capacity tabs
 * Last synced: 2026-02-27
 *
 * Platform-specific overhead parameters (dup rate, CV buffer) match
 * the Lab Capacity tab. Output Gb and FC costs from Seq Config tab.
 */

import type { PlatformConfig } from "@/lib/engine/types";

// ---------------------------------------------------------------------------
// Core constants
// ---------------------------------------------------------------------------

const GENOME_SIZE_GB = 3.3; // human genome
const UNMAPPED_RATE = 0.02; // 2% unmapped (universal across platforms)
export const UPTIME_FACTOR = 0.85; // 85% uptime (maintenance, calibration, changeover)
export const HOURS_PER_WEEK = 168;

// ---------------------------------------------------------------------------
// Core formula: how many Gb does one sample need at a given coverage?
// ---------------------------------------------------------------------------

/**
 * Required Gb per sample at a given coverage depth.
 * Uses platform-specific dup rate and CV buffer when config is provided,
 * otherwise falls back to Illumina defaults (dup=0.05, CV=1.1).
 */
export function requiredGbPerSample(
  coverageX: number,
  config?: PlatformConfig,
): number {
  const dup = config?.dupRate ?? 0.05;
  const cv = config?.cvBuffer ?? 1.1;
  return GENOME_SIZE_GB * coverageX * (1 + dup) * (1 + UNMAPPED_RATE) * cv;
}

/**
 * Dynamic samples-per-run at any coverage depth.
 * At 30x on a 25B FC (8000 Gb, ILMN overheads): floor(8000 / 116.6) = 68
 * At 30x on UG S4 (3000 Gb, UG overheads): floor(3000 / 124.8) = 24
 */
export function samplesPerRun(
  config: PlatformConfig,
  coverageX: number,
): number {
  if (coverageX <= 0) return 0;
  const gbPerSample = requiredGbPerSample(coverageX, config);
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
// Platform definitions — from GSheet Seq Config + Lab Capacity tabs
// ---------------------------------------------------------------------------

export const PLATFORMS: PlatformConfig[] = [
  // --- Illumina NovaSeq X Plus ---
  {
    id: "novaseq_25b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "25B Flowcell",
    outputGb: 8000,
    runTimeHours: 48,
    listCostPerRun: 14_865,
    instrumentCost: 985_000,
    amortYears: 4,
    maxRunsPerYear: 309,
    positions: 2,
    dupRate: 0.05,
    cvBuffer: 1.1,
  },
  {
    id: "novaseq_10b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "10B Flowcell",
    outputGb: 3000,
    runTimeHours: 25,
    listCostPerRun: 8_615,
    instrumentCost: 985_000,
    amortYears: 4,
    maxRunsPerYear: 594,
    positions: 2,
    dupRate: 0.05,
    cvBuffer: 1.1,
  },
  {
    id: "novaseq_1.5b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "1.5B Flowcell",
    outputGb: 450,
    runTimeHours: 24,
    listCostPerRun: 1_675,
    instrumentCost: 985_000,
    amortYears: 4,
    maxRunsPerYear: 619,
    positions: 2,
    dupRate: 0.05,
    cvBuffer: 1.1,
  },

  // --- Ultima Genomics UG 100 ---
  {
    id: "ug100_s4",
    platform: "ultima",
    instrument: "UG 100",
    consumable: "S4 Wafer",
    outputGb: 3000,
    runTimeHours: 14,
    listCostPerRun: 1_600,
    instrumentCost: 599_000,
    amortYears: 4,
    maxRunsPerYear: 530,
    positions: 1,
    dupRate: 0.03,
    cvBuffer: 1.2,
  },
  {
    id: "ug100_s2",
    platform: "ultima",
    instrument: "UG 100",
    consumable: "S2 Wafer",
    outputGb: 1500,
    runTimeHours: 20,
    listCostPerRun: 1_300,
    instrumentCost: 599_000,
    amortYears: 4,
    maxRunsPerYear: 371,
    positions: 1,
    dupRate: 0.03,
    cvBuffer: 1.2,
  },

  // --- Oxford Nanopore ---
  {
    id: "promethion_s",
    platform: "ont",
    instrument: "PromethION 2 Solo",
    consumable: "PromethION Flowcell",
    outputGb: 200,
    runTimeHours: 72,
    listCostPerRun: 900,
    instrumentCost: 25_000,
    amortYears: 4,
    maxRunsPerYear: 206,
    positions: 2,
    dupRate: 0.05,
    cvBuffer: 1.1,
  },
  {
    id: "promethion_48",
    platform: "ont",
    instrument: "PromethION 48",
    consumable: "PromethION Flowcell",
    outputGb: 200,
    runTimeHours: 72,
    listCostPerRun: 900,
    instrumentCost: 295_000,
    amortYears: 4,
    maxRunsPerYear: 4946,
    positions: 48,
    dupRate: 0.05,
    cvBuffer: 1.1,
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
