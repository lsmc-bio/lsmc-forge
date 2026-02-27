/**
 * LSMC Fixed Annual Overhead
 * Source: COGS Calculator v2 GSheet — Emily COGS Model tab
 * Last synced: 2026-02-27
 */

export const ANNUAL_OVERHEAD = {
  personnel: 1_440_000,
  facility: 360_000,
  equipmentAmort: 624_908, // non-sequencing equipment
  itInfrastructure: 180_000,
  qualityCompliance: 120_000,
  insuranceLegal: 100_000,
  subtotal: 2_824_908,
  bufferPct: 0.25,
  totalWithBuffer: 3_531_135,
} as const;

/**
 * Overhead per sample, spread across total annual volume.
 * The annual volume should be the TOTAL lab volume, not just one deal.
 */
export function overheadPerSample(totalAnnualVolume: number): number {
  if (totalAnnualVolume <= 0) return 0;
  return ANNUAL_OVERHEAD.totalWithBuffer / totalAnnualVolume;
}
