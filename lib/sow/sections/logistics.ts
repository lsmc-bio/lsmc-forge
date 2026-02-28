/**
 * SOW Section 9: Logistics & Kitting
 * Tier 2 — Conditional (included when kitShipping=true OR international=true)
 */

import type { SOWSection, SectionContext } from "../types";

export function generateLogistics(ctx: SectionContext): SOWSection {
  const log = ctx.config.logistics;
  const included =
    log !== null && (log.kitShipping || log.international);

  if (!included) {
    return {
      id: "logistics",
      title: "Logistics & Kitting",
      content: "",
      tier: 2,
      conditional: true,
      included: false,
    };
  }

  const sections: string[] = ["## Logistics & Kitting"];

  if (log!.kitShipping) {
    sections.push(`### Collection Kit Distribution

Provider will supply sample collection kits to Client or Client-designated collection sites.

| Parameter | Specification |
|---|---|
| **Kit Contents** | Collection device, requisition form, biohazard bag, return shipping label |
| **Kit Ordering** | [INPUT NEEDED — Ordering process and lead time] |
| **Kit Shipping** | Standard ground shipping included; expedited shipping available at additional cost |
| **Kit Storage** | Store at ambient temperature; use within [INPUT NEEDED — Confirm kit shelf life] of receipt |`);
  }

  if (log!.sampleTracking) {
    sections.push(`### Sample Tracking

- Samples are tracked via unique barcoded identifiers from receipt through result delivery
- Client will receive automated notifications at key milestones:
  - Sample received at laboratory
  - Sample passed/failed incoming QC
  - Sequencing complete
  - Results available for download`);
  }

  if (log!.chainOfCustody) {
    sections.push(`### Chain of Custody

- Full chain of custody documentation maintained from sample receipt to result delivery
- All sample handling, storage, and transfer events recorded in LIMS
- Chain of custody records available to Client upon request`);
  }

  if (log!.international) {
    sections.push(`### International Shipping

- Provider will coordinate international sample shipping logistics
- Client is responsible for obtaining required export/import permits
- Shipping via [INPUT NEEDED — Preferred international courier]
- Samples must comply with IATA Dangerous Goods Regulations for biological substances (UN 3373)
- Import/export duties and customs fees are the responsibility of [INPUT NEEDED — Client or Provider]`);
  }

  return {
    id: "logistics",
    title: "Logistics & Kitting",
    content: sections.join("\n\n"),
    tier: 2,
    conditional: true,
    included: true,
  };
}
