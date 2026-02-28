"use client";

import { useReducer, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  createInitialState,
  dealReducer,
  configToDealInput,
} from "@/lib/config/deal-state";
import { calculateCOGS } from "@/lib/engine/cogs-calculator";
import PresetSelector from "./_components/PresetSelector";
import DealMetadata from "./_components/DealMetadata";
import ConfigForm from "./_components/ConfigForm";
import PricingBreakdown from "./_components/PricingBreakdown";
import SOWPreview from "./_components/SOWPreview";
import ConfigCompare from "./_components/ConfigCompare";
import AgentDrawer from "./_components/AgentDrawer";
import AuthFooter from "./_components/AuthFooter";
import OnboardingTour, { startTour } from "./_components/OnboardingTour";

type Tab = "pricing" | "sow" | "compare";

export default function DealWizard() {
  const [state, dispatch] = useReducer(dealReducer, undefined, createInitialState);
  const [activeTab, setActiveTab] = useState<Tab>("pricing");
  const [agentOpen, setAgentOpen] = useState(false);

  const breakdown = useMemo(() => {
    if (!state.selectedPresetId && !state.config.testConfiguration) return null;
    const input = configToDealInput(state);
    return calculateCOGS(input);
  }, [state]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-lsmc-night">
      {/* Onboarding tour (auto-shows on first visit) */}
      <OnboardingTour />

      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-lsmc-steel/30 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/lsmc-logo-mark-white.svg" alt="LSMC" width={24} height={24} />
          <span className="text-xs text-lsmc-steel">|</span>
        </Link>
        <h1 className="text-sm font-semibold text-lsmc-white">Deal Wizard</h1>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
          Internal
        </span>
        {state.clientName && (
          <>
            <span className="text-xs text-lsmc-steel">·</span>
            <span className="text-xs text-lsmc-mist">{state.clientName}</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => startTour()}
            className="flex h-6 w-6 items-center justify-center rounded-md text-lsmc-steel transition-colors hover:bg-lsmc-slate hover:text-lsmc-mist"
            title="Show walkthrough"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="rounded-md px-2.5 py-1 text-[10px] font-medium text-lsmc-steel transition-colors hover:text-lsmc-mist"
          >
            Reset
          </button>
          <button
            id="tour-agent-btn"
            onClick={() => setAgentOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-lsmc-accent/30 bg-lsmc-accent/5 px-2.5 py-1 text-[10px] font-semibold text-lsmc-glow transition-all hover:border-lsmc-accent/50 hover:bg-lsmc-accent/10"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
              <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM6 9.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 6 9.75Z" clipRule="evenodd" />
            </svg>
            Agent
          </button>
        </div>
      </header>

      {/* Main content — two columns */}
      <div className="flex min-h-0 flex-1">
        {/* Left column — Config panel */}
        <aside className="flex w-[360px] shrink-0 flex-col border-r border-lsmc-steel/30 bg-lsmc-surface/30">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-5">
              {/* Deal Metadata */}
              <div id="tour-deal-info">
                <Section title="Deal Info">
                  <DealMetadata
                    clientName={state.clientName}
                    dealName={state.dealName}
                    term={state.term}
                    annualVolume={state.annualVolume}
                    marginPct={state.marginPct}
                    batchSize={state.batchSize}
                    dispatch={dispatch}
                  />
                </Section>
              </div>

              {/* Preset Selector */}
              <div id="tour-presets">
                <Section title="Product Preset">
                  <PresetSelector
                    selectedId={state.selectedPresetId}
                    onSelect={(id) =>
                      dispatch({ type: "SELECT_PRESET", presetId: id })
                    }
                  />
                </Section>
              </div>

              {/* Config Overrides */}
              <div id="tour-config">
                <Section title="Configuration">
                  <ConfigForm config={state.config} dispatch={dispatch} />
                </Section>
              </div>
            </div>
          </div>
        </aside>

        {/* Right column — Tabbed content */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Tab bar */}
          <div className="flex shrink-0 items-center gap-1 border-b border-lsmc-steel/30 px-6 py-2">
            {(
              [
                { id: "pricing", label: "Pricing" },
                { id: "sow", label: "SOW Preview" },
                { id: "compare", label: "Compare" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                id={`tour-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-lsmc-accent/10 text-lsmc-accent"
                    : "text-lsmc-steel hover:text-lsmc-mist"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Quick stats in tab bar */}
            {breakdown && (
              <div className="ml-auto flex items-center gap-4">
                <Stat label="Cost" value={`$${breakdown.fullyBurdenedCost.toFixed(2)}`} />
                <Stat
                  label="Price"
                  value={`$${breakdown.recommendedPrice.toFixed(2)}`}
                  accent
                />
                <Stat
                  label="Margin"
                  value={`${Math.round(breakdown.targetMarginPct * 100)}%`}
                />
              </div>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {activeTab === "pricing" && (
              <div className="mx-auto max-w-2xl">
                <PricingBreakdown
                  breakdown={breakdown}
                  annualVolume={state.annualVolume}
                />
              </div>
            )}

            {activeTab === "sow" && (
              <SOWPreview state={state} />
            )}

            {activeTab === "compare" && (
              <ConfigCompare state={state} breakdown={breakdown} />
            )}
          </div>
        </main>
      </div>

      {/* Auth footer */}
      <AuthFooter />

      {/* Agent drawer */}
      <AgentDrawer open={agentOpen} onClose={() => setAgentOpen(false)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-lsmc-steel">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="text-right">
      <div className="text-[9px] uppercase tracking-wider text-lsmc-steel">
        {label}
      </div>
      <div
        className={`font-mono text-xs font-semibold ${accent ? "text-lsmc-accent" : "text-lsmc-ice"}`}
      >
        {value}
      </div>
    </div>
  );
}
