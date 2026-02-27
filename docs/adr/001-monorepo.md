# ADR-001: Monorepo over separate repos

## Status: Accepted

## Context

LSMC has 4 product prototypes in various states: Deal Agent (design spec), BED Viz (working prototype in separate repo), Deal Wizard (PRD only), Pipeline Viz (HTML prototypes in vault). Each could be its own repo, but they share infrastructure (Vercel, Next.js, Tailwind) and some share backend logic (Deal Agent + Deal Wizard use the same tool engine).

## Decision

Single Next.js monorepo (`lsmc-forge`) with route-based modules. One Vercel deployment, one landing page, shared infrastructure.

## Consequences

- **Pro:** Single deploy, shared UI components, tool backend reuse between agent and wizard
- **Pro:** Landing page demonstrates the full product vision in one URL
- **Pro:** Faster to scaffold and iterate — no cross-repo dependency management
- **Con:** BED Viz port loses its existing GitHub Pages deployment (acceptable — Vercel replaces it)
- **Con:** Larger single repo over time — mitigated by Next.js route-based code splitting
