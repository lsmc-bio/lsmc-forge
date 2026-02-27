/**
 * LSMC COGS Calculator — 14-Stage Per-Sample Cost Engine
 *
 * Mirrors the GSheet Calculator tab's stage breakdown. Every dollar
 * is accounted for from accessioning through margin.
 *
 * Source: COGS Calculator v2 GSheet
 * Last synced: 2026-02-27
 */

import type { DealInput, COGSBreakdown } from "./types";
import {
  getPlatform,
  samplesPerRun,
  seqCostPerSample,
  instrumentAmortPerSample,
  requiredGbPerSample,
  defaultConfigId,
} from "@/lib/data/platforms";
import {
  getConsumable,
  extractionKitId,
  libPrepKitId,
} from "@/lib/data/consumables";
import { calculateLaborPerSample } from "@/lib/data/labor";
import { buildAnalysisConfig, storageCostPerSample } from "@/lib/data/compute";
import { overheadPerSample } from "@/lib/data/overhead";
import { DEFAULT_CAPACITY } from "./capacity";

// ---------------------------------------------------------------------------
// Defaults for optional fields
// ---------------------------------------------------------------------------

const DEFAULTS: Partial<DealInput> = {
  shortReadPlatform: "ultima",
  shortReadCoverageX: 30,
  longReadPlatform: null,
  longReadCoverageX: 0,
  batchSize: 96,
  deliverables: ["fastq", "vcf"],
  regulatoryLevel: "ruo",
  tatTier: "standard",
  sampleType: "blood",
  extractionNeeded: true,
  kitShipping: false,
  currentWeeklyVolume: 0,
  instrumentCount: 1,
  marginPct: 0.35,
};

export function applyDefaults(partial: Partial<DealInput>): DealInput {
  const merged = { ...DEFAULTS, ...partial } as DealInput;

  // Auto-resolve config IDs if not specified
  if (merged.shortReadPlatform && !merged.shortReadConfigId) {
    merged.shortReadConfigId = defaultConfigId(merged.shortReadPlatform);
  }
  if (merged.longReadPlatform && !merged.longReadConfigId) {
    merged.longReadConfigId = defaultConfigId(merged.longReadPlatform);
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

export function calculateCOGS(partialInput: Partial<DealInput>): COGSBreakdown {
  const input = applyDefaults(partialInput);

  // --- Stage 1: Accessioning ---
  const accKit = getConsumable("accessioning_supplies");
  const accessioning = accKit ? accKit.costPerReaction : 2.5;

  // --- Stage 2: Extraction ---
  let extraction = 0;
  if (input.extractionNeeded) {
    const extKit = getConsumable(extractionKitId(input.sampleType));
    if (extKit) {
      extraction =
        extKit.costPerReaction + extKit.perBatchFixedCost / input.batchSize;
    }
  }

  // --- Stage 3: Library Prep ---
  let libraryPrep = 0;
  // Short-read lib prep
  if (input.shortReadPlatform) {
    const srKit = getConsumable(libPrepKitId(input.shortReadPlatform));
    if (srKit) {
      libraryPrep +=
        srKit.costPerReaction + srKit.perBatchFixedCost / input.batchSize;
    }
  }
  // Long-read lib prep (separate library for ONT)
  if (input.longReadPlatform) {
    const lrKit = getConsumable(libPrepKitId(input.longReadPlatform));
    if (lrKit) {
      libraryPrep +=
        lrKit.costPerReaction + lrKit.perBatchFixedCost / input.batchSize;
    }
  }

  // --- Stage 4: QC ---
  const qubit = getConsumable("qc_qubit");
  const tape = getConsumable("qc_tapestation");
  const qc = (qubit?.costPerReaction ?? 0.64) + (tape?.costPerReaction ?? 4.0);

  // --- Stage 5: Sequencing (Short Read) ---
  let sequencingShortRead = 0;
  let samplesPerRunSR = 0;
  if (input.shortReadPlatform && input.shortReadConfigId) {
    const srConfig = getPlatform(input.shortReadConfigId);
    if (srConfig) {
      sequencingShortRead = seqCostPerSample(srConfig, input.shortReadCoverageX);
      samplesPerRunSR = samplesPerRun(srConfig, input.shortReadCoverageX);
    }
  }

  // --- Stage 6: Sequencing (Long Read) ---
  let sequencingLongRead = 0;
  let samplesPerRunLR = 0;
  if (input.longReadPlatform && input.longReadConfigId && input.longReadCoverageX > 0) {
    const lrConfig = getPlatform(input.longReadConfigId);
    if (lrConfig) {
      sequencingLongRead = seqCostPerSample(lrConfig, input.longReadCoverageX);
      samplesPerRunLR = samplesPerRun(lrConfig, input.longReadCoverageX);
    }
  }

  // --- Stage 7: Instrument Amortization ---
  let instrumentAmortization = 0;
  if (input.shortReadConfigId) {
    const srConfig = getPlatform(input.shortReadConfigId);
    if (srConfig) {
      instrumentAmortization += instrumentAmortPerSample(
        srConfig,
        input.shortReadCoverageX,
      );
    }
  }
  if (input.longReadConfigId && input.longReadCoverageX > 0) {
    const lrConfig = getPlatform(input.longReadConfigId);
    if (lrConfig) {
      instrumentAmortization += instrumentAmortPerSample(
        lrConfig,
        input.longReadCoverageX,
      );
    }
  }

  // --- Stage 8-10: Analysis ---
  const analysisConfig = buildAnalysisConfig(
    input.shortReadPlatform,
    input.longReadPlatform,
    input.deliverables,
    input.regulatoryLevel,
  );
  const secondaryAnalysis = analysisConfig.secondary.perSample;
  const tertiaryAnalysis = analysisConfig.tertiary.perSample;
  const clinicalSignOut = analysisConfig.clinicalSignOut.perSample;

  // --- Stage 11: Data Storage ---
  const dataStorage = storageCostPerSample(
    input.shortReadCoverageX,
    input.longReadCoverageX,
  );

  // --- Stage 12: Labor ---
  const labor = calculateLaborPerSample(input.batchSize, input.tatTier);

  // --- Stage 13: Logistics ---
  let logistics = 0;
  if (input.kitShipping) {
    const kitShip = getConsumable("kit_shipping");
    const returnShip = getConsumable("return_shipping");
    logistics = (kitShip?.costPerReaction ?? 18.5) + (returnShip?.costPerReaction ?? 35.0);
  }

  // --- Stage 14: Overhead ---
  // Spread across TOTAL lab volume (existing + this deal), not just deal volume
  const existingAnnualVolume = DEFAULT_CAPACITY.currentWeeklySamples * 52;
  const totalLabAnnualVolume = existingAnnualVolume + input.annualVolume;
  const overhead = overheadPerSample(totalLabAnnualVolume);

  // --- Rollups ---
  const variableCost =
    accessioning +
    extraction +
    libraryPrep +
    qc +
    sequencingShortRead +
    sequencingLongRead +
    secondaryAnalysis +
    tertiaryAnalysis +
    clinicalSignOut +
    dataStorage +
    labor +
    logistics;

  const fullyBurdenedCost =
    variableCost + instrumentAmortization + overhead;

  const recommendedPrice =
    input.marginPct < 1
      ? fullyBurdenedCost / (1 - input.marginPct)
      : fullyBurdenedCost;

  // --- Capacity ---
  const runsNeededSR =
    samplesPerRunSR > 0
      ? Math.ceil(input.annualVolume / samplesPerRunSR)
      : 0;
  const runsNeededLR =
    samplesPerRunLR > 0
      ? Math.ceil(input.annualVolume / samplesPerRunLR)
      : 0;

  let capacityUtilization = 0;
  if (input.shortReadConfigId) {
    const srConfig = getPlatform(input.shortReadConfigId);
    if (srConfig) {
      const maxSamplesPerYear =
        srConfig.maxRunsPerYear * samplesPerRunSR * input.instrumentCount;
      capacityUtilization =
        maxSamplesPerYear > 0 ? input.annualVolume / maxSamplesPerYear : 0;
    }
  }

  return {
    // Per-stage costs
    accessioning: round(accessioning),
    extraction: round(extraction),
    libraryPrep: round(libraryPrep),
    qc: round(qc),
    sequencingShortRead: round(sequencingShortRead),
    sequencingLongRead: round(sequencingLongRead),
    instrumentAmortization: round(instrumentAmortization),
    secondaryAnalysis: round(secondaryAnalysis),
    tertiaryAnalysis: round(tertiaryAnalysis),
    clinicalSignOut: round(clinicalSignOut),
    dataStorage: round(dataStorage),
    labor: round(labor),
    logistics: round(logistics),
    overhead: round(overhead),

    // Rollups
    variableCost: round(variableCost),
    overheadPerSample: round(overhead),
    fullyBurdenedCost: round(fullyBurdenedCost),
    targetMarginPct: input.marginPct,
    recommendedPrice: round(recommendedPrice),

    // Annual
    annualRevenue: Math.round(recommendedPrice * input.annualVolume),
    annualCost: Math.round(fullyBurdenedCost * input.annualVolume),
    annualProfit: Math.round(
      (recommendedPrice - fullyBurdenedCost) * input.annualVolume,
    ),

    // Capacity
    capacityUtilization: round(capacityUtilization),
    samplesPerRunSR,
    samplesPerRunLR,
    runsNeededSR,
    runsNeededLR,
    marginalCostFlag: input.currentWeeklyVolume > 0,
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function round(n: number, decimals: number = 2): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}
