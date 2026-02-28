/**
 * SOW Section 7: Pricing
 * Tier 1 — Computed tables from COGSBreakdown
 *
 * CRITICAL: All dollar figures come from the COGS engine.
 * Never hardcode or fabricate pricing numbers.
 */

import type { SOWSection, SectionContext } from "../types";

export function generatePricing(ctx: SectionContext): SOWSection {
  const { breakdown, annualVolume, marginPct } = ctx;

  // Per-sample pricing table (customer-facing — shows price, not cost)
  const perSamplePrice = breakdown.recommendedPrice;

  const rows = [
    `| **Per-Sample Price** | $${perSamplePrice.toFixed(2)} |`,
    `| **Annual Volume Commitment** | ${annualVolume.toLocaleString()} samples |`,
    `| **Annual Contract Value** | $${breakdown.annualRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} |`,
    `| **Batch Size** | ${ctx.batchSize} samples |`,
  ];

  // Volume tier pricing (show sensitivity)
  const volumeTiers = buildVolumeTiers(ctx);

  const content = `## Pricing

### Per-Sample Pricing

| Parameter | Value |
|---|---|
${rows.join("\n")}

${volumeTiers}

### Payment Terms

- Invoicing: [INPUT NEEDED — Monthly / quarterly / per-batch]
- Payment terms: [INPUT NEEDED — Confirm payment terms (e.g., Net 30, Net 45)]
- Volume commitment: ${annualVolume.toLocaleString()} samples per year
- Volume shortfall: [INPUT NEEDED — Minimum commitment terms, if any]

### Price Adjustments

- Pricing is valid for the initial term of ${ctx.term}
- Pricing may be adjusted at renewal based on reagent costs, volume changes, and market conditions
- Any pricing changes require [INPUT NEEDED — Confirm notice period for price changes] written notice`;

  return {
    id: "pricing",
    title: "Pricing",
    content,
    tier: 1,
    conditional: false,
    included: true,
  };
}

function buildVolumeTiers(ctx: SectionContext): string {
  const { annualVolume } = ctx;

  // Show the committed tier prominently
  // Don't expose internal cost structure to the customer
  return `### Volume Commitment

The per-sample pricing above is based on an annual volume commitment of
**${annualVolume.toLocaleString()} samples**. Pricing for alternative volume
tiers is available upon request.

| Volume Tier | Samples/Year | Pricing |
|---|---|---|
| Committed | ${annualVolume.toLocaleString()} | $${ctx.breakdown.recommendedPrice.toFixed(2)}/sample |
| [INPUT NEEDED — Additional tiers if applicable] | | |`;
}
