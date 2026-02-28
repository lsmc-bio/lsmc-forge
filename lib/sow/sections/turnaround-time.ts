/**
 * SOW Section 6: Turnaround Time / SLA
 * Tier 1 — Computed
 */

import type { SOWSection, SectionContext } from "../types";
import { TAT_DEFAULTS } from "@/lib/config/dimensions";

export function generateTurnaroundTime(ctx: SectionContext): SOWSection {
  const tat = ctx.config.tat;

  if (!tat) {
    return {
      id: "turnaround-time",
      title: "Turnaround Time",
      content: "*[INPUT NEEDED — TAT not configured]*",
      tier: 1,
      conditional: false,
      included: true,
    };
  }

  const selected = TAT_DEFAULTS[tat.tier];
  const isHybrid =
    ctx.config.testConfiguration?.shortReadPlatform !== "none" &&
    ctx.config.testConfiguration?.longReadPlatform === "ont";

  const tatRows = Object.entries(TAT_DEFAULTS).map(([tier, info]) => {
    const marker = tier === tat.tier ? " **(selected)**" : "";
    return `| ${info.label}${marker} | ${info.days} |`;
  });

  let hybridNote = "";
  if (isHybrid) {
    hybridNote = `\n\n> **Note:** Hybrid sequencing configurations (short-read + long-read) may require additional processing time. The TAT above applies to the complete deliverable including both short-read and long-read data integration.`;
  }

  const content = `## Turnaround Time

### Service Level Agreement

| Tier | Turnaround Time |
|---|---|
${tatRows.join("\n")}

**Selected tier:** ${selected.label} — ${selected.days}

Turnaround time is measured from receipt of sample at Provider's facility to
delivery of results to Client. TAT applies to samples passing incoming QC.

### Exclusions

- TAT clock pauses for samples requiring re-collection or re-extraction
- Batch submission deadlines: samples received after [INPUT NEEDED — cutoff day/time] will be included in the next processing batch
- Holiday schedules may affect expedited and stat TAT tiers${hybridNote}`;

  return {
    id: "turnaround-time",
    title: "Turnaround Time",
    content,
    tier: 1,
    conditional: false,
    included: true,
  };
}
