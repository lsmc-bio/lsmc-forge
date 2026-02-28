/**
 * SOW Section 10: Interpretation & Reporting
 * Tier 3 — AI-generated, Conditional
 * Included when deliverables includes interpretation or clinical_report
 */

import type { SOWSection, SectionContext } from "../types";
import { REGULATORY_LABELS } from "@/lib/config/dimensions";

export function generateInterpretation(ctx: SectionContext): SOWSection {
  const del = ctx.config.deliverables;
  const included =
    del !== null && (del.interpretation || del.clinical_report);

  if (!included) {
    return {
      id: "interpretation",
      title: "Interpretation & Reporting",
      content: "",
      tier: 3,
      conditional: true,
      included: false,
    };
  }

  const tc = ctx.config.testConfiguration;
  const regulatory = ctx.config.regulatoryLevel
    ? REGULATORY_LABELS[ctx.config.regulatoryLevel]
    : "Not specified";

  const assayType = tc?.assayType?.toUpperCase() ?? "WGS";
  const hasLongRead = tc?.longReadPlatform === "ont";
  const hasInterpretation = del!.interpretation;
  const hasClinicalReport = del!.clinical_report;

  const aiPrompt = `Write an "Interpretation & Reporting" section for an LSMC Statement of Work.

Context:
- Assay type: ${assayType}
- Hybrid sequencing: ${hasLongRead ? "Yes (short-read + long-read)" : "No (short-read only)"}
- Regulatory level: ${regulatory}
- Includes variant interpretation: ${hasInterpretation ? "Yes" : "No"}
- Includes clinical report: ${hasClinicalReport ? "Yes" : "No"}
- Short-read coverage: ${tc?.shortReadDepth ?? "30x"}
${hasLongRead ? `- Long-read coverage: ${tc?.longReadDepth ?? "10x"}` : ""}

Requirements:
- Describe the variant classification methodology (ACMG/AMP guidelines if clinical)
- Describe what the clinical report includes (if applicable)
- Mention variant types covered: SNVs, indels${hasLongRead ? ", structural variants, copy number variants" : ""}
- Reference the analytical pipeline at a high level (no specific software names)
- If RUO, note that results are for research use only
- Use "Provider" and "Client" — not company names
- Professional SOW language, 2-3 paragraphs
- Output in markdown with an ## heading`;

  return {
    id: "interpretation",
    title: "Interpretation & Reporting",
    content: "",
    tier: 3,
    conditional: true,
    included: true,
    aiPrompt,
  };
}
