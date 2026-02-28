/**
 * SOW Section 3: Test Configuration
 * Tier 1 (computed) + Tier 2 (parameterized)
 */

import type { SOWSection, SectionContext } from "../types";

export function generateTestConfiguration(ctx: SectionContext): SOWSection {
  const tc = ctx.config.testConfiguration;

  if (!tc) {
    return {
      id: "test-configuration",
      title: "Test Configuration",
      content: "*[INPUT NEEDED — Test configuration not set]*",
      tier: 1,
      conditional: false,
      included: true,
    };
  }

  const assayLabel: Record<string, string> = {
    wgs: "Whole Genome Sequencing (WGS)",
    wes: "Whole Exome Sequencing (WES)",
    panel: "Targeted Panel Sequencing",
    lowpass: "Low-Pass Whole Genome Sequencing",
  };

  const rows: string[] = [];

  rows.push(`| **Assay Type** | ${assayLabel[tc.assayType] ?? tc.assayType} |`);

  // Short-read platform
  if (tc.shortReadPlatform !== "none") {
    const srPlatform =
      tc.shortReadPlatform === "both"
        ? "Illumina NovaSeq X Plus + Ultima Genomics UG 100"
        : tc.shortReadPlatform === "illumina"
          ? "Illumina NovaSeq X Plus"
          : "Ultima Genomics UG 100";
    rows.push(`| **Short-Read Platform** | ${srPlatform} |`);
    rows.push(`| **Short-Read Coverage** | ${tc.shortReadDepth} depth |`);
  }

  // Long-read platform
  if (tc.longReadPlatform === "ont") {
    rows.push(`| **Long-Read Platform** | Oxford Nanopore PromethION 2 Solo |`);
    rows.push(`| **Long-Read Coverage** | ${tc.longReadDepth} depth |`);
  }

  // Capacity context from breakdown
  if (ctx.breakdown.samplesPerRunSR > 0) {
    rows.push(
      `| **Samples per SR Run** | ${ctx.breakdown.samplesPerRunSR} |`,
    );
  }
  if (ctx.breakdown.samplesPerRunLR > 0) {
    rows.push(
      `| **Samples per LR Run** | ${ctx.breakdown.samplesPerRunLR} |`,
    );
  }

  const isHybrid = tc.shortReadPlatform !== "none" && tc.longReadPlatform === "ont";
  const hybridNote = isHybrid
    ? `\n\nThis configuration uses a **hybrid sequencing approach** combining short-read sequencing for high-accuracy variant calling with long-read sequencing for structural variant detection and phasing.`
    : "";

  const content = `## Test Configuration

| Parameter | Specification |
|---|---|
${rows.join("\n")}${hybridNote}`;

  return {
    id: "test-configuration",
    title: "Test Configuration",
    content,
    tier: 1,
    conditional: false,
    included: true,
  };
}
