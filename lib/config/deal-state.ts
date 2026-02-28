/**
 * Deal Wizard State Management
 *
 * useReducer-based state for the Deal Wizard. Manages:
 * - Deal metadata (client, deal name, volume, margin)
 * - Selected product preset
 * - 8-dimension DealConfig with per-dimension overrides
 * - Conversion to DealInput for the COGS engine
 */

import type {
  DealConfig,
  CustomerType,
  EngagementModel,
  SampleCharacteristics,
  TestConfiguration,
  DeliverableSet,
  RegulatoryLevel,
  LogisticsConfig,
  TATConfig,
} from "./dimensions";
import { createEmptyConfig } from "./dimensions";
import { PRODUCT_PRESETS, type ProductPreset } from "./presets";
import type { DealInput } from "@/lib/engine/types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface DealWizardState {
  clientName: string;
  dealName: string;
  term: string;
  selectedPresetId: string | null;
  config: DealConfig;
  annualVolume: number;
  batchSize: number;
  marginPct: number;
}

export function createInitialState(): DealWizardState {
  return {
    clientName: "",
    dealName: "",
    term: "12 months",
    selectedPresetId: null,
    config: createEmptyConfig(),
    annualVolume: 1000,
    batchSize: 96,
    marginPct: 0.35,
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type DealAction =
  | { type: "SELECT_PRESET"; presetId: string }
  | { type: "SET_FIELD"; field: "clientName" | "dealName" | "term"; value: string }
  | { type: "SET_VOLUME"; value: number }
  | { type: "SET_MARGIN"; value: number }
  | { type: "SET_BATCH_SIZE"; value: number }
  | { type: "SET_CUSTOMER_TYPE"; value: CustomerType | null }
  | { type: "SET_ENGAGEMENT_MODEL"; value: EngagementModel | null }
  | { type: "SET_SAMPLE"; updates: Partial<SampleCharacteristics> }
  | { type: "SET_TEST_CONFIG"; updates: Partial<TestConfiguration> }
  | { type: "SET_DELIVERABLES"; updates: Partial<DeliverableSet> }
  | { type: "SET_REGULATORY"; value: RegulatoryLevel | null }
  | { type: "SET_LOGISTICS"; updates: Partial<LogisticsConfig> }
  | { type: "SET_TAT"; updates: Partial<TATConfig> }
  | { type: "RESET" };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function dealReducer(state: DealWizardState, action: DealAction): DealWizardState {
  switch (action.type) {
    case "SELECT_PRESET": {
      const presetConfig = PRESET_CONFIGS[action.presetId];
      if (!presetConfig) return state;
      return {
        ...state,
        selectedPresetId: action.presetId,
        config: presetConfig.config,
        annualVolume: presetConfig.defaults.annualVolume,
        marginPct: presetConfig.defaults.marginPct,
        batchSize: presetConfig.defaults.batchSize,
      };
    }
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_VOLUME":
      return { ...state, annualVolume: action.value };
    case "SET_MARGIN":
      return { ...state, marginPct: action.value };
    case "SET_BATCH_SIZE":
      return { ...state, batchSize: action.value };
    case "SET_CUSTOMER_TYPE":
      return { ...state, config: { ...state.config, customerType: action.value } };
    case "SET_ENGAGEMENT_MODEL":
      return { ...state, config: { ...state.config, engagementModel: action.value } };
    case "SET_SAMPLE":
      return {
        ...state,
        config: {
          ...state.config,
          sampleCharacteristics: {
            sampleType: "blood_edta",
            volumeRange: "100_1000",
            extractionNeeded: true,
            kitsProvided: false,
            ...state.config.sampleCharacteristics,
            ...action.updates,
          },
        },
      };
    case "SET_TEST_CONFIG":
      return {
        ...state,
        config: {
          ...state.config,
          testConfiguration: {
            shortReadPlatform: "ultima",
            longReadPlatform: "none",
            shortReadDepth: "30x",
            longReadDepth: "none",
            assayType: "wgs",
            addOns: [],
            ...state.config.testConfiguration,
            ...action.updates,
          },
        },
      };
    case "SET_DELIVERABLES":
      return {
        ...state,
        config: {
          ...state.config,
          deliverables: {
            fastq: false,
            bam_cram: false,
            vcf: false,
            clinical_report: false,
            interpretation: false,
            research_summary: false,
            ...state.config.deliverables,
            ...action.updates,
          },
        },
      };
    case "SET_REGULATORY":
      return { ...state, config: { ...state.config, regulatoryLevel: action.value } };
    case "SET_LOGISTICS":
      return {
        ...state,
        config: {
          ...state.config,
          logistics: {
            kitShipping: false,
            sampleTracking: false,
            chainOfCustody: false,
            international: false,
            ...state.config.logistics,
            ...action.updates,
          },
        },
      };
    case "SET_TAT":
      return {
        ...state,
        config: {
          ...state.config,
          tat: {
            tier: "standard",
            standardDays: 14,
            expeditedDays: 7,
            statDays: 3,
            ...state.config.tat,
            ...action.updates,
          },
        },
      };
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Preset → DealConfig mappings
// ---------------------------------------------------------------------------

interface PresetDefaults {
  config: DealConfig;
  defaults: { annualVolume: number; marginPct: number; batchSize: number };
}

const PRESET_CONFIGS: Record<string, PresetDefaults> = {
  inflection_rwgs: {
    config: {
      customerType: "health_system",
      engagementModel: "ongoing_partnership",
      sampleCharacteristics: {
        sampleType: "blood_edta",
        volumeRange: "100_1000",
        extractionNeeded: true,
        kitsProvided: false,
      },
      testConfiguration: {
        shortReadPlatform: "ultima",
        longReadPlatform: "ont",
        shortReadDepth: "30x",
        longReadDepth: "10x",
        assayType: "wgs",
        addOns: [],
      },
      deliverables: {
        fastq: false,
        bam_cram: true,
        vcf: true,
        clinical_report: true,
        interpretation: true,
        research_summary: false,
      },
      regulatoryLevel: "clia_cap",
      logistics: {
        kitShipping: false,
        sampleTracking: true,
        chainOfCustody: true,
        international: false,
      },
      tat: { tier: "stat", standardDays: 14, expeditedDays: 7, statDays: 3 },
    },
    defaults: { annualVolume: 500, marginPct: 0.40, batchSize: 48 },
  },

  clinical_standard: {
    config: {
      customerType: "health_system",
      engagementModel: "ongoing_partnership",
      sampleCharacteristics: {
        sampleType: "blood_edta",
        volumeRange: "100_1000",
        extractionNeeded: true,
        kitsProvided: false,
      },
      testConfiguration: {
        shortReadPlatform: "illumina",
        longReadPlatform: "none",
        shortReadDepth: "30x",
        longReadDepth: "none",
        assayType: "wgs",
        addOns: [],
      },
      deliverables: {
        fastq: false,
        bam_cram: true,
        vcf: true,
        clinical_report: true,
        interpretation: false,
        research_summary: false,
      },
      regulatoryLevel: "clia_cap",
      logistics: {
        kitShipping: false,
        sampleTracking: true,
        chainOfCustody: false,
        international: false,
      },
      tat: { tier: "standard", standardDays: 14, expeditedDays: 7, statDays: 3 },
    },
    defaults: { annualVolume: 2000, marginPct: 0.35, batchSize: 96 },
  },

  lowpass_genome: {
    config: {
      customerType: "dtc_company",
      engagementModel: "per_sample_service",
      sampleCharacteristics: {
        sampleType: "saliva",
        volumeRange: "1000_plus",
        extractionNeeded: true,
        kitsProvided: true,
      },
      testConfiguration: {
        shortReadPlatform: "ultima",
        longReadPlatform: "none",
        shortReadDepth: "1x",
        longReadDepth: "none",
        assayType: "lowpass",
        addOns: [],
      },
      deliverables: {
        fastq: true,
        bam_cram: false,
        vcf: true,
        clinical_report: false,
        interpretation: false,
        research_summary: false,
      },
      regulatoryLevel: "ruo",
      logistics: {
        kitShipping: true,
        sampleTracking: true,
        chainOfCustody: false,
        international: false,
      },
      tat: { tier: "standard", standardDays: 14, expeditedDays: 7, statDays: 3 },
    },
    defaults: { annualVolume: 10000, marginPct: 0.25, batchSize: 96 },
  },

  biobank: {
    config: {
      customerType: "enterprise_pharma",
      engagementModel: "multi_phase_pilot",
      sampleCharacteristics: {
        sampleType: "blood_edta",
        volumeRange: "1000_plus",
        extractionNeeded: true,
        kitsProvided: false,
      },
      testConfiguration: {
        shortReadPlatform: "ultima",
        longReadPlatform: "none",
        shortReadDepth: "15x",
        longReadDepth: "none",
        assayType: "wgs",
        addOns: [],
      },
      deliverables: {
        fastq: true,
        bam_cram: true,
        vcf: true,
        clinical_report: false,
        interpretation: false,
        research_summary: false,
      },
      regulatoryLevel: "ruo",
      logistics: {
        kitShipping: false,
        sampleTracking: false,
        chainOfCustody: false,
        international: false,
      },
      tat: { tier: "standard", standardDays: 14, expeditedDays: 7, statDays: 3 },
    },
    defaults: { annualVolume: 5000, marginPct: 0.30, batchSize: 96 },
  },

  "23andme_dtc": {
    config: {
      customerType: "dtc_company",
      engagementModel: "ongoing_partnership",
      sampleCharacteristics: {
        sampleType: "saliva",
        volumeRange: "1000_plus",
        extractionNeeded: true,
        kitsProvided: true,
      },
      testConfiguration: {
        shortReadPlatform: "ultima",
        longReadPlatform: "none",
        shortReadDepth: "30x",
        longReadDepth: "none",
        assayType: "wgs",
        addOns: [],
      },
      deliverables: {
        fastq: true,
        bam_cram: false,
        vcf: true,
        clinical_report: false,
        interpretation: false,
        research_summary: false,
      },
      regulatoryLevel: "ruo",
      logistics: {
        kitShipping: true,
        sampleTracking: true,
        chainOfCustody: false,
        international: false,
      },
      tat: { tier: "standard", standardDays: 14, expeditedDays: 7, statDays: 3 },
    },
    defaults: { annualVolume: 50000, marginPct: 0.20, batchSize: 96 },
  },

  custom: {
    config: createEmptyConfig(),
    defaults: { annualVolume: 1000, marginPct: 0.35, batchSize: 96 },
  },
};

// ---------------------------------------------------------------------------
// DealConfig → DealInput conversion (for COGS engine)
// ---------------------------------------------------------------------------

function parseDepthToNumber(depth: string): number {
  const n = parseFloat(depth.replace("x", ""));
  return isNaN(n) ? 30 : n;
}

const SAMPLE_TYPE_MAP: Record<string, DealInput["sampleType"]> = {
  blood_edta: "blood",
  saliva: "saliva",
  dbs: "dbs",
  tissue: "tissue",
  other: "blood",
};

export function configToDealInput(state: DealWizardState): Partial<DealInput> {
  const { config } = state;
  const tc = config.testConfiguration;
  const sc = config.sampleCharacteristics;
  const del = config.deliverables;

  const deliverables: string[] = [];
  if (del?.fastq) deliverables.push("fastq");
  if (del?.bam_cram) deliverables.push("bam");
  if (del?.vcf) deliverables.push("vcf");
  if (del?.clinical_report) deliverables.push("clinical_report");
  if (del?.interpretation) deliverables.push("interpretation");

  return {
    shortReadPlatform:
      tc?.shortReadPlatform === "none" || tc?.shortReadPlatform === "both"
        ? tc?.shortReadPlatform === "both"
          ? "ultima"
          : null
        : tc?.shortReadPlatform ?? null,
    shortReadCoverageX: tc ? parseDepthToNumber(tc.shortReadDepth) : 30,
    longReadPlatform: tc?.longReadPlatform === "none" ? null : tc?.longReadPlatform ?? null,
    longReadCoverageX:
      tc?.longReadDepth && tc.longReadDepth !== "none"
        ? parseDepthToNumber(tc.longReadDepth)
        : 0,
    annualVolume: state.annualVolume,
    batchSize: state.batchSize,
    deliverables,
    regulatoryLevel:
      config.regulatoryLevel === "ivd_ready"
        ? "clia_cap"
        : config.regulatoryLevel ?? "ruo",
    tatTier: config.tat?.tier ?? "standard",
    sampleType: sc ? SAMPLE_TYPE_MAP[sc.sampleType] ?? "blood" : "blood",
    extractionNeeded: sc?.extractionNeeded ?? true,
    kitShipping: config.logistics?.kitShipping ?? false,
    currentWeeklyVolume: 0,
    instrumentCount: 1,
    marginPct: state.marginPct,
  };
}

// ---------------------------------------------------------------------------
// Helpers for display
// ---------------------------------------------------------------------------

export function getPresetConfig(presetId: string): PresetDefaults | undefined {
  return PRESET_CONFIGS[presetId];
}

export { PRODUCT_PRESETS };
