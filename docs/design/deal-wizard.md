# Deal Wizard — Design & Implementation Plan

## Overview

The Deal Wizard is the 4th and final Forge module — a structured SOW
configurator and generator that complements the Deal Agent. Where the Agent
explores and analyzes deal configurations conversationally, the Wizard takes a
known configuration and produces a deliverable: a draft Statement of Work ready
for team review.

**Core insight:** The Agent and Wizard serve different phases of the deal
lifecycle. The Agent is investigative ("What would it cost to do 30x Ultima vs
Illumina?"). The Wizard is productive ("I know what this deal is — configure it
and generate the SOW"). They share the same engine (COGS, dimensions, presets)
but produce different outputs: analysis vs. documents.

**Design principle:** Preset-first. 80%+ of LSMC deals map to one of 5-6 named
product types. The Wizard's job is: select a preset, override 3-5 fields, see
pricing, generate SOW. Not 8 sequential form pages — one dashboard with
collapsible overrides.

## Deal Lifecycle Flow

```
┌─────────────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│    Deal Agent        │    │    Deal Wizard        │    │   Google Docs      │
│    (Explore)         │ →  │    (Configure +       │ →  │   (Edit + Send)    │
│                      │    │     Generate)         │    │                    │
│ • Compare configs    │    │ • Preset selection    │    │ • Team review      │
│ • Sensitivity anal.  │    │ • Dimension overrides │    │ • Client polish    │
│ • Margin modeling    │    │ • Real-time pricing   │    │ • Legal review     │
│ • "What if" queries  │    │ • SOW generation      │    │ • Final send       │
└─────────────────────┘    └──────────────────────┘    └────────────────────┘
       ANALYSIS                  DOCUMENT                   DELIVERY
```

## Shared Engine (Already Built)

| Component | File | What It Does |
|-----------|------|-------------|
| 8-dimension model | `lib/config/dimensions.ts` | CustomerType, EngagementModel, SampleCharacteristics, TestConfiguration, DeliverableSet, RegulatoryLevel, LogisticsConfig, TATConfig |
| 6 product presets | `lib/config/presets.ts` | Inflection rWGS, Clinical Standard, Low-Pass, Biobank, 23andMe DTC, Custom |
| 14-stage COGS engine | `lib/engine/cogs-calculator.ts` | Coverage-aware sequencing costs, 14 per-sample stages, capacity modeling |
| Type definitions | `lib/engine/types.ts` | DealInput, COGSBreakdown, PlatformConfig, CapacityResult |
| Platform configs | `lib/data/platforms.ts` | 7 instrument configs (NovaSeq, UG 100, PromethION) |
| Capacity modeling | `lib/engine/capacity.ts` | Absorbed vs. incremental volume, utilization analysis |

**No new engine work needed.** The Wizard is a new UI layer over the existing
engine, plus a SOW template system.

## UI Architecture

Two-column layout with tabs — consistent with Genome Explorer's pattern:

```
┌──────────────────────┬───────────────────────────────────────────┐
│                      │                                           │
│   Deal Metadata      │   [Pricing]  [SOW Preview]  [Compare]    │
│   ─────────────      │                                           │
│   Client name        │   ┌───────────────────────────────────┐   │
│   Deal name          │   │                                   │   │
│   Engagement model   │   │  Tab content area                 │   │
│   Term               │   │                                   │   │
│                      │   │  Pricing: 14-stage COGS table     │   │
│   Preset Selector    │   │  + margin sensitivity              │   │
│   ─────────────────  │   │  + annual projections              │   │
│   [rWGS] [Standard]  │   │                                   │   │
│   [Low-Pass] [Bio]   │   │  SOW: Rendered markdown preview   │   │
│   [23andMe] [Custom] │   │  + section navigation              │   │
│                      │   │  + Copy / Download / Push buttons   │   │
│   Config Overrides   │   │                                   │   │
│   ─────────────────  │   │  Compare: Side-by-side configs    │   │
│   ▸ Test Config      │   │  (reuse compareConfigs logic)      │   │
│   ▸ Sample Specs     │   │                                   │   │
│   ▸ Deliverables     │   └───────────────────────────────────┘   │
│   ▸ Regulatory       │                                           │
│   ▸ Logistics        │   [Generate SOW]  [Open Agent ▸]         │
│   ▸ TAT              │                                           │
│                      │                                           │
└──────────────────────┴───────────────────────────────────────────┘
```

**Preset selector:** 6 cards showing product name, description, key specs
(platform + coverage), and typical customer. Selecting a preset fills all 8
dimensions. Override any field via collapsible accordion groups below.

**Agent drawer:** Slide-out panel on the right with the full Deal Agent chat.
Available for edge cases, comparisons, "what-if" analysis without leaving the
Wizard.

## SOW Template Architecture

Three tiers of content generation:

### Tier 1 — Computed (deterministic, from engine)
- Pricing tables (from COGSBreakdown — the 14-stage table + summaries)
- Platform specifications (from DealConfig.testConfiguration)
- Volume/capacity projections (from capacity engine)
- Deliverable lists (from DeliverableSet)
- TAT SLA values (from TAT_DEFAULTS)

*Template-filled. No AI. `${config.shortReadPlatform} at ${config.testConfiguration.shortReadDepth} coverage`.*

### Tier 2 — Parameterized prose (templates + conditional logic)
- Services overview paragraph — standard structure, variables swapped per config
- Sample specifications — standard language per sample type/volume/handling
- Quality standards — standard per regulatory level (RUO vs CLIA/CAP)
- Client responsibilities — standard per engagement model

*TypeScript template strings with conditionals. Each returns a markdown string.*

### Tier 3 — AI-generated prose (Claude for deal-specific language)
- Variant scope description (varies by assay type × platform combination)
- Interpretation methodology (varies by regulatory level × deliverable set)
- Custom deal-specific caveats or special conditions

*Uses Vercel AI SDK (already in project) with a SOW-specific prompt + deal
config as context. 1-2 API calls, ~3-5 seconds.*

**Why this split matters:** Pricing tables MUST be exact — never let an LLM
generate dollar figures. Services descriptions benefit from contextual prose.
The hybrid approach gets deterministic accuracy where it matters and natural
language where it helps.

## SOW Sections

Based on the 23andMe pilot SOW — generalized for any LSMC deal:

### Core sections (always present)

| # | Section | Source Dimension | Content Tier |
|---|---------|-----------------|--------------|
| 1 | Header / Parties | Deal metadata (client name, term) | Tier 2 (parameterized) |
| 2 | Services Overview | All dimensions | Tier 3 (AI-generated) |
| 3 | Test Configuration | TestConfiguration | Tier 1 (computed) + Tier 2 |
| 4 | Sample Specifications | SampleCharacteristics | Tier 2 (parameterized) |
| 5 | Deliverables & Data Transfer | DeliverableSet | Tier 1 (computed list) |
| 6 | Turnaround Time / SLA | TATConfig | Tier 1 (computed) |
| 7 | Pricing | COGSBreakdown + margin | Tier 1 (computed tables) |
| 8 | Quality Standards | RegulatoryLevel | Tier 2 (parameterized) |

### Conditional sections (included based on config)

| # | Section | Condition | Content Tier |
|---|---------|-----------|--------------|
| 9 | Logistics & Kitting | kitShipping=true OR international=true | Tier 2 |
| 10 | Interpretation & Reporting | deliverables includes interpretation or clinical_report | Tier 3 (AI) |
| 11 | Data Security & Compliance | regulatoryLevel = clia or clia_cap | Tier 2 |

### Boilerplate (always appended)

| # | Section | Notes |
|---|---------|-------|
| 12 | Client Responsibilities | Parameterized per engagement model |
| 13 | Disclaimers & Limitations | Standard boilerplate |
| 14 | Terms & Conditions | Link to master agreement or inline |

## Implementation Plan

### Phase 1: Config Dashboard + Live Pricing (Days 1-3)

| File | Purpose |
|------|---------|
| `app/deal-wizard/page.tsx` | Two-column layout, tab navigation |
| `app/deal-wizard/components/PresetSelector.tsx` | Product preset cards |
| `app/deal-wizard/components/ConfigForm.tsx` | Collapsible dimension groups |
| `app/deal-wizard/components/DealMetadata.tsx` | Client name, deal name, term |
| `app/deal-wizard/components/PricingBreakdown.tsx` | 14-stage table + summary |
| `lib/config/deal-state.ts` | React state (useReducer) for DealConfig |

All pricing computed client-side using existing `lib/engine/`. No API calls.

**Demoable after Phase 1:** Select preset → see instant pricing → override fields → pricing updates live.

### Phase 2: SOW Template Engine (Days 4-6)

| File | Purpose |
|------|---------|
| `lib/sow/types.ts` | SOWDocument, SOWSection interfaces |
| `lib/sow/template-engine.ts` | Orchestrator: DealConfig + COGS → SOWDocument |
| `lib/sow/sections/header.ts` | Parties, term, effective date |
| `lib/sow/sections/services-overview.ts` | AI-generated services description |
| `lib/sow/sections/test-configuration.ts` | Platform specs, variant scope |
| `lib/sow/sections/sample-specifications.ts` | From SampleCharacteristics |
| `lib/sow/sections/deliverables.ts` | From DeliverableSet |
| `lib/sow/sections/turnaround-time.ts` | From TATConfig |
| `lib/sow/sections/pricing.ts` | From COGSBreakdown |
| `lib/sow/sections/quality-standards.ts` | From RegulatoryLevel |
| `lib/sow/sections/logistics.ts` | Conditional — from LogisticsConfig |
| `lib/sow/sections/client-responsibilities.ts` | From EngagementModel |
| `lib/sow/sections/disclaimers.ts` | Boilerplate |
| `app/api/sow/route.ts` | API route for Claude Tier 3 prose generation |

### Phase 3: SOW Preview + Export (Days 7-9)

| File | Purpose |
|------|---------|
| `app/deal-wizard/components/SOWPreview.tsx` | Rendered markdown + section nav |
| `app/deal-wizard/components/SOWActions.tsx` | Copy, download, (future: GDoc push) |
| Tab wiring in page.tsx | Connect SOW Preview tab |

### Phase 4: Polish + Agent Drawer (Days 10-12)

| File | Purpose |
|------|---------|
| `app/deal-wizard/components/AgentDrawer.tsx` | Slide-out Deal Agent chat panel |
| Compare tab | Side-by-side configs (reuse compareConfigs logic) |
| Form validation, error states, loading states | UX polish |

## Output & Export

**V1 (initial build):**
- SOW generated as structured markdown
- Preview in-app with rendered sections and section navigation
- "Copy All" button → copies formatted text to clipboard
- "Download as Markdown" → `.md` file download
- User pastes into Google Docs or creates from template

**V1.5 (follow-on):**
- "Push to Google Docs" button → creates GDoc via Google Docs API
- Doc placed in designated Drive folder (e.g., "LSMC SOWs / Drafts")
- Returns GDoc URL → opens in browser for team editing

## Open Questions

1. **Template governance:** Who owns the SOW section text? Andrew drafts, Eric
   approves? Or does Eric provide "golden" text for each section?
2. **[INPUT NEEDED] handling:** Should the Wizard try to fill these from config,
   or explicitly leave them for human editing?
3. **Deal persistence:** V1 is stateless (refresh = lose config). When to add
   database persistence? What schema?
4. **Multi-track timing:** When does multi-track SOW support become necessary?
5. **GDrive folder structure:** Where do generated SOWs land in Google Drive?
6. **Eric demo timing:** Config + pricing is demoable after Phase 1 (3 days).
   Full SOW generation after Phase 3 (9 days).
7. **Customer-facing version:** When to build a customer mode toggle?

## Approaches Considered

**A: Full 8-Step Form Wizard** (PRD spec) — 8 sequential form pages, one per
dimension. Rejected: over-engineered for a 6-person team.

**B: Agent-First + SOW Tool** — No new form UI. Add `generate_sow` tool to Deal
Agent. Considered: lowest effort. Rejected as primary: no visual config state,
chat-only is awkward for "tweak one field and regenerate."

**C: Config Dashboard + SOW Generator** (selected) — Single-page dashboard with
preset selector, real-time pricing, and SOW generation. Best balance of
structure, speed, and demo value. Agent available in drawer for edge cases.
