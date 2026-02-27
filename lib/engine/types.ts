/**
 * LSMC COGS Engine — Shared Types
 *
 * DealInput describes a deal configuration. COGSBreakdown is the
 * 14-stage cost output. All dollar values are per-sample unless noted.
 */

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface DealInput {
  // Platform selection
  shortReadPlatform: "illumina" | "ultima" | null;
  shortReadConfigId: string | null; // specific FC/wafer type, e.g. "novaseq_25b"
  shortReadCoverageX: number; // e.g. 30, 15, 1.5, 0.5

  longReadPlatform: "ont" | null;
  longReadConfigId: string | null; // e.g. "promethion_s"
  longReadCoverageX: number; // e.g. 10, 5, 0

  // Volume
  annualVolume: number;
  batchSize: number; // samples per batch (default 96)

  // Deliverables & regulatory
  deliverables: string[]; // e.g. ["fastq", "vcf", "bam", "clinical_report", "interpretation"]
  regulatoryLevel: "ruo" | "clia" | "clia_cap";
  tatTier: "standard" | "expedited" | "stat";

  // Sample
  sampleType: "blood" | "saliva" | "dbs" | "tissue";
  extractionNeeded: boolean;
  kitShipping: boolean;

  // Capacity context
  currentWeeklyVolume: number; // existing samples/week on this platform
  instrumentCount: number; // how many instruments of this type

  // Margin
  marginPct: number; // e.g. 0.35
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

export interface COGSBreakdown {
  // Per-sample costs by stage (the 14-stage breakdown)
  accessioning: number;
  extraction: number;
  libraryPrep: number;
  qc: number;
  sequencingShortRead: number;
  sequencingLongRead: number;
  instrumentAmortization: number;
  secondaryAnalysis: number;
  tertiaryAnalysis: number;
  clinicalSignOut: number;
  dataStorage: number;
  labor: number;
  logistics: number;
  overhead: number;

  // Rollups
  variableCost: number; // sum of per-sample consumable + compute costs
  overheadPerSample: number; // annual overhead / annual volume
  fullyBurdenedCost: number; // variable + overhead + amort
  targetMarginPct: number;
  recommendedPrice: number;

  // Annual projections
  annualRevenue: number;
  annualCost: number;
  annualProfit: number;

  // Capacity context
  capacityUtilization: number; // 0-1
  samplesPerRunSR: number; // at this SR coverage depth
  samplesPerRunLR: number; // at this LR coverage depth
  runsNeededSR: number;
  runsNeededLR: number;
  marginalCostFlag: boolean; // true if absorbed into spare capacity
}

// ---------------------------------------------------------------------------
// Platform config (used by data layer, referenced by engine)
// ---------------------------------------------------------------------------

export interface PlatformConfig {
  id: string;
  platform: "illumina" | "ultima" | "ont";
  instrument: string;
  consumable: string;
  outputGb: number; // Gb per run/wafer/flowcell
  runTimeHours: number;
  listCostPerRun: number; // consumable cost per run
  instrumentCost: number; // capital cost
  amortYears: number;
  maxRunsPerYear: number; // theoretical max throughput
}

// ---------------------------------------------------------------------------
// Consumable (used by data layer)
// ---------------------------------------------------------------------------

export interface ConsumableItem {
  id: string;
  name: string;
  vendor: string;
  costPerUnit: number;
  unit: string;
  costPerReaction: number;
  perBatchFixedCost: number;
  category:
    | "accessioning"
    | "extraction"
    | "library_prep"
    | "qc"
    | "logistics";
}

// ---------------------------------------------------------------------------
// Labor
// ---------------------------------------------------------------------------

export type RateCategory = "tech_1" | "tech_2" | "senior_tech" | "scientist";

export interface LaborStage {
  stage: string;
  rateCategory: RateCategory;
  baseTimeMinutes: number; // per-batch fixed time
  incrementalMinutesPerSample: number;
}

// ---------------------------------------------------------------------------
// Compute & analysis
// ---------------------------------------------------------------------------

export interface AnalysisConfig {
  secondary: { perSample: number };
  tertiary: { perSample: number };
  clinicalSignOut: { perSample: number };
  storage: { perGbPerMonth: number; retentionMonths: number };
}

// ---------------------------------------------------------------------------
// Capacity
// ---------------------------------------------------------------------------

export interface CapacityContext {
  instruments: { configId: string; count: number }[];
  currentWeeklySamples: number;
  currentCoverageX: number;
}

export interface CapacityResult {
  scenario: "absorbed" | "incremental" | "blended";
  effectiveSeqCostPerSample: number;
  utilizationBefore: number;
  utilizationAfter: number;
  additionalRunsNeeded: number;
}
