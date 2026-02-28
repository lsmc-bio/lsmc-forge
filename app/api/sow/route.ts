/**
 * SOW Generation API Route
 *
 * Receives DealWizardState, generates the SOW via the template engine,
 * then fills Tier 3 (AI-generated) sections via Claude Haiku.
 *
 * Returns the complete SOWDocument with all sections populated.
 */

import { auth } from "@/auth";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { calculateCOGS } from "@/lib/engine/cogs-calculator";
import { configToDealInput } from "@/lib/config/deal-state";
import type { DealWizardState } from "@/lib/config/deal-state";
import {
  generateSOW,
  getPendingAISections,
} from "@/lib/sow/template-engine";
import type { SOWDocument } from "@/lib/sow/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { state } = (await req.json()) as { state: DealWizardState };

  // 1. Compute COGS breakdown from state
  const input = configToDealInput(state);
  const breakdown = calculateCOGS(input);

  // 2. Generate SOW with Tier 1 + Tier 2 sections filled
  const doc = generateSOW(state, breakdown);

  // 3. Fill Tier 3 sections via Claude
  const pendingSections = getPendingAISections(doc);

  if (pendingSections.length > 0) {
    // Generate all Tier 3 sections in parallel
    const results = await Promise.all(
      pendingSections.map(async (section) => {
        const { text } = await generateText({
          model: anthropic("claude-haiku-4-5-20251001"),
          prompt: section.aiPrompt,
          maxTokens: 1000,
        });
        return { id: section.id, content: text };
      }),
    );

    // Merge AI-generated content into the document
    for (const result of results) {
      const section = doc.sections.find((s) => s.id === result.id);
      if (section) {
        section.content = result.content;
      }
    }
  }

  return Response.json(doc satisfies SOWDocument);
}
