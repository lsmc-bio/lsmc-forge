/**
 * LSMC 8-Dimension Deal Configuration Model
 * Source: Deal Config Wizard PRD (Mithrandir vault)
 *
 * These are the 8 axes that fully describe any LSMC deal.
 * The Deal Agent walks users through these conversationally.
 * The Deal Wizard presents them as a form.
 */

export interface DealConfig {
  customerType: CustomerType | null;
  engagementModel: EngagementModel | null;
  sampleCharacteristics: SampleCharacteristics | null;
  testConfiguration: TestConfiguration | null;
  deliverables: DeliverableSet | null;
  regulatoryLevel: RegulatoryLevel | null;
  logistics: LogisticsConfig | null;
  tat: TATConfig | null;
}

// Dimension 1: Customer Type
export type CustomerType =
  | "enterprise_pharma"
  | "health_system"
  | "diagnostics_lab"
  | "research_institution"
  | "nbs_program"
  | "dtc_company";

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  enterprise_pharma: "Enterprise Pharma / Biotech",
  health_system: "Regional Health System",
  diagnostics_lab: "Diagnostics Laboratory",
  research_institution: "Research Institution",
  nbs_program: "Newborn Screening Program",
  dtc_company: "DTC / Consumer Genomics",
};

// Dimension 2: Engagement Model
export type EngagementModel =
  | "one_off_project"
  | "multi_phase_pilot"
  | "ongoing_partnership"
  | "per_sample_service";

export const ENGAGEMENT_MODEL_LABELS: Record<EngagementModel, string> = {
  one_off_project: "One-off Project",
  multi_phase_pilot: "Multi-phase Pilot",
  ongoing_partnership: "Ongoing Partnership",
  per_sample_service: "Per-sample Service",
};

// Dimension 3: Sample Characteristics
export interface SampleCharacteristics {
  sampleType: "blood_edta" | "saliva" | "dbs" | "tissue" | "other";
  volumeRange: "1_10" | "10_100" | "100_1000" | "1000_plus";
  extractionNeeded: boolean;
  kitsProvided: boolean;
}

// Dimension 4: Test Configuration
export interface TestConfiguration {
  shortReadPlatform: "illumina" | "ultima" | "both" | "none";
  longReadPlatform: "ont" | "none";
  shortReadDepth: "15x" | "20x" | "30x" | "40x";
  longReadDepth: "5x" | "10x" | "15x" | "none";
  assayType: "wgs" | "wes" | "panel" | "lowpass";
  addOns: ("pgx" | "mtdna" | "sv_cnv" | "methylation")[];
}

// Dimension 5: Deliverables
export interface DeliverableSet {
  fastq: boolean;
  bam_cram: boolean;
  vcf: boolean;
  clinical_report: boolean;
  interpretation: boolean;
  research_summary: boolean;
}

// Dimension 6: Regulatory Level
export type RegulatoryLevel = "ruo" | "clia" | "clia_cap" | "ivd_ready";

export const REGULATORY_LABELS: Record<RegulatoryLevel, string> = {
  ruo: "Research Use Only (RUO)",
  clia: "CLIA Certified",
  clia_cap: "CLIA + CAP Accredited",
  ivd_ready: "IVD-Ready",
};

// Dimension 7: Logistics
export interface LogisticsConfig {
  kitShipping: boolean;
  sampleTracking: boolean;
  chainOfCustody: boolean;
  international: boolean;
}

// Dimension 8: Turnaround Time
export interface TATConfig {
  tier: "standard" | "expedited" | "stat";
  standardDays: number;
  expeditedDays: number;
  statDays: number;
}

export const TAT_DEFAULTS: Record<TATConfig["tier"], { label: string; days: string }> = {
  standard: { label: "Standard", days: "10-14 business days" },
  expedited: { label: "Expedited", days: "5-7 business days" },
  stat: { label: "Stat", days: "48-72 hours" },
};

// --- Empty config factory ---

export function createEmptyConfig(): DealConfig {
  return {
    customerType: null,
    engagementModel: null,
    sampleCharacteristics: null,
    testConfiguration: null,
    deliverables: null,
    regulatoryLevel: null,
    logistics: null,
    tat: null,
  };
}

// --- Archetype presets (pre-fill the 8 dimensions) ---

export const DEAL_ARCHETYPES = {
  enterprise_pharma: {
    label: "Enterprise Pharma (e.g., 23andMe, Natera)",
    config: {
      customerType: "enterprise_pharma" as CustomerType,
      engagementModel: "multi_phase_pilot" as EngagementModel,
      regulatoryLevel: "clia_cap" as RegulatoryLevel,
    },
  },
  regional_health_system: {
    label: "Regional Health System (e.g., Shriners)",
    config: {
      customerType: "health_system" as CustomerType,
      engagementModel: "ongoing_partnership" as EngagementModel,
      regulatoryLevel: "clia_cap" as RegulatoryLevel,
    },
  },
  biotech_research: {
    label: "Biotech / Research (e.g., Arboretum)",
    config: {
      customerType: "research_institution" as CustomerType,
      engagementModel: "one_off_project" as EngagementModel,
      regulatoryLevel: "ruo" as RegulatoryLevel,
    },
  },
  nbs_program: {
    label: "Newborn Screening Program",
    config: {
      customerType: "nbs_program" as CustomerType,
      engagementModel: "ongoing_partnership" as EngagementModel,
      regulatoryLevel: "ivd_ready" as RegulatoryLevel,
    },
  },
} as const;
