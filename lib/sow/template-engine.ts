/**
 * SOW Template Engine — Orchestrator
 *
 * Takes DealWizardState + COGSBreakdown → SOWDocument
 *
 * Tier 1 (computed) and Tier 2 (parameterized) sections are generated
 * synchronously. Tier 3 (AI) sections are returned with aiPrompt set
 * and empty content — the API route fills them via Claude.
 */

import type { DealWizardState } from "@/lib/config/deal-state";
import type { COGSBreakdown } from "@/lib/engine/types";
import type { SOWDocument, SectionContext } from "./types";
import { getPreset } from "@/lib/config/presets";

import { generateHeader } from "./sections/header";
import { generateServicesOverview } from "./sections/services-overview";
import { generateTestConfiguration } from "./sections/test-configuration";
import { generateSampleSpecifications } from "./sections/sample-specifications";
import { generateDeliverables } from "./sections/deliverables";
import { generateTurnaroundTime } from "./sections/turnaround-time";
import { generatePricing } from "./sections/pricing";
import { generateQualityStandards } from "./sections/quality-standards";
import { generateLogistics } from "./sections/logistics";
import { generateInterpretation } from "./sections/interpretation";
import { generateDataSecurity } from "./sections/data-security";
import { generateClientResponsibilities } from "./sections/client-responsibilities";
import { generateDisclaimers } from "./sections/disclaimers";

/**
 * Generate a SOWDocument from deal state and COGS breakdown.
 *
 * All Tier 1 and Tier 2 sections are fully populated.
 * Tier 3 sections have content="" and aiPrompt set.
 */
export function generateSOW(
  state: DealWizardState,
  breakdown: COGSBreakdown,
): SOWDocument {
  const preset = state.selectedPresetId
    ? getPreset(state.selectedPresetId)
    : null;

  const ctx: SectionContext = {
    clientName: state.clientName,
    dealName: state.dealName,
    term: state.term,
    presetName: preset?.name ?? null,
    config: state.config,
    breakdown,
    annualVolume: state.annualVolume,
    batchSize: state.batchSize,
    marginPct: state.marginPct,
  };

  // Generate all sections in order
  const sections = [
    generateHeader(ctx),
    generateServicesOverview(ctx),
    generateTestConfiguration(ctx),
    generateSampleSpecifications(ctx),
    generateDeliverables(ctx),
    generateTurnaroundTime(ctx),
    generatePricing(ctx),
    generateQualityStandards(ctx),
    generateLogistics(ctx),
    generateInterpretation(ctx),
    generateDataSecurity(ctx),
    generateClientResponsibilities(ctx),
    generateDisclaimers(ctx),
  ];

  return {
    metadata: {
      clientName: state.clientName,
      dealName: state.dealName,
      term: state.term,
      generatedAt: new Date().toISOString(),
      presetName: preset?.name ?? null,
    },
    sections,
  };
}

/**
 * Render a SOWDocument to a single markdown string.
 * Skips sections where included=false.
 */
export function renderSOWToMarkdown(doc: SOWDocument): string {
  return doc.sections
    .filter((s) => s.included)
    .map((s) => s.content)
    .filter((c) => c.length > 0)
    .join("\n\n---\n\n");
}

/**
 * Check if a SOWDocument has Tier 3 sections that need AI generation.
 */
export function hasPendingAISections(doc: SOWDocument): boolean {
  return doc.sections.some(
    (s) => s.included && s.tier === 3 && s.content === "" && s.aiPrompt,
  );
}

/**
 * Get the Tier 3 sections that need AI generation.
 */
export function getPendingAISections(
  doc: SOWDocument,
): { id: string; title: string; aiPrompt: string }[] {
  return doc.sections
    .filter(
      (s) => s.included && s.tier === 3 && s.content === "" && s.aiPrompt,
    )
    .map((s) => ({
      id: s.id,
      title: s.title,
      aiPrompt: s.aiPrompt!,
    }));
}
