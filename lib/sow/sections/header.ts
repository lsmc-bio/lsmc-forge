/**
 * SOW Section 1: Header / Parties
 * Tier 2 — Parameterized
 */

import type { SOWSection, SectionContext } from "../types";

export function generateHeader(ctx: SectionContext): SOWSection {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clientDisplay = ctx.clientName || "[INPUT NEEDED — Client Name]";
  const dealDisplay = ctx.dealName || "Genomic Sequencing Services";

  const content = `# Statement of Work

**${dealDisplay}**

---

| | |
|---|---|
| **Provider** | [INPUT NEEDED — LSMC legal entity name] |
| **Client** | ${clientDisplay} |
| **Effective Date** | ${today} |
| **Term** | ${ctx.term} |
| **SOW Reference** | LSMC-SOW-${new Date().getFullYear()}-[INPUT NEEDED — SOW number] |

This Statement of Work ("SOW") describes the genomic sequencing services to be
provided by Provider to Client under the terms of the Master Services Agreement
between the parties${ctx.term ? ` for a period of ${ctx.term}` : ""}.`;

  return {
    id: "header",
    title: "Header",
    content,
    tier: 2,
    conditional: false,
    included: true,
  };
}
