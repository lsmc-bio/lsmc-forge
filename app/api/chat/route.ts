import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import {
  VARIABLE_BOM,
  FULLY_BURDENED,
  calculatePrice,
  getFullyBurdenedCost,
} from "@/lib/config/pricing";
import { PRODUCT_PRESETS } from "@/lib/config/presets";
import { SEQUENCING_CONFIGS, CONSUMABLES } from "@/lib/config/sequencing";
import {
  CUSTOMER_TYPE_LABELS,
  ENGAGEMENT_MODEL_LABELS,
  REGULATORY_LABELS,
  TAT_DEFAULTS,
} from "@/lib/config/dimensions";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are the LSMC Deal Agent — an internal tool for Andrew and Eric at LSMC (Life Sciences & Medical Company).

You help configure deals by guiding users through LSMC's 8-dimension configuration model. You have access to real COGS data and can calculate pricing on the fly.

## 8 DIMENSIONS

1. **Customer Type:** ${Object.values(CUSTOMER_TYPE_LABELS).join(", ")}
2. **Engagement Model:** ${Object.values(ENGAGEMENT_MODEL_LABELS).join(", ")}
3. **Sample Characteristics:** Type (blood/saliva/DBS/tissue), volume (1-10/10-100/100-1K/1K+), extraction Y/N, kits Y/N
4. **Test Configuration:** SR platform (Illumina/Ultima/both), LR platform (ONT/none), depth (15x-40x SR, 5-15x LR), assay (WGS/WES/panel/lowpass), add-ons (PGx, mtDNA, SV/CNV, methylation)
5. **Deliverables:** FASTQ, BAM/CRAM, VCF, clinical report, interpretation, research summary
6. **Regulatory Level:** ${Object.values(REGULATORY_LABELS).join(", ")}
7. **Logistics:** Kit shipping, sample tracking, chain of custody, international
8. **TAT:** ${Object.values(TAT_DEFAULTS).map((t) => `${t.label} (${t.days})`).join(", ")}

## PRICING DATA (from COGS Calculator v2)

### Variable BOM per sample:
- Ultima only: $${VARIABLE_BOM.ug_only}
- Ultima + ONT hybrid: $${VARIABLE_BOM.ug_hybrid}
- Illumina only: $${VARIABLE_BOM.ilmn_only}
- Illumina + ONT hybrid: $${VARIABLE_BOM.ilmn_hybrid}

### Fully burdened cost at volume (includes $${(3_531_135).toLocaleString()} annual overhead):
${FULLY_BURDENED.map((r) => `- ${r.volume.toLocaleString()} samples/yr: UG $${r.costs.ug_only.total.toFixed(0)} | UG+ONT $${r.costs.ug_hybrid.total.toFixed(0)} | ILMN $${r.costs.ilmn_only.total.toFixed(0)} | ILMN+ONT $${r.costs.ilmn_hybrid.total.toFixed(0)}`).join("\n")}

### Product Presets:
${PRODUCT_PRESETS.filter((p) => p.id !== "custom").map((p) => `- **${p.name}:** ${p.description} [${p.platformConfig}]`).join("\n")}

### Sequencing Platforms:
${SEQUENCING_CONFIGS.map((c) => `- ${c.instrument} (${c.consumable}): ${c.outputGb}Gb/run, ${c.samplesPerRun} samples/run, $${c.listCostPerRun}/run ($${c.costPerGb.toFixed(2)}/Gb)`).join("\n")}

## BEHAVIOR

1. Start by asking what kind of deal they're working on. Suggest a preset if it fits.
2. Walk through dimensions conversationally — don't dump all 8 at once.
3. When enough info is gathered, calculate pricing using the tools provided.
4. Present a deal summary with cost breakdown and recommended pricing.
5. Be direct and opinionated — this is an internal tool. Say "I'd recommend X because Y."
6. Use real numbers. Never say "it depends" without also giving a range.
7. Flag when a configuration is unusual or doesn't match standard presets.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      calculateDealPricing: tool({
        description:
          "Calculate fully burdened cost and recommended pricing for a deal configuration",
        parameters: z.object({
          platformConfig: z
            .enum(["ug_only", "ug_hybrid", "ilmn_only", "ilmn_hybrid"])
            .describe("Platform configuration"),
          annualVolume: z
            .number()
            .describe("Expected annual sample volume"),
          marginPct: z
            .number()
            .min(0)
            .max(1)
            .describe("Target margin as decimal (e.g., 0.25 for 25%)"),
        }),
        execute: async ({ platformConfig, annualVolume, marginPct }) => {
          const { costPerSample, tier } = getFullyBurdenedCost(
            platformConfig,
            annualVolume,
          );
          const price = calculatePrice(costPerSample, marginPct);
          const variableBom = VARIABLE_BOM[platformConfig];

          return {
            platformConfig,
            annualVolume,
            nearestTier: tier,
            variableBom,
            overheadPerSample: costPerSample - variableBom,
            fullyBurdenedCost: costPerSample,
            targetMargin: `${(marginPct * 100).toFixed(0)}%`,
            recommendedPrice: Math.round(price * 100) / 100,
            annualRevenue: Math.round(price * annualVolume),
            annualCost: Math.round(costPerSample * annualVolume),
            annualProfit: Math.round((price - costPerSample) * annualVolume),
          };
        },
      }),
      lookupPreset: tool({
        description: "Look up a product preset by ID or name",
        parameters: z.object({
          query: z
            .string()
            .describe("Preset ID or partial name to search for"),
        }),
        execute: async ({ query }) => {
          const q = query.toLowerCase();
          const preset = PRODUCT_PRESETS.find(
            (p) =>
              p.id === q ||
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q),
          );
          if (!preset) return { found: false, query };
          return { found: true, preset };
        },
      }),
      lookupSequencingConfig: tool({
        description: "Look up sequencing platform configuration details",
        parameters: z.object({
          platform: z
            .enum(["illumina", "ultima", "ont"])
            .describe("Sequencing platform"),
        }),
        execute: async ({ platform }) => {
          const configs = SEQUENCING_CONFIGS.filter(
            (c) => c.platform === platform,
          );
          const consumables = CONSUMABLES.filter((c) => {
            if (platform === "illumina")
              return c.id.includes("ilmn") || c.id === "lib_prep_ilmn";
            if (platform === "ultima")
              return c.id.includes("ug") || c.id === "lib_prep_ug";
            if (platform === "ont")
              return c.id.includes("ont") || c.id === "lib_prep_ont";
            return false;
          });
          return { platform, configs, consumables };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
