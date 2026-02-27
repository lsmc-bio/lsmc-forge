/**
 * LSMC Compute, Analysis & Storage Costs
 * Source: COGS Calculator v2 GSheet — Compute & Storage tab
 * Last synced: 2026-02-27
 *
 * Reference: John Major AWS benchmarks — $3/sample actual (30x ILMN, Sentieon + EC2)
 * vs $12-16 DRAGEN Cloud. On-demand for clinical, spot for research.
 */

import type { AnalysisConfig } from "@/lib/engine/types";
import { requiredGbPerSample } from "./platforms";

// ---------------------------------------------------------------------------
// Analysis cost configs by platform / deliverable mix
// ---------------------------------------------------------------------------

/**
 * Secondary analysis: alignment + variant calling.
 * Platform-dependent because different tools have different compute profiles.
 */
export const SECONDARY_ANALYSIS: Record<string, number> = {
  illumina: 4.0, // Sentieon BWA + HC on EC2 — $3-5 range
  ultima: 5.5, // Sentieon + Ultima-specific caller
  ont: 13.25, // Dorado basecalling + minimap2 + Clair3
};

/**
 * Tertiary analysis: annotation, filtering, report generation.
 * Deliverable-dependent.
 */
export const TERTIARY_ANALYSIS: Record<string, number> = {
  fastq_only: 0, // no tertiary
  vcf: 3.5, // annotation + filtering
  clinical_report: 12.0, // full clinical pipeline + Fabric/VarSome
  interpretation: 22.5, // + clinical scientist interpretation time
};

/**
 * Clinical sign-out: pathologist/geneticist review.
 * Regulatory-level dependent.
 */
export const CLINICAL_SIGNOUT: Record<string, number> = {
  ruo: 0,
  clia: 8.0, // lab director sign-off
  clia_cap: 15.0, // full clinical sign-out with documentation
};

/**
 * Data storage: per-Gb per-month cost × retention.
 * AWS S3 tiered storage.
 */
export const STORAGE = {
  perGbPerMonth: 0.023, // S3 Standard
  defaultRetentionMonths: 12,
};

// ---------------------------------------------------------------------------
// Helper: build an AnalysisConfig for a specific deal
// ---------------------------------------------------------------------------

export function buildAnalysisConfig(
  srPlatform: "illumina" | "ultima" | null,
  lrPlatform: "ont" | null,
  deliverables: string[],
  regulatoryLevel: "ruo" | "clia" | "clia_cap",
): AnalysisConfig {
  // Secondary: sum across platforms in use
  let secondaryCost = 0;
  if (srPlatform) secondaryCost += SECONDARY_ANALYSIS[srPlatform];
  if (lrPlatform) secondaryCost += SECONDARY_ANALYSIS[lrPlatform];

  // Tertiary: pick the highest-cost deliverable tier
  let tertiaryCost = 0;
  if (deliverables.includes("interpretation")) {
    tertiaryCost = TERTIARY_ANALYSIS.interpretation;
  } else if (deliverables.includes("clinical_report")) {
    tertiaryCost = TERTIARY_ANALYSIS.clinical_report;
  } else if (deliverables.includes("vcf")) {
    tertiaryCost = TERTIARY_ANALYSIS.vcf;
  }

  return {
    secondary: { perSample: secondaryCost },
    tertiary: { perSample: tertiaryCost },
    clinicalSignOut: { perSample: CLINICAL_SIGNOUT[regulatoryLevel] },
    storage: {
      perGbPerMonth: STORAGE.perGbPerMonth,
      retentionMonths: STORAGE.defaultRetentionMonths,
    },
  };
}

/**
 * Calculate storage cost per sample based on coverage depths.
 */
export function storageCostPerSample(
  srCoverageX: number,
  lrCoverageX: number,
  retentionMonths: number = STORAGE.defaultRetentionMonths,
): number {
  const srGb = srCoverageX > 0 ? requiredGbPerSample(srCoverageX) : 0;
  const lrGb = lrCoverageX > 0 ? requiredGbPerSample(lrCoverageX) : 0;
  return (srGb + lrGb) * STORAGE.perGbPerMonth * retentionMonths;
}
