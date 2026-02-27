import { auth } from "@/auth";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import { calculateCOGS, applyDefaults } from "@/lib/engine/cogs-calculator";
import { calculateCapacityImpact, DEFAULT_CAPACITY } from "@/lib/engine/capacity";
import { PLATFORMS, samplesPerRun, seqCostPerSample } from "@/lib/data/platforms";
import { PRODUCT_PRESETS } from "@/lib/config/presets";
import {
  CUSTOMER_TYPE_LABELS,
  ENGAGEMENT_MODEL_LABELS,
  REGULATORY_LABELS,
  TAT_DEFAULTS,
} from "@/lib/config/dimensions";
import { ANNUAL_OVERHEAD } from "@/lib/data/overhead";
import type { DealInput, COGSBreakdown } from "@/lib/engine/types";

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// System prompt — references the new 14-stage, depth-aware pricing engine
// ---------------------------------------------------------------------------

const TAT_OPTIONS = Object.values(TAT_DEFAULTS)
  .map((t) => `${t.label} (${t.days})`)
  .join(", ");

const PLATFORM_LIST = PLATFORMS.map(
  (c) =>
    `- ${c.instrument} (${c.consumable}): ${c.outputGb}Gb/run, $${c.listCostPerRun.toLocaleString()}/run, $${c.instrumentCost.toLocaleString()} instrument`,
).join("\n");

const PRESET_LIST = PRODUCT_PRESETS.filter((p) => p.id !== "custom")
  .map((p) => `- **${p.name}**: ${p.description}`)
  .join("\n");

const SYSTEM_PROMPT = `You are the LSMC Deal Agent — an internal tool for the LSMC commercial team (Andrew, Eric, and team) to configure and price genomic sequencing deals.

This is an INTERNAL tool. You are talking to LSMC staff, not customers. Show full cost breakdowns, margins, utilization math, and economic analysis. Be transparent about everything — that's the whole point.

## DEAL DIMENSIONS

1. **Customer Type:** ${Object.values(CUSTOMER_TYPE_LABELS).join(", ")}
2. **Engagement Model:** ${Object.values(ENGAGEMENT_MODEL_LABELS).join(", ")}
3. **Sample Characteristics:** Type (blood/saliva/DBS/tissue), volume, extraction needs, kit requirements
4. **Test Configuration:** Platform (Illumina/Ultima/hybrid with ONT long-read), coverage depth (0.5x–40x), assay type
5. **Deliverables:** FASTQ, BAM/CRAM, VCF, clinical report, interpretation
6. **Regulatory Level:** ${Object.values(REGULATORY_LABELS).join(", ")}
7. **Logistics:** Kit shipping, sample tracking, chain of custody
8. **TAT:** ${TAT_OPTIONS}

## PRICING ENGINE

The pricing engine calculates cost across **14 stages**:
1. Accessioning ($2.50/sample)
2. Extraction ($10-14/sample depending on sample type)
3. Library prep ($20-100/sample depending on platform)
4. QC ($4.64/sample)
5. Sequencing — SHORT READ (depth-dependent: $5/sample at 1.5x → $109/sample at 30x on Ultima)
6. Sequencing — LONG READ (if hybrid: ~$900/sample at 10x ONT)
7. Instrument amortization (spread across throughput)
8. Secondary analysis ($4-13/sample)
9. Tertiary analysis ($0-22.50/sample depending on deliverables)
10. Clinical sign-out ($0-15/sample depending on regulatory level)
11. Data storage ($0.50-3/sample depending on depth and retention)
12. Labor ($15-60/sample depending on batch size and TAT)
13. Logistics ($0-53.50/sample if kit shipping)
14. Overhead ($${Math.round(ANNUAL_OVERHEAD.totalWithBuffer).toLocaleString()} annual / volume)

**CRITICAL:** Coverage depth drives sequencing cost. At 30x, one Ultima S4 wafer fits ~22 samples ($109/sample). At 1.5x, it fits ~456 samples ($5.26/sample). ALWAYS confirm coverage depth before pricing.

## VOLUME TIERS

- **Low** (<100/week, <5K/year): High overhead per sample, sub-flowcell batching
- **Medium** (100-500/week, 5K-25K/year): Overhead drops, good utilization
- **High** (500+/week, 25K+/year): Near-marginal cost, best pricing

## CAPACITY CONTEXT (current lab)

Default lab configuration:
- 2 × UG 100 (S4 wafers), ~500 samples/week at 30x
- 1 × NovaSeq X+ (25B FCs), ~200 samples/week at 30x
- 1 × PromethION 2 Solo, ~20 samples/week at 10x
Total: ~720 samples/week

New volume can be **absorbed** (fits in spare capacity = cheaper) or **incremental** (needs new runs = standalone cost). Use the capacity tool to model this.

## PLATFORMS

${PLATFORM_LIST}

## PRODUCT PRESETS

${PRESET_LIST}

## BEHAVIOR RULES

1. **Always show the full 14-stage breakdown table** after calling calculateDealCOGS. Present EVERY stage, even $0 ones.
2. **Confirm coverage depth early.** This is the #1 cost driver. "What coverage are you targeting?" should be one of your first questions.
3. **Default to 35% margin** if not specified. Show margin sensitivity (25%, 35%, 50%).
4. Use markdown formatting — bold headers, tables, bullet points.
5. Start by understanding what the customer needs. Suggest a product preset if one fits.
6. Walk through dimensions conversationally — ask 2-3 at a time.
7. When enough info is gathered, call calculateDealCOGS immediately. Don't ask permission.
8. Be direct and opinionated. "I'd recommend X because Y."
9. Use real numbers. Never say "it depends" without a range.
10. Flag unusual configs. Discuss capacity/utilization implications.
11. When presenting hybrid configs (SR + LR), break out costs for each platform separately.
12. For low-pass WGS, emphasize the dramatic cost difference vs 30x.

## QUOTE FORMAT

**Deal Configuration**
| Parameter | Value |
|---|---|
| Product | ... |
| Platform | ... |
| Coverage | ... |
| Volume | ... |
| Deliverables | ... |
| Regulatory | ... |
| TAT | ... |

**14-Stage Cost Breakdown (per sample)**
| Stage | Cost |
|---|---|
| 1. Accessioning | $X.XX |
| 2. Extraction | $X.XX |
| 3. Library Prep | $X.XX |
| 4. QC | $X.XX |
| 5. Sequencing (SR) | $X.XX |
| 6. Sequencing (LR) | $X.XX |
| 7. Instrument Amort | $X.XX |
| 8. Secondary Analysis | $X.XX |
| 9. Tertiary Analysis | $X.XX |
| 10. Clinical Sign-out | $X.XX |
| 11. Data Storage | $X.XX |
| 12. Labor | $X.XX |
| 13. Logistics | $X.XX |
| 14. Overhead | $X.XX |
| **Fully Burdened Cost** | **$X.XX** |

**Pricing**
| Metric | Value |
|---|---|
| Target Margin | X% |
| **Recommended Price** | **$X.XX/genome** |
| Annual Revenue | $X |
| Annual Cost | $X |
| Annual Profit | $X |

Then add analysis: utilization, platform trade-offs, margin sensitivity, volume considerations.`;

// ---------------------------------------------------------------------------
// Tool parameter schemas
// ---------------------------------------------------------------------------

const dealInputSchema = z.object({
  shortReadPlatform: z
    .enum(["illumina", "ultima"])
    .nullable()
    .default("ultima")
    .describe("Short-read platform"),
  shortReadConfigId: z
    .string()
    .nullable()
    .optional()
    .describe("Specific config ID (e.g., 'novaseq_25b', 'ug100_s4'). Auto-resolved if omitted."),
  shortReadCoverageX: z
    .number()
    .default(30)
    .describe("Short-read coverage depth (e.g., 30, 15, 1.5, 0.5)"),
  longReadPlatform: z
    .enum(["ont"])
    .nullable()
    .default(null)
    .describe("Long-read platform (ont or null)"),
  longReadConfigId: z
    .string()
    .nullable()
    .optional()
    .describe("Long-read config ID. Auto-resolved if omitted."),
  longReadCoverageX: z
    .number()
    .default(0)
    .describe("Long-read coverage depth (e.g., 10, 5, 0)"),
  annualVolume: z
    .number()
    .describe("Expected annual sample volume"),
  batchSize: z
    .number()
    .default(96)
    .describe("Samples per batch"),
  sampleType: z
    .enum(["blood", "saliva", "dbs", "tissue"])
    .default("blood")
    .describe("Sample type"),
  extractionNeeded: z.boolean().default(true),
  deliverables: z
    .array(z.string())
    .default(["fastq", "vcf"])
    .describe("Deliverables: fastq, vcf, bam, clinical_report, interpretation"),
  regulatoryLevel: z
    .enum(["ruo", "clia", "clia_cap"])
    .default("ruo"),
  tatTier: z
    .enum(["standard", "expedited", "stat"])
    .default("standard"),
  marginPct: z
    .number()
    .min(0)
    .max(0.99)
    .default(0.35)
    .describe("Target margin as decimal (e.g., 0.35 for 35%)"),
  kitShipping: z.boolean().default(false),
  useCapacityModel: z.boolean().default(true).describe("Factor in current lab capacity"),
});

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: SYSTEM_PROMPT,
    messages,
    maxSteps: 5,
    tools: {
      // ----- Tool 1: Primary pricing calculation -----
      calculateDealCOGS: tool({
        description:
          "Calculate the full 14-stage COGS breakdown for a deal configuration. Returns per-sample costs for every stage plus rollups, pricing, and annual projections. ALWAYS present the full table to the user.",
        parameters: dealInputSchema,
        execute: async (params) => {
          const input: Partial<DealInput> = {
            shortReadPlatform: params.shortReadPlatform,
            shortReadConfigId: params.shortReadConfigId ?? undefined,
            shortReadCoverageX: params.shortReadCoverageX,
            longReadPlatform: params.longReadPlatform,
            longReadConfigId: params.longReadConfigId ?? undefined,
            longReadCoverageX: params.longReadCoverageX,
            annualVolume: params.annualVolume,
            batchSize: params.batchSize,
            sampleType: params.sampleType,
            extractionNeeded: params.extractionNeeded,
            deliverables: params.deliverables,
            regulatoryLevel: params.regulatoryLevel,
            tatTier: params.tatTier,
            marginPct: params.marginPct,
            kitShipping: params.kitShipping,
          };

          const breakdown = calculateCOGS(input);

          // Optionally add capacity analysis
          let capacity = null;
          if (params.useCapacityModel) {
            const fullInput = applyDefaults(input);
            capacity = calculateCapacityImpact(fullInput, DEFAULT_CAPACITY);
          }

          return { breakdown, capacity };
        },
      }),

      // ----- Tool 2: Side-by-side comparison -----
      compareConfigurations: tool({
        description:
          "Compare two deal configurations side-by-side. Useful for Ultima vs Illumina, 30x vs 15x, or any A/B comparison. Returns both breakdowns plus a diff.",
        parameters: z.object({
          configA: dealInputSchema.describe("First configuration"),
          configB: dealInputSchema.describe("Second configuration"),
          labelA: z.string().default("Config A").describe("Label for first config"),
          labelB: z.string().default("Config B").describe("Label for second config"),
        }),
        execute: async ({ configA, configB, labelA, labelB }) => {
          const buildInput = (params: z.infer<typeof dealInputSchema>): Partial<DealInput> => ({
            shortReadPlatform: params.shortReadPlatform,
            shortReadConfigId: params.shortReadConfigId ?? undefined,
            shortReadCoverageX: params.shortReadCoverageX,
            longReadPlatform: params.longReadPlatform,
            longReadConfigId: params.longReadConfigId ?? undefined,
            longReadCoverageX: params.longReadCoverageX,
            annualVolume: params.annualVolume,
            batchSize: params.batchSize,
            sampleType: params.sampleType,
            extractionNeeded: params.extractionNeeded,
            deliverables: params.deliverables,
            regulatoryLevel: params.regulatoryLevel,
            tatTier: params.tatTier,
            marginPct: params.marginPct,
            kitShipping: params.kitShipping,
          });

          const a = calculateCOGS(buildInput(configA));
          const b = calculateCOGS(buildInput(configB));

          return {
            [labelA]: a,
            [labelB]: b,
            diff: {
              fullyBurdenedCost: round(a.fullyBurdenedCost - b.fullyBurdenedCost),
              recommendedPrice: round(a.recommendedPrice - b.recommendedPrice),
              annualProfit: a.annualProfit - b.annualProfit,
              sequencingSR: round(a.sequencingShortRead - b.sequencingShortRead),
              sequencingLR: round(a.sequencingLongRead - b.sequencingLongRead),
              overhead: round(a.overhead - b.overhead),
            },
          };
        },
      }),

      // ----- Tool 3: Adjust capacity context -----
      adjustCapacity: tool({
        description:
          "Update the lab capacity context to see how it affects deal pricing. Shows utilization before/after.",
        parameters: z.object({
          instruments: z
            .array(
              z.object({
                configId: z.string().describe("Platform config ID (e.g., ug100_s4)"),
                count: z.number().describe("Number of instruments"),
              }),
            )
            .describe("Lab instrument inventory"),
          currentWeeklySamples: z
            .number()
            .describe("Current weekly sample throughput across all instruments"),
          currentCoverageX: z
            .number()
            .default(30)
            .describe("Coverage depth of current volume"),
        }),
        execute: async ({ instruments, currentWeeklySamples, currentCoverageX }) => {
          const context = { instruments, currentWeeklySamples, currentCoverageX };

          // Show capacity summary per instrument
          const summary = instruments.map((inst) => {
            const config = PLATFORMS.find((p) => p.id === inst.configId);
            if (!config) return { configId: inst.configId, error: "Unknown config" };
            const spr = samplesPerRun(config, currentCoverageX);
            const weeklyCapacity = spr * (config.maxRunsPerYear / 52) * inst.count;
            return {
              instrument: `${config.instrument} (${config.consumable})`,
              count: inst.count,
              samplesPerRun: spr,
              weeklyCapacity: Math.round(weeklyCapacity),
              costPerSample: round(seqCostPerSample(config, currentCoverageX)),
            };
          });

          const totalWeeklyCapacity = summary.reduce(
            (sum, s) => sum + ("weeklyCapacity" in s && typeof s.weeklyCapacity === "number" ? s.weeklyCapacity : 0),
            0,
          );

          return {
            capacityContext: context,
            instrumentSummary: summary,
            totalWeeklyCapacity,
            currentUtilization: round(currentWeeklySamples / totalWeeklyCapacity),
            spareWeeklyCapacity: totalWeeklyCapacity - currentWeeklySamples,
          };
        },
      }),

      // ----- Tool 4: Preset lookup (kept from original) -----
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

      // ----- Tool 5: Sensitivity analysis -----
      sensitivityAnalysis: tool({
        description:
          "Show how the recommended price changes across a range of one variable (volume, coverage, margin, or TAT). Returns a table of results.",
        parameters: z.object({
          baseConfig: dealInputSchema.describe("Base deal configuration"),
          variable: z
            .enum(["volume", "coverage", "margin", "tat"])
            .describe("Which variable to sweep"),
          values: z
            .array(z.number())
            .describe(
              "Values to test. For volume: annual samples. For coverage: depth (e.g., [0.5, 1.5, 5, 15, 30]). For margin: decimals (e.g., [0.15, 0.25, 0.35, 0.5]). For TAT: not used (cycles through standard/expedited/stat).",
            ),
        }),
        execute: async ({ baseConfig, variable, values }) => {
          const buildInput = (params: z.infer<typeof dealInputSchema>): Partial<DealInput> => ({
            shortReadPlatform: params.shortReadPlatform,
            shortReadConfigId: params.shortReadConfigId ?? undefined,
            shortReadCoverageX: params.shortReadCoverageX,
            longReadPlatform: params.longReadPlatform,
            longReadConfigId: params.longReadConfigId ?? undefined,
            longReadCoverageX: params.longReadCoverageX,
            annualVolume: params.annualVolume,
            batchSize: params.batchSize,
            sampleType: params.sampleType,
            extractionNeeded: params.extractionNeeded,
            deliverables: params.deliverables,
            regulatoryLevel: params.regulatoryLevel,
            tatTier: params.tatTier,
            marginPct: params.marginPct,
            kitShipping: params.kitShipping,
          });

          const base = buildInput(baseConfig);

          if (variable === "tat") {
            const tats: Array<"standard" | "expedited" | "stat"> = [
              "standard",
              "expedited",
              "stat",
            ];
            return {
              variable: "tat",
              results: tats.map((tat) => {
                const r = calculateCOGS({ ...base, tatTier: tat });
                return {
                  value: tat,
                  fullyBurdenedCost: r.fullyBurdenedCost,
                  recommendedPrice: r.recommendedPrice,
                  labor: r.labor,
                };
              }),
            };
          }

          return {
            variable,
            results: values.map((v) => {
              let override: Partial<DealInput> = {};
              if (variable === "volume") override = { annualVolume: v };
              if (variable === "coverage") override = { shortReadCoverageX: v };
              if (variable === "margin") override = { marginPct: v };

              const r = calculateCOGS({ ...base, ...override });
              return {
                value: v,
                fullyBurdenedCost: r.fullyBurdenedCost,
                recommendedPrice: r.recommendedPrice,
                sequencingSR: r.sequencingShortRead,
                overhead: r.overhead,
                annualRevenue: r.annualRevenue,
                annualProfit: r.annualProfit,
              };
            }),
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function round(n: number, decimals: number = 2): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}
