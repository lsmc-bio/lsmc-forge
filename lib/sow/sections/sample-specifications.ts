/**
 * SOW Section 4: Sample Specifications
 * Tier 2 — Parameterized
 */

import type { SOWSection, SectionContext } from "../types";

const SAMPLE_TYPE_LABELS: Record<string, string> = {
  blood_edta: "Whole blood (EDTA tube)",
  saliva: "Saliva (collection kit)",
  dbs: "Dried blood spot (DBS card)",
  tissue: "Tissue (FFPE or fresh-frozen)",
  other: "Other (to be specified)",
};

const VOLUME_LABELS: Record<string, string> = {
  "1_10": "1-10 samples",
  "10_100": "10-100 samples",
  "100_1000": "100-1,000 samples",
  "1000_plus": "1,000+ samples",
};

export function generateSampleSpecifications(ctx: SectionContext): SOWSection {
  const sc = ctx.config.sampleCharacteristics;

  if (!sc) {
    return {
      id: "sample-specifications",
      title: "Sample Specifications",
      content: "*[INPUT NEEDED — Sample specifications not set]*",
      tier: 2,
      conditional: false,
      included: true,
    };
  }

  const sampleType = SAMPLE_TYPE_LABELS[sc.sampleType] ?? sc.sampleType;
  const volumeRange = VOLUME_LABELS[sc.volumeRange] ?? sc.volumeRange;

  const rows = [
    `| **Sample Type** | ${sampleType} |`,
    `| **Expected Volume per Batch** | ${volumeRange} |`,
    `| **Annual Volume** | ${ctx.annualVolume.toLocaleString()} samples |`,
    `| **Batch Size** | ${ctx.batchSize} samples |`,
    `| **Extraction Required** | ${sc.extractionNeeded ? "Yes — Provider performs DNA extraction" : "No — Client provides extracted DNA"} |`,
    `| **Collection Kits** | ${sc.kitsProvided ? "Provider supplies collection kits" : "Client provides samples directly"} |`,
  ];

  const handlingNotes = buildHandlingNotes(sc.sampleType, sc.extractionNeeded);

  const content = `## Sample Specifications

| Parameter | Specification |
|---|---|
${rows.join("\n")}

### Sample Handling Requirements

${handlingNotes}`;

  return {
    id: "sample-specifications",
    title: "Sample Specifications",
    content,
    tier: 2,
    conditional: false,
    included: true,
  };
}

function buildHandlingNotes(
  sampleType: string,
  extractionNeeded: boolean,
): string {
  const notes: string[] = [];

  switch (sampleType) {
    case "blood_edta":
      notes.push(
        "- Samples must be collected in EDTA anticoagulant tubes",
        "- Shipping temperature: [INPUT NEEDED — Confirm shipping temp requirements]",
        "- Minimum volume: [INPUT NEEDED — Confirm minimum blood volume]",
      );
      break;
    case "saliva":
      notes.push(
        "- Samples must be collected using an approved stabilization kit",
        "- Shipping conditions: [INPUT NEEDED — Confirm shipping requirements]",
        "- Collection volume: [INPUT NEEDED — Per manufacturer/LSMC requirements]",
      );
      break;
    case "dbs":
      notes.push(
        "- DBS cards must be fully dried before shipping",
        "- Ship in sealed bags with desiccant",
        "- Minimum spots per card: [INPUT NEEDED — Confirm DBS requirements]",
      );
      break;
    case "tissue":
      notes.push(
        "- FFPE samples: [INPUT NEEDED — Confirm section count and thickness requirements]",
        "- Fresh-frozen samples: ship on dry ice",
        "- [INPUT NEEDED — Confirm tumor content assessment requirements]",
      );
      break;
    default:
      notes.push("- [INPUT NEEDED — Sample handling requirements to be determined]");
  }

  if (extractionNeeded) {
    notes.push(
      "- Provider will perform DNA extraction and quality assessment",
      "- Samples failing QC will be reported to Client for replacement",
    );
  } else {
    notes.push(
      "- Client provides extracted genomic DNA",
      "- Minimum concentration: [INPUT NEEDED — Confirm DNA input requirements (concentration and volume)]",
      "- Provider will perform incoming QC; samples failing QC will be reported for replacement",
    );
  }

  return notes.join("\n");
}
