/**
 * LSMC Product Presets — from COGS Calculator Product Presets tab
 * Source: https://docs.google.com/spreadsheets/d/1HoYHMxcSBF4Mrgq7LfFfFL0H5LqLjfeN8brWlxES6Xk
 * Last synced: 2026-02-27
 */

export interface ProductPreset {
  id: string;
  name: string;
  description: string;
  shortRead: {
    platform: "illumina" | "ultima" | "both";
    depth: string;
  };
  longRead: {
    platform: "ont" | "none";
    depth: string;
  };
  /** Matches a PlatformConfig.id in lib/data/platforms.ts */
  defaultConfigId: string;
  startingMaterial: string;
  pricingTier: "low" | "mid" | "high";
  analysisLevel: string;
  deliverables: string[];
  typicalCustomer: string;
}

export const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: "inflection_rwgs",
    name: "Inflection rWGS",
    description: "Rapid whole-genome sequencing for NICU/critical care — proband-only, 5-day TAT",
    shortRead: { platform: "ultima", depth: "30x" },
    longRead: { platform: "ont", depth: "10x" },
    defaultConfigId: "ug100_s4",
    startingMaterial: "Blood (EDTA) or DBS",
    pricingTier: "high",
    analysisLevel: "Clinical report + interpretation",
    deliverables: ["Clinical report", "VCF", "BAM/CRAM", "Interpretation summary"],
    typicalCustomer: "Children's hospitals, NICUs, health systems",
  },
  {
    id: "clinical_standard",
    name: "Clinical Standard WGS",
    description: "Standard clinical WGS — 30x short-read, CLIA/CAP, 10-14 day TAT",
    shortRead: { platform: "illumina", depth: "30x" },
    longRead: { platform: "none", depth: "N/A" },
    defaultConfigId: "novaseq_25b",
    startingMaterial: "Blood (EDTA)",
    pricingTier: "mid",
    analysisLevel: "Clinical report + interpretation",
    deliverables: ["Clinical report", "VCF", "BAM/CRAM"],
    typicalCustomer: "Health systems, diagnostics labs",
  },
  {
    id: "lowpass_genome",
    name: "Low-Pass Genome",
    description: "Low-pass WGS for screening — 0.5-5x, imputation-based genotyping",
    shortRead: { platform: "ultima", depth: "0.5-5x" },
    longRead: { platform: "none", depth: "N/A" },
    defaultConfigId: "ug100_s2",
    startingMaterial: "Blood, saliva, or DBS",
    pricingTier: "low",
    analysisLevel: "Imputed genotypes",
    deliverables: ["Imputed VCF", "FASTQ"],
    typicalCustomer: "Biobanks, DTC companies, population studies",
  },
  {
    id: "biobank",
    name: "Biobank WGS",
    description: "High-throughput biobank sequencing — 15-30x, data-only, RUO",
    shortRead: { platform: "ultima", depth: "15-30x" },
    longRead: { platform: "none", depth: "N/A" },
    defaultConfigId: "ug100_s4",
    startingMaterial: "Blood or saliva",
    pricingTier: "low",
    analysisLevel: "Data only (FASTQ + VCF)",
    deliverables: ["FASTQ", "VCF", "BAM/CRAM"],
    typicalCustomer: "Pharma, biobanks, research institutions",
  },
  {
    id: "23andme_dtc",
    name: "23andMe DTC",
    description: "Consumer-grade WGS for 23andMe integration — Ultima platform, high volume",
    shortRead: { platform: "ultima", depth: "30x" },
    longRead: { platform: "none", depth: "N/A" },
    defaultConfigId: "ug100_s4",
    startingMaterial: "Saliva",
    pricingTier: "low",
    analysisLevel: "Data only (FASTQ + VCF)",
    deliverables: ["FASTQ", "VCF"],
    typicalCustomer: "23andMe / DTC genomics companies",
  },
  {
    id: "custom",
    name: "Custom Configuration",
    description: "Fully custom deal — all 8 dimensions configurable",
    shortRead: { platform: "both", depth: "configurable" },
    longRead: { platform: "ont", depth: "configurable" },
    defaultConfigId: "ug100_s4",
    startingMaterial: "Any",
    pricingTier: "mid",
    analysisLevel: "Configurable",
    deliverables: ["Configurable"],
    typicalCustomer: "Any",
  },
];

export function getPreset(id: string): ProductPreset | undefined {
  return PRODUCT_PRESETS.find((p) => p.id === id);
}
