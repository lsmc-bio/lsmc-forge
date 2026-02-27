/**
 * LSMC Sequencing Configuration — from COGS Calculator Sequencing Config + Consumables tabs
 * Source: https://docs.google.com/spreadsheets/d/1HoYHMxcSBF4Mrgq7LfFfFL0H5LqLjfeN8brWlxES6Xk
 * Last synced: 2026-02-27
 */

// --- Sequencing platform configs ---

export interface SequencingConfig {
  id: string;
  platform: "illumina" | "ultima" | "ont";
  instrument: string;
  consumable: string;
  outputGb: number;
  runTimeHours: number;
  samplesPerRun: number;
  listCostPerRun: number;
  costPerGb: number;
  runsPerYear: number;
  instrumentCost: number;
  amortYears: number;
  annualAmort: number;
}

export const SEQUENCING_CONFIGS: SequencingConfig[] = [
  // Illumina
  {
    id: "novaseq_25b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "25B Flowcell",
    outputGb: 2500,
    runTimeHours: 48,
    samplesPerRun: 24,
    listCostPerRun: 8550,
    costPerGb: 3.42,
    runsPerYear: 156,
    instrumentCost: 985_000,
    amortYears: 5,
    annualAmort: 197_000,
  },
  {
    id: "novaseq_10b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "10B Flowcell",
    outputGb: 1000,
    runTimeHours: 48,
    samplesPerRun: 10,
    listCostPerRun: 5540,
    costPerGb: 5.54,
    runsPerYear: 156,
    instrumentCost: 985_000,
    amortYears: 5,
    annualAmort: 197_000,
  },
  {
    id: "novaseq_1.5b",
    platform: "illumina",
    instrument: "NovaSeq X Plus",
    consumable: "1.5B Flowcell",
    outputGb: 150,
    runTimeHours: 24,
    samplesPerRun: 1,
    listCostPerRun: 1675,
    costPerGb: 11.17,
    runsPerYear: 312,
    instrumentCost: 985_000,
    amortYears: 5,
    annualAmort: 197_000,
  },
  // Ultima
  {
    id: "ug100_s4",
    platform: "ultima",
    instrument: "UG 100",
    consumable: "S4 Flowcell",
    outputGb: 2500,
    runTimeHours: 20,
    samplesPerRun: 24,
    listCostPerRun: 2400,
    costPerGb: 0.96,
    runsPerYear: 365,
    instrumentCost: 599_000,
    amortYears: 5,
    annualAmort: 119_800,
  },
  {
    id: "ug100_s2",
    platform: "ultima",
    instrument: "UG 100",
    consumable: "S2 Flowcell",
    outputGb: 750,
    runTimeHours: 20,
    samplesPerRun: 7,
    listCostPerRun: 1300,
    costPerGb: 1.73,
    runsPerYear: 365,
    instrumentCost: 599_000,
    amortYears: 5,
    annualAmort: 119_800,
  },
  // ONT
  {
    id: "promethion_s",
    platform: "ont",
    instrument: "PromethION 2 Solo",
    consumable: "PromethION Flowcell",
    outputGb: 100,
    runTimeHours: 72,
    samplesPerRun: 1,
    listCostPerRun: 900,
    costPerGb: 9.0,
    runsPerYear: 104,
    instrumentCost: 25_000,
    amortYears: 3,
    annualAmort: 8_333,
  },
  {
    id: "promethion_48",
    platform: "ont",
    instrument: "PromethION 48",
    consumable: "PromethION Flowcell",
    outputGb: 100,
    runTimeHours: 72,
    samplesPerRun: 1,
    listCostPerRun: 900,
    costPerGb: 9.0,
    runsPerYear: 2496,
    instrumentCost: 295_000,
    amortYears: 3,
    annualAmort: 98_333,
  },
];

// --- Consumables & kits ---

export interface Consumable {
  id: string;
  name: string;
  vendor: string;
  costPerUnit: number;
  unit: string;
  costPerReaction: number;
  perBatchFixedCost: number;
  category: "extraction" | "library_prep" | "sequencing" | "qc" | "logistics";
}

export const CONSUMABLES: Consumable[] = [
  // Extraction
  {
    id: "ext_kit_blood",
    name: "DNA Extraction Kit (Blood)",
    vendor: "Qiagen",
    costPerUnit: 1200,
    unit: "96 rxn kit",
    costPerReaction: 12.5,
    perBatchFixedCost: 25,
    category: "extraction",
  },
  {
    id: "ext_kit_saliva",
    name: "DNA Extraction Kit (Saliva)",
    vendor: "Qiagen",
    costPerUnit: 1050,
    unit: "96 rxn kit",
    costPerReaction: 10.94,
    perBatchFixedCost: 25,
    category: "extraction",
  },
  // Library Prep
  {
    id: "lib_prep_ilmn",
    name: "Illumina DNA Prep",
    vendor: "Illumina",
    costPerUnit: 3840,
    unit: "96 rxn kit",
    costPerReaction: 40.0,
    perBatchFixedCost: 50,
    category: "library_prep",
  },
  {
    id: "lib_prep_ug",
    name: "Ultima Library Prep",
    vendor: "Ultima Genomics",
    costPerUnit: 1920,
    unit: "96 rxn kit",
    costPerReaction: 20.0,
    perBatchFixedCost: 50,
    category: "library_prep",
  },
  {
    id: "lib_prep_ont",
    name: "ONT Ligation Kit",
    vendor: "Oxford Nanopore",
    costPerUnit: 599,
    unit: "6 rxn kit",
    costPerReaction: 99.83,
    perBatchFixedCost: 0,
    category: "library_prep",
  },
  // QC
  {
    id: "qc_qubit",
    name: "Qubit dsDNA HS Assay",
    vendor: "Thermo Fisher",
    costPerUnit: 320,
    unit: "500 rxn kit",
    costPerReaction: 0.64,
    perBatchFixedCost: 0,
    category: "qc",
  },
  {
    id: "qc_tapestation",
    name: "TapeStation D1000",
    vendor: "Agilent",
    costPerUnit: 448,
    unit: "112 rxn kit",
    costPerReaction: 4.0,
    perBatchFixedCost: 0,
    category: "qc",
  },
  // Logistics
  {
    id: "kit_shipping",
    name: "Collection Kit + Shipping",
    vendor: "Alom/BioTouch",
    costPerUnit: 18.5,
    unit: "per kit",
    costPerReaction: 18.5,
    perBatchFixedCost: 0,
    category: "logistics",
  },
  {
    id: "return_shipping",
    name: "Return Shipping (FedEx Clinical)",
    vendor: "FedEx",
    costPerUnit: 35,
    unit: "per shipment",
    costPerReaction: 35.0,
    perBatchFixedCost: 0,
    category: "logistics",
  },
];

// --- Helper functions ---

export function getConfigsByPlatform(
  platform: "illumina" | "ultima" | "ont",
): SequencingConfig[] {
  return SEQUENCING_CONFIGS.filter((c) => c.platform === platform);
}

export function getConsumablesByCategory(
  category: Consumable["category"],
): Consumable[] {
  return CONSUMABLES.filter((c) => c.category === category);
}

export function estimateSequencingCostPerSample(configId: string): number {
  const config = SEQUENCING_CONFIGS.find((c) => c.id === configId);
  if (!config) return 0;
  return config.listCostPerRun / config.samplesPerRun;
}
