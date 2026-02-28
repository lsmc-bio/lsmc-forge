/**
 * SOW Template Engine — Types
 *
 * Defines the SOWDocument structure: a list of SOWSections
 * that the template engine populates from DealConfig + COGSBreakdown.
 *
 * Content tiers:
 *   Tier 1 — Computed (deterministic, from engine)
 *   Tier 2 — Parameterized prose (template strings + conditionals)
 *   Tier 3 — AI-generated (Claude via API route)
 */

export interface SOWSection {
  id: string;
  title: string;
  /** Rendered markdown content. Empty string for Tier 3 until AI fills it. */
  content: string;
  tier: 1 | 2 | 3;
  /** Section only appears if a condition is met */
  conditional: boolean;
  /** Whether the section is included in this SOW (false = condition not met) */
  included: boolean;
  /** For Tier 3 sections: prompt context sent to Claude */
  aiPrompt?: string;
}

export interface SOWMetadata {
  clientName: string;
  dealName: string;
  term: string;
  generatedAt: string;
  presetName: string | null;
}

export interface SOWDocument {
  metadata: SOWMetadata;
  sections: SOWSection[];
}

/** Input to each section generator */
export interface SectionContext {
  clientName: string;
  dealName: string;
  term: string;
  presetName: string | null;
  config: import("@/lib/config/dimensions").DealConfig;
  breakdown: import("@/lib/engine/types").COGSBreakdown;
  annualVolume: number;
  batchSize: number;
  marginPct: number;
}
