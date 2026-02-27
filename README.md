# LSMC Forge

Product and workflow prototypes for LSMC. Some customer-facing, others for internal business orchestration.

**Live:** https://lsmc-forge.vercel.app (requires @lsmc.com Google login)

## Modules

| Module | Route | Description | Status |
|--------|-------|-------------|--------|
| **Deal Agent** | `/deal-agent` | Chat with Claude to configure deals — 14-stage COGS engine, coverage-aware sequencing costs, capacity modeling | Working |
| **BED Viz** | `/bed-viz` | Genome Performance Explorer — browse genes, build panels, score BED files against LSMC benchmarks | Working |
| **Pipeline Viz** | `/pipeline-viz` | 9-stage clinical sample journey visualization — accessioning through reporting | Working |
| **Deal Wizard** | `/deal-wizard` | Structured form for deal configuration with presets and SOW generation | Planned |

## Architecture

```
app/
├── page.tsx                         # Landing page (module index)
├── login/page.tsx                   # Google OAuth login
├── deal-agent/page.tsx              # Chat UI (Vercel AI SDK + Claude)
├── bed-viz/page.tsx                 # Iframe wrapper for BED viz prototype
├── pipeline-viz/page.tsx            # 9-stage pipeline visualization
├── deal-wizard/page.tsx             # Form-based configurator (planned)
├── api/
│   ├── auth/[...nextauth]/route.ts  # Auth.js handlers
│   └── chat/route.ts               # AI SDK streaming endpoint
auth.ts                              # Auth.js v5 config (Google, @lsmc.com only)
middleware.ts                        # Route protection (redirect to /login)
lib/
├── engine/                          # 14-stage COGS calculator
│   ├── types.ts                     # DealInput, COGSBreakdown interfaces
│   ├── cogs-calculator.ts           # Per-sample cost engine
│   └── capacity.ts                  # Instrument utilization model
├── data/                            # GSheet-sourced reference data
│   ├── platforms.ts                 # 7 sequencing platform configs
│   ├── consumables.ts               # Kits, reagents, QC
│   ├── labor.ts                     # 4 rate categories, 6 stages
│   ├── compute.ts                   # Analysis + storage costs
│   └── overhead.ts                  # Fixed annual costs
└── config/                          # Deal dimensions + presets
    ├── dimensions.ts                # 8-dimension config schema
    └── presets.ts                   # 6 product presets
public/
├── bed-viz-app/                     # Full BED viz prototype (HTML/JS/CSS)
└── brand/                           # LSMC logos (SVG)
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **AI:** Vercel AI SDK v4 + Claude Haiku 4.5
- **Auth:** Auth.js v5 (NextAuth) + Google OAuth — restricted to @lsmc.com
- **Pricing engine:** 14-stage per-sample COGS calculator (coverage-aware, capacity-modeled)
- **UI:** React 19 + Tailwind CSS 4
- **Deploy:** Vercel (GitHub auto-deploy on merge to `main`)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key (Deal Agent) |
| `AUTH_SECRET` | Yes | Auth.js session secret (generate with `openssl rand -base64 33`) |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `AUTH_TRUST_HOST` | Vercel | Set to `true` for Vercel deployments |

All env vars must be set in both `.env.local` (local dev) and Vercel project settings (production).

## Auth Setup

Google OAuth restricts login to `@lsmc.com` accounts only. To configure:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://lsmc-forge.vercel.app/api/auth/callback/google` (prod)
4. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` env vars

## Deployment

Connected to Vercel via GitHub. Merging to `main` triggers auto-deploy.

Branch protection is enabled — all changes go through PRs:
```bash
git checkout -b feat/my-feature
# ... make changes ...
git push -u origin feat/my-feature
gh pr create --title "feat: description" --body "..."
gh pr merge N --squash
```

## COGS Engine

The pricing engine (`lib/engine/cogs-calculator.ts`) computes per-sample costs across 14 stages:

1. Accessioning → 2. Extraction → 3. Library Prep → 4. QC → 5. Sequencing (SR) → 6. Sequencing (LR) → 7. Instrument Amortization → 8. Secondary Analysis → 9. Tertiary Analysis → 10. Clinical Sign-Out → 11. Data Storage → 12. Labor → 13. Logistics → 14. Overhead

Key features:
- **Coverage-aware:** sequencing cost scales with depth (1.5x lpWGS ≠ 30x clinical WGS)
- **7 platform configs:** NovaSeq X+ (25B/10B/1.5B FC), UG 100 (S4/S2 wafer), PromethION (2 Solo/48)
- **Capacity modeling:** absorbed vs incremental vs blended pricing based on lab utilization
- **5 Deal Agent tools:** calculateDealCOGS, compareConfigurations, adjustCapacity, lookupPreset, sensitivityAnalysis
