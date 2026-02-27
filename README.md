# LSMC Forge

Product and workflow prototypes for LSMC. Some customer-facing, others for internal business orchestration.

## Modules

| Module | Description | Audience | Status |
|--------|-------------|----------|--------|
| **Deal Agent** | Conversational deal configurator — chat with Claude to build pricing estimates and deal configs from LSMC's 8-dimension model | Internal (Andrew, Eric) | Phase 0 |
| **Genome Performance Explorer** | Browse genes, build panels, and see how your targets perform on LSMC's clinical genome — upload BED files or use preset panels | Customer-facing | Prototype |
| **Deal Wizard** | Structured 8-dimension deal configuration form with archetype presets, pricing engine, and SOW generation | Internal | Planned |
| **Pipeline Viz** | Interactive bioinformatics pipeline visualization — scroll-driven animation with stage fade-ins showing sample-to-report journey | Customer-facing (website) | Prototype |

## Architecture

Single Next.js 15 app with route-based modules. The Deal Agent and Deal Wizard share a common tool backend — one engine, two interfaces.

```
app/
├── page.tsx              # Landing page (module index)
├── deal-agent/           # Chat UI (Vercel AI SDK + Claude)
├── bed-viz/              # Genome Performance Explorer (iframe → public/bed-viz-app/)
├── deal-wizard/          # Form-based configurator
├── pipeline-viz/         # Scroll-driven pipeline animation
└── api/chat/             # AI SDK streaming endpoint
lib/
├── tools/                # Agent tools (shared by chat + form)
├── config/               # 8-dimension schema, archetypes, capabilities
├── sheets/               # Google Sheets API client (COGS data)
└── prompts/              # System prompts (internal + customer modes)
public/
├── brand/                # LSMC SVG logos (wordmark, logo mark)
└── bed-viz-app/          # Standalone BED viz prototype (HTML/CSS/JS)
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **AI:** Vercel AI SDK v4 + Claude Haiku 4.5 (default) / Sonnet 4.6 (complex reasoning)
- **Pricing data:** Google Sheets API v4 (read-only, COGS Calculator)
- **UI:** React 19 + Tailwind CSS 4 (LSMC brand tokens: DM Sans + JetBrains Mono, dark theme)
- **Deploy:** Vercel (Hobby tier, auto-deploy from main)

## Getting Started

```bash
npm install
cp .env.local.example .env.local  # Add your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL` | For pricing | GSheets service account |
| `GOOGLE_SHEETS_PRIVATE_KEY` | For pricing | GSheets service account key |
| `GOOGLE_SHEETS_COGS_SHEET_ID` | For pricing | COGS Calculator sheet ID |
| `AGENT_MODE` | No | `internal` (default) or `customer` |

## Design Docs

Detailed design specs live in `docs/design/`. Vault changelog and new idea artifacts tracked in Mithrandir at `projects/forge/`.

## Deployment

Connected to Vercel. Push to `main` deploys automatically.

```bash
vercel --prod  # Manual deploy
```
