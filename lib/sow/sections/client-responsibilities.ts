/**
 * SOW Section 12: Client Responsibilities
 * Tier 2 — Parameterized per engagement model
 */

import type { SOWSection, SectionContext } from "../types";
import {
  ENGAGEMENT_MODEL_LABELS,
  type EngagementModel,
} from "@/lib/config/dimensions";

export function generateClientResponsibilities(
  ctx: SectionContext,
): SOWSection {
  const model = ctx.config.engagementModel;
  const modelLabel = model
    ? ENGAGEMENT_MODEL_LABELS[model]
    : "Not specified";

  const baseResponsibilities = [
    "Provide samples meeting the specifications outlined in Section 4 (Sample Specifications)",
    "Ensure proper sample labeling and manifest accuracy",
    "Maintain required regulatory approvals, IRB/ethics approvals, and informed consent documentation",
    "Designate a primary point of contact for communication with Provider",
    "Download deliverables within the specified retention period",
  ];

  const modelSpecific = getModelSpecificResponsibilities(model);

  const allItems = [...baseResponsibilities, ...modelSpecific];

  const content = `## Client Responsibilities

**Engagement model:** ${modelLabel}

Client agrees to the following responsibilities under this SOW:

${allItems.map((item) => `1. ${item}`).join("\n")}

Failure to meet these responsibilities may result in delays to turnaround time or inability to process samples as specified.`;

  return {
    id: "client-responsibilities",
    title: "Client Responsibilities",
    content,
    tier: 2,
    conditional: false,
    included: true,
  };
}

function getModelSpecificResponsibilities(
  model: EngagementModel | null,
): string[] {
  switch (model) {
    case "ongoing_partnership":
      return [
        "Provide a rolling volume forecast to enable capacity planning — [INPUT NEEDED — Confirm forecast cadence]",
        "Designate backup contacts for operational continuity",
        "Participate in quarterly business reviews",
      ];
    case "multi_phase_pilot":
      return [
        "Provide go/no-go decision within [INPUT NEEDED — Confirm decision window] of Phase 1 results delivery",
        "Confirm sample availability and timeline for subsequent phases",
      ];
    case "per_sample_service":
      return [
        "Submit samples in batch sizes consistent with the agreed batch size",
        "Provide sample manifests at least [INPUT NEEDED — Confirm manifest lead time] prior to sample shipment",
      ];
    case "one_off_project":
      return [
        "Provide all samples within the agreed project timeline",
        "Confirm project scope changes in writing prior to sample submission",
      ];
    default:
      return [];
  }
}
