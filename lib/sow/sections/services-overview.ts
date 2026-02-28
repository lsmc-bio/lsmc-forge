/**
 * SOW Section 2: Services Overview
 * Tier 3 — AI-generated (Claude fills this via API route)
 *
 * This section gets a structured prompt with all deal dimensions.
 * The API route sends it to Claude Haiku and fills in the content.
 */

import type { SOWSection, SectionContext } from "../types";
import {
  CUSTOMER_TYPE_LABELS,
  ENGAGEMENT_MODEL_LABELS,
  REGULATORY_LABELS,
  TAT_DEFAULTS,
} from "@/lib/config/dimensions";

export function generateServicesOverview(ctx: SectionContext): SOWSection {
  const { config, annualVolume, breakdown } = ctx;
  const tc = config.testConfiguration;

  // Build the prompt context for Claude
  const platformDesc = buildPlatformDescription(tc);
  const customerType = config.customerType
    ? CUSTOMER_TYPE_LABELS[config.customerType]
    : "Not specified";
  const engagement = config.engagementModel
    ? ENGAGEMENT_MODEL_LABELS[config.engagementModel]
    : "Not specified";
  const regulatory = config.regulatoryLevel
    ? REGULATORY_LABELS[config.regulatoryLevel]
    : "Not specified";
  const tat = config.tat?.tier
    ? TAT_DEFAULTS[config.tat.tier]?.label ?? config.tat.tier
    : "Standard";

  const deliverableList = buildDeliverableList(config.deliverables);

  const aiPrompt = `Write a 2-3 paragraph "Services Overview" section for an LSMC Statement of Work.

Deal context:
- Customer type: ${customerType}
- Engagement model: ${engagement}
- Platform: ${platformDesc}
- Assay type: ${tc?.assayType?.toUpperCase() ?? "WGS"}
- Annual volume: ${annualVolume.toLocaleString()} samples
- Regulatory level: ${regulatory}
- TAT: ${tat}
- Deliverables: ${deliverableList}
- Per-sample price: $${breakdown.recommendedPrice.toFixed(2)}

Requirements:
- Professional, concise SOW language
- Describe what LSMC will provide (sequencing services, analysis, deliverables)
- Reference the platform(s) and coverage depth
- Mention the regulatory framework if CLIA/CAP
- Do NOT include specific dollar amounts (pricing has its own section)
- Do NOT fabricate any details not provided above
- Use "Provider" to refer to LSMC and "Client" to refer to the customer
- Output in markdown format`;

  return {
    id: "services-overview",
    title: "Services Overview",
    content: "", // Filled by AI
    tier: 3,
    conditional: false,
    included: true,
    aiPrompt,
  };
}

function buildPlatformDescription(
  tc: SectionContext["config"]["testConfiguration"],
): string {
  if (!tc) return "Not configured";

  const parts: string[] = [];
  if (tc.shortReadPlatform !== "none") {
    const platform =
      tc.shortReadPlatform === "both"
        ? "Illumina + Ultima"
        : tc.shortReadPlatform === "illumina"
          ? "Illumina"
          : "Ultima Genomics";
    parts.push(`${platform} short-read at ${tc.shortReadDepth} coverage`);
  }
  if (tc.longReadPlatform === "ont") {
    parts.push(`Oxford Nanopore long-read at ${tc.longReadDepth} coverage`);
  }
  return parts.length > 0 ? parts.join(" + ") : "Not configured";
}

function buildDeliverableList(
  del: SectionContext["config"]["deliverables"],
): string {
  if (!del) return "Not specified";
  const items: string[] = [];
  if (del.fastq) items.push("FASTQ");
  if (del.bam_cram) items.push("BAM/CRAM");
  if (del.vcf) items.push("VCF");
  if (del.clinical_report) items.push("Clinical Report");
  if (del.interpretation) items.push("Variant Interpretation");
  if (del.research_summary) items.push("Research Summary");
  return items.length > 0 ? items.join(", ") : "Data files only";
}
