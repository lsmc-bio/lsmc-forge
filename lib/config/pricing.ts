/**
 * LSMC COGS Pricing Data — hardcoded from COGS Calculator v2 GSheet
 * Source: https://docs.google.com/spreadsheets/d/1HoYHMxcSBF4Mrgq7LfFfFL0H5LqLjfeN8brWlxES6Xk
 * Last synced: 2026-02-27
 *
 * Phase 0: static data. Phase 1+: read from GSheets API.
 */

// --- Variable BOM per sample (from Calculator tab) ---

export type PlatformConfig = "ug_only" | "ug_hybrid" | "ilmn_only" | "ilmn_hybrid";

export const VARIABLE_BOM: Record<PlatformConfig, number> = {
  ug_only: 98.0,
  ug_hybrid: 324.0,
  ilmn_only: 453.0,
  ilmn_hybrid: 679.0,
};

// --- Fixed annual overhead (from Fully Burdened tab) ---

export const ANNUAL_OVERHEAD = {
  personnel: 1_440_000,
  facility: 360_000,
  equipment_amort: 624_908,
  it_infrastructure: 180_000,
  quality_compliance: 120_000,
  insurance_legal: 100_000,
  subtotal: 2_824_908,
  buffer_pct: 0.25,
  total_with_buffer: 3_531_135,
} as const;

// --- Fully burdened cost per sample at volume tiers ---

export type VolumeTier = 1200 | 2400 | 6000 | 12000 | 60000 | 120000 | 600000;

export interface FullyBurdenedRow {
  volume: VolumeTier;
  overhead_per_sample: number;
  costs: Record<PlatformConfig, { total: number; margin_25_price: number }>;
}

export const FULLY_BURDENED: FullyBurdenedRow[] = [
  {
    volume: 1200,
    overhead_per_sample: 2942.61,
    costs: {
      ug_only: { total: 3040.61, margin_25_price: 4054.15 },
      ug_hybrid: { total: 3266.61, margin_25_price: 4355.48 },
      ilmn_only: { total: 3395.61, margin_25_price: 4527.48 },
      ilmn_hybrid: { total: 3621.61, margin_25_price: 4828.81 },
    },
  },
  {
    volume: 2400,
    overhead_per_sample: 1471.31,
    costs: {
      ug_only: { total: 1569.31, margin_25_price: 2092.41 },
      ug_hybrid: { total: 1795.31, margin_25_price: 2393.74 },
      ilmn_only: { total: 1924.31, margin_25_price: 2565.74 },
      ilmn_hybrid: { total: 2150.31, margin_25_price: 2867.08 },
    },
  },
  {
    volume: 6000,
    overhead_per_sample: 588.52,
    costs: {
      ug_only: { total: 686.52, margin_25_price: 915.37 },
      ug_hybrid: { total: 912.52, margin_25_price: 1216.70 },
      ilmn_only: { total: 1041.52, margin_25_price: 1388.70 },
      ilmn_hybrid: { total: 1267.52, margin_25_price: 1690.03 },
    },
  },
  {
    volume: 12000,
    overhead_per_sample: 294.26,
    costs: {
      ug_only: { total: 392.26, margin_25_price: 523.01 },
      ug_hybrid: { total: 618.26, margin_25_price: 824.35 },
      ilmn_only: { total: 747.26, margin_25_price: 996.35 },
      ilmn_hybrid: { total: 973.26, margin_25_price: 1297.68 },
    },
  },
  {
    volume: 60000,
    overhead_per_sample: 58.85,
    costs: {
      ug_only: { total: 156.85, margin_25_price: 209.14 },
      ug_hybrid: { total: 382.85, margin_25_price: 510.47 },
      ilmn_only: { total: 511.85, margin_25_price: 682.47 },
      ilmn_hybrid: { total: 737.85, margin_25_price: 983.80 },
    },
  },
  {
    volume: 120000,
    overhead_per_sample: 29.43,
    costs: {
      ug_only: { total: 127.43, margin_25_price: 169.90 },
      ug_hybrid: { total: 353.43, margin_25_price: 471.23 },
      ilmn_only: { total: 482.43, margin_25_price: 643.23 },
      ilmn_hybrid: { total: 708.43, margin_25_price: 944.57 },
    },
  },
  {
    volume: 600000,
    overhead_per_sample: 5.89,
    costs: {
      ug_only: { total: 103.89, margin_25_price: 138.51 },
      ug_hybrid: { total: 329.89, margin_25_price: 439.85 },
      ilmn_only: { total: 458.89, margin_25_price: 611.85 },
      ilmn_hybrid: { total: 684.89, margin_25_price: 913.18 },
    },
  },
];

// --- Margin calculator ---

export function calculatePrice(
  costPerSample: number,
  marginPct: number,
): number {
  return costPerSample / (1 - marginPct);
}

export function findNearestTier(annualVolume: number): VolumeTier {
  const tiers: VolumeTier[] = [1200, 2400, 6000, 12000, 60000, 120000, 600000];
  let nearest = tiers[0];
  let minDiff = Math.abs(annualVolume - tiers[0]);
  for (const tier of tiers) {
    const diff = Math.abs(annualVolume - tier);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = tier;
    }
  }
  return nearest;
}

export function getFullyBurdenedCost(
  platform: PlatformConfig,
  annualVolume: number,
): { costPerSample: number; tier: VolumeTier } {
  const tier = findNearestTier(annualVolume);
  const row = FULLY_BURDENED.find((r) => r.volume === tier)!;
  return { costPerSample: row.costs[platform].total, tier };
}
