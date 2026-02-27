/**
 * LSMC Consumables & Kits — per-stage costs
 * Source: COGS Calculator v2 GSheet — Consumables & Kits tab
 * Last synced: 2026-02-27
 */

import type { ConsumableItem } from "@/lib/engine/types";

// ---------------------------------------------------------------------------
// Consumable catalog
// ---------------------------------------------------------------------------

export const CONSUMABLES: ConsumableItem[] = [
  // --- Accessioning ---
  {
    id: "accessioning_supplies",
    name: "Accessioning Supplies",
    vendor: "Various",
    costPerUnit: 240,
    unit: "96-sample kit",
    costPerReaction: 2.5,
    perBatchFixedCost: 0,
    category: "accessioning",
  },

  // --- Extraction ---
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
  {
    id: "ext_kit_dbs",
    name: "DNA Extraction Kit (DBS)",
    vendor: "Qiagen",
    costPerUnit: 1350,
    unit: "96 rxn kit",
    costPerReaction: 14.06,
    perBatchFixedCost: 30,
    category: "extraction",
  },

  // --- Library Prep ---
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

  // --- QC ---
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

  // --- Logistics ---
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

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getConsumable(id: string): ConsumableItem | undefined {
  return CONSUMABLES.find((c) => c.id === id);
}

export function getConsumablesByCategory(
  category: ConsumableItem["category"],
): ConsumableItem[] {
  return CONSUMABLES.filter((c) => c.category === category);
}

/**
 * Get the extraction kit ID for a given sample type.
 */
export function extractionKitId(
  sampleType: "blood" | "saliva" | "dbs" | "tissue",
): string {
  const map: Record<string, string> = {
    blood: "ext_kit_blood",
    saliva: "ext_kit_saliva",
    dbs: "ext_kit_dbs",
    tissue: "ext_kit_blood", // tissue uses blood extraction protocol
  };
  return map[sampleType];
}

/**
 * Get the library prep kit ID for a given platform.
 */
export function libPrepKitId(
  platform: "illumina" | "ultima" | "ont",
): string {
  const map: Record<string, string> = {
    illumina: "lib_prep_ilmn",
    ultima: "lib_prep_ug",
    ont: "lib_prep_ont",
  };
  return map[platform];
}
