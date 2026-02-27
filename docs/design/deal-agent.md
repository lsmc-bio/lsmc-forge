---
type: resource
tags: [design, agent, tooling, prototype, vercel]
created: 2026-02-26
last_updated: 2026-02-26
related_projects: ["customer-agent", "deal-config-wizard", "cogs-model"]
---

# Design Spec: LSMC Deal Agent

## Overview

Design specification for the LSMC Deal Agent — a conversational prototype that implements the [[deal-config-wizard]] Phase 1 as a chat-based tool rather than a form. The agent wraps the 8-dimension configuration model, reads pricing from the [[cogs-model]] GSheet, and produces deal configurations + pricing estimates through natural conversation. Built on Vercel AI SDK + Claude API, deployed on Vercel Pro.

### Problem Statement

LSMC has a detailed 8-dimension deal configuration model ([[deal-config-wizard]]), a maturing COGS calculator ([[cogs-model]]), and 4 customer archetypes — but no tool that ties them together. Today, Andrew and Eric configure deals through manual spreadsheet lookups, ad-hoc calculations, and copy-paste SOW editing. The [[deal-config-wizard]] PRD v0.2 envisions a form-based internal tool as Phase 1. This design proposes an alternative: **build Phase 1 as a conversational agent**.

### Why Agent-First

A conversation is the fastest way to prototype the configuration engine:

- **Faster to build.** A Next.js chat UI + Claude with tools is 3-5 days of scaffolding. A multi-step form with validation, state management, and conditional logic is 2-3 weeks.
- **Faster to iterate.** Changing what the agent knows = editing prompts and tool definitions. Changing a form = rebuilding UI components and state flows.
- **Validates the model.** Every conversation stress-tests the 8-dimension config space. Gaps surface as moments where the agent can't answer. A form hides gaps behind dropdown menus.
- **Natural upgrade path.** The same tool-calling backend serves both the conversational agent (now) and a structured form (later). The form becomes a UI layer over already-validated tools.
- **Dual-interface architecture preserved.** The [[ref-customer-ecosystem]] design requires that agent and form share the same engine. Building agent-first means the engine IS the tool layer — the form plugs in later without refactoring.

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Next.js App (Vercel)                           │
│                                                 │
│  ┌──────────┐    ┌────────────────────────┐     │
│  │ Chat UI  │◄──►│  /api/chat             │     │
│  │ (React + │    │  Vercel AI SDK         │     │
│  │ useChat) │    │  streamText + tools    │     │
│  └──────────┘    └────────┬───────────────┘     │
│                           │                     │
│              ┌────────────┼────────────┐        │
│              ▼            ▼            ▼        │
│       ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│       │ get_     │ │ build_   │ │ estimate_ │   │
│       │ pricing  │ │ config   │ │ deal      │   │
│       └────┬─────┘ └──────────┘ └──────────┘   │
│            │                                    │
└────────────┼────────────────────────────────────┘
             │
             ▼
   ┌──────────────────┐
   │ Google Sheets API │
   │ (COGS Calculator) │
   │ Read-only         │
   └──────────────────┘
```

**Key constraint:** The agent tools define the engine's API surface. When the form UI is built later (Deal Config Wizard Phase 1), it calls the same tools via API routes — not a separate implementation. **One engine, two interfaces.**

### Agent Tools

| Tool | Purpose | Input | Output | Phase |
|------|---------|-------|--------|-------|
| `get_pricing` | Read COGS data for a platform/volume/depth combo | platform, annual_volume, depth | Per-sample cost breakdown (variable BOM, overhead allocation, fully burdened) | 0 |
| `build_config` | Validate and structure a deal configuration | 8-dimension JSON (partial OK) | Validated config with defaults filled, warnings for missing fields | 0 |
| `get_archetype` | Return preset config for a customer type | archetype name | Pre-filled 8-dimension config | 0 |
| `list_capabilities` | What LSMC offers (platforms, tests, deliverables) | none | Structured capability summary | 0 |
| `estimate_deal` | Full pricing estimate from a complete config | validated config JSON | Per-sample price, total deal value, cost breakdown, margin at target GM% | 1 |
| `generate_sow` | Create SOW draft from config + template | config + template_id | Google Doc URL (formatted, with `[CONFIRM: ...]` placeholders) | 2 |

**Design principles:** Tools are the engine (callable by both chat and future form). Partial configs accepted (supports conversational flow). Read-only pricing (no writes to COGS). No data persistence in Phase 0 (ephemeral conversations).

### System Prompt Strategy

Two personality modes, set by environment variable:

**Internal mode (Phase 0-2):** Direct, technical, full pricing breakdown + margin data + COGS internals. Proactively suggests archetype matches, flags pricing edge cases, warns about config gaps.

**Customer mode (Phase 3+):** Professional, "LSMC Clinical Genome" branded, anti-commoditization framing *(Julie McKeough, [[customer-agent]])*. Estimated pricing only — no margin/COGS internals/vendor names. Qualification-focused. Sensitivity filter per Sandra's concern. *([[customer-agent]])*

### Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Next.js 15 (App Router) | Vercel-native, AI SDK first-class support |
| AI Layer | Vercel AI SDK v6 (`ai` package) | `streamText`, tool-calling, `useChat` hook |
| Model | Claude Haiku 4.5 (default), Sonnet 4.6 (complex reasoning) | Haiku: $1/M input — cheap for iterative config |
| Pricing Data | Google Sheets API v4 (read-only) | COGS Calculator lives in GSheets. Service account auth. |
| Frontend | React + Tailwind + shadcn/ui | Fast, consistent UI. Chat component from AI SDK. |
| Deploy | Vercel Pro ($20/mo) | **Required.** Hobby tier 10s function timeout too short for tool-calling loops. Pro = 300s. |
| Auth | None (Phase 0). Vercel password protection (Phase 1+). | Internal tool — no customer access initially. |

**Cost estimate (Phase 0):** Vercel Pro $20/mo + Claude API ~$2-5/mo + GSheets API free tier = **~$25/mo total**.

### Repo Structure

**Repo:** `lsmc-deal-agent` (new, under `lsmc-bio` GitHub org)

```
lsmc-deal-agent/
├── app/
│   ├── page.tsx              # Chat UI
│   ├── layout.tsx            # App shell
│   └── api/
│       └── chat/
│           └── route.ts      # AI SDK streamText endpoint
├── lib/
│   ├── tools/
│   │   ├── get-pricing.ts    # COGS GSheet read
│   │   ├── build-config.ts   # 8-dimension validator
│   │   ├── get-archetype.ts  # Preset configs
│   │   ├── list-capabilities.ts
│   │   └── estimate-deal.ts  # Full pricing calc
│   ├── config/
│   │   ├── dimensions.ts     # 8-dimension schema + options
│   │   ├── archetypes.ts     # 4 customer presets
│   │   └── capabilities.ts   # LSMC offering catalog
│   ├── sheets/
│   │   └── client.ts         # Google Sheets API wrapper
│   └── prompts/
│       ├── internal.ts       # Internal mode system prompt
│       └── customer.ts       # Customer mode system prompt (Phase 3)
├── .env.local                # API keys (ANTHROPIC_API_KEY, GOOGLE_SHEETS_*)
├── package.json
├── tsconfig.json
└── README.md
```

**Relationship to existing repos:**
- `lsmc-customer-agent` — Empty shell (README + .gitignore only). Can be repurposed or deleted.
- `lsmc-bed-viz` — Working prototype (HTML + Canvas + JS, GitHub Pages). Has real code.
- `lsmc-sow-wizard` — Planned, not yet created.
- `lsmc-cost-dashboard` — COGS GSheet + Apps Script. Data dependency only.

### Phased Approach

**Phase 0 — Conversational Deal Agent (NOW).** Effort: S (3-5 days). Chat UI + Claude + 4 core tools. No blockers. Output: deployed Vercel app where Andrew types "enterprise pharma, 10K samples, SR 30x WGS, CLIA, full logistics" → agent returns structured config + estimated pricing.

**Phase 1 — Pricing Engine + Snapshots (Weeks 2-3).** Effort: S-M. `estimate_deal` tool with full cost breakdown + margin. Export config as JSON/PDF. Depends on COGS discrepancies resolved.

**Phase 2 — SOW Generation (Weeks 4-6).** Effort: M. `generate_sow` tool with modular template blocks extracted from 23andMe SOW (finalized 2/25). Config → Google Doc. Depends on template extraction + governance decision.

**Phase 3 — Customer-Facing Mode (Q3-Q4 2026).** Effort: L. Customer system prompt, restricted tools, qualification flow, CRM integration, website embedding. Depends on V1 live + website redesign + Julie's brand + Sandra's sensitivity review.

### Open Decisions

1. **Vercel tier:** Pro ($20/mo) recommended from the start — 10s Hobby timeout likely too short for GSheets API cold start + tool-calling loops. Alternative: test on Hobby first with Fluid Compute.
2. **GSheets auth:** Service account (simpler, server-side) vs OAuth (Andrew's account). Recommend service account.
3. **Config schema source of truth:** `lib/config/dimensions.ts` in this repo. Extract to shared package only if needed by another repo at Phase 2+.
4. **`lsmc-sow-wizard` still needed?** If the deal agent's tool layer IS the wizard engine, the separate repo is redundant. Defer creating it until Phase 2.
5. **COGS data freshness:** Read live from GSheets at Phase 0 volume. Cache with TTL at scale.
6. **Model routing:** Start Haiku for everything (~$0.04/conversation). Add Sonnet fallback only if reasoning quality is insufficient for complex configs.

### Related Entities

- [[customer-agent]] — Parent project
- [[deal-config-wizard]] — 8-dimension model and archetype source
- [[cogs-model]] — Pricing data (GSheet v2.2)
- [[ref-sow-wizard-prd]] — Detailed wizard PRD (Phase 2 reference)
- [[ref-customer-ecosystem]] — Ecosystem architecture
- [[research-ai-agent-platforms]] — Platform evaluation
- [[dev-registry]] — Infrastructure decisions (update when repo created)
- [[v1-test-spec]] — Defines quotable test configs
- [[julie-mckeough]] — Brand constraints (Phase 3)
