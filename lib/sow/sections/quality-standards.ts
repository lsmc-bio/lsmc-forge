/**
 * SOW Section 8: Quality Standards
 * Tier 2 — Parameterized by regulatory level
 */

import type { SOWSection, SectionContext } from "../types";
import { REGULATORY_LABELS, type RegulatoryLevel } from "@/lib/config/dimensions";

export function generateQualityStandards(ctx: SectionContext): SOWSection {
  const level = ctx.config.regulatoryLevel;

  if (!level) {
    return {
      id: "quality-standards",
      title: "Quality Standards",
      content: "*[INPUT NEEDED — Regulatory level not configured]*",
      tier: 2,
      conditional: false,
      included: true,
    };
  }

  const content = `## Quality Standards

### Regulatory Framework

Provider operates under **${REGULATORY_LABELS[level]}** standards for the services described in this SOW.

${getQualityContent(level)}

### Sequencing Quality Metrics

| Metric | Specification |
|---|---|
| **Mean Coverage** | \u2265 ${getMinCoverage(ctx)}x (target: ${getTargetCoverage(ctx)}x) |
| **Mapped Reads** | [INPUT NEEDED — Confirm mapped reads threshold] |
| **Q30 Bases** | [INPUT NEEDED — Confirm Q30 threshold] |
| **Duplicate Rate** | [INPUT NEEDED — Confirm max duplicate rate] |
| **Contamination** | [INPUT NEEDED — Confirm contamination threshold] |

Samples failing to meet quality thresholds will be flagged and Client notified within [INPUT NEEDED — notification SLA]. Re-sequencing will be performed at no additional cost if the failure is attributable to Provider.`;

  return {
    id: "quality-standards",
    title: "Quality Standards",
    content,
    tier: 2,
    conditional: false,
    included: true,
  };
}

function getQualityContent(level: RegulatoryLevel): string {
  switch (level) {
    case "clia_cap":
      return `Provider's laboratory holds:
- **CLIA Certificate** — [INPUT NEEDED — CLIA number]
- **CAP Accreditation** — [INPUT NEEDED — CAP number]

All testing is performed under validated, CAP-accredited protocols with documented standard operating procedures. Proficiency testing, quality control, and quality assurance programs are maintained per CAP and CLIA requirements.

Clinical reports are reviewed and signed out by the Laboratory Director, [INPUT NEEDED — confirm Lab Director credentials].`;

    case "clia":
      return `Provider's laboratory holds a **CLIA Certificate** — [INPUT NEEDED — CLIA number].

Testing is performed under CLIA-compliant protocols with documented standard operating procedures. Quality control and proficiency testing programs are maintained per CLIA requirements.`;

    case "ivd_ready":
      return `Services are performed under **IVD-ready** protocols, designed to meet the requirements for future IVD regulatory submissions. While not currently operating under a formal IVD regulatory framework, Provider maintains documentation, validation, and quality systems consistent with IVD expectations.`;

    case "ruo":
      return `Services are provided for **Research Use Only (RUO)**. Results are not intended for use in clinical diagnosis, treatment, or prevention of disease.

Provider maintains research-grade quality standards including documented SOPs, equipment calibration, and data integrity controls.`;
  }
}

function getTargetCoverage(ctx: SectionContext): string {
  const tc = ctx.config.testConfiguration;
  if (!tc) return "30";
  return tc.shortReadDepth.replace("x", "");
}

function getMinCoverage(ctx: SectionContext): string {
  const tc = ctx.config.testConfiguration;
  if (!tc) return "28";
  const target = parseFloat(tc.shortReadDepth.replace("x", ""));
  // Min coverage is ~90% of target, rounded down
  return Math.floor(target * 0.9).toString();
}
