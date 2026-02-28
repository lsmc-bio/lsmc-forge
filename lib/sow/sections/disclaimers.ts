/**
 * SOW Sections 13-14: Disclaimers & Terms
 * Tier 2 — Boilerplate
 */

import type { SOWSection, SectionContext } from "../types";

export function generateDisclaimers(ctx: SectionContext): SOWSection {
  const isRUO = ctx.config.regulatoryLevel === "ruo";

  const ruoDisclaimer = isRUO
    ? `\n\n> **Research Use Only.** The services and results described in this SOW are provided for research use only and are not intended for use in clinical diagnosis, treatment, or prevention of disease. Results have not been validated for clinical use and should not be used as the sole basis for clinical decision-making.`
    : "";

  const content = `## Disclaimers & Limitations

### Limitations of Service

- Results are dependent on the quality and integrity of samples provided by Client
- Provider does not guarantee detection of all variants; analytical sensitivity varies by variant type, size, and genomic context
- Turnaround time commitments are subject to sample quality, volume fluctuations, and force majeure events
- Provider reserves the right to reject samples that do not meet quality specifications${ruoDisclaimer}

### Intellectual Property

- Client retains ownership of all sample-derived data and results
- Provider retains ownership of analytical methods, pipelines, and proprietary processes
- Neither party acquires rights to the other party's pre-existing intellectual property

## Terms & Conditions

[INPUT NEEDED — Confirm governing agreement. If a Master Services Agreement (MSA) exists, reference it here. If this SOW is standalone, specify governing terms.]

| Term | Detail |
|---|---|
| **Effective Date** | [INPUT NEEDED — Effective date] |
| **Term** | ${ctx.term} |
| **Renewal** | [INPUT NEEDED — Auto-renewal terms] |
| **Termination** | [INPUT NEEDED — Confirm termination terms and notice period] |
| **Governing Law** | [INPUT NEEDED — Jurisdiction] |

### Signatures

| | Provider | Client |
|---|---|---|
| **Name** | [INPUT NEEDED] | [INPUT NEEDED] |
| **Title** | [INPUT NEEDED] | [INPUT NEEDED] |
| **Date** | _____________ | _____________ |
| **Signature** | _____________ | _____________ |`;

  return {
    id: "disclaimers",
    title: "Disclaimers & Terms",
    content,
    tier: 2,
    conditional: false,
    included: true,
  };
}
