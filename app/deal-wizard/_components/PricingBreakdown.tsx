"use client";

import type { COGSBreakdown } from "@/lib/engine/types";

interface PricingBreakdownProps {
  breakdown: COGSBreakdown | null;
  annualVolume: number;
}

const STAGES: { key: keyof COGSBreakdown; label: string; category: string }[] = [
  { key: "accessioning", label: "Accessioning", category: "Pre-Analytical" },
  { key: "extraction", label: "DNA Extraction", category: "Pre-Analytical" },
  { key: "libraryPrep", label: "Library Prep", category: "Pre-Analytical" },
  { key: "qc", label: "QC", category: "Pre-Analytical" },
  { key: "sequencingShortRead", label: "Sequencing (SR)", category: "Sequencing" },
  { key: "sequencingLongRead", label: "Sequencing (LR)", category: "Sequencing" },
  { key: "instrumentAmortization", label: "Instrument Amort.", category: "Sequencing" },
  { key: "secondaryAnalysis", label: "Secondary Analysis", category: "Analysis" },
  { key: "tertiaryAnalysis", label: "Tertiary Analysis", category: "Analysis" },
  { key: "clinicalSignOut", label: "Clinical Sign-Out", category: "Analysis" },
  { key: "dataStorage", label: "Data Storage", category: "Infrastructure" },
  { key: "labor", label: "Labor", category: "Infrastructure" },
  { key: "logistics", label: "Logistics", category: "Infrastructure" },
  { key: "overhead", label: "Overhead", category: "Infrastructure" },
];

export default function PricingBreakdown({ breakdown, annualVolume }: PricingBreakdownProps) {
  if (!breakdown) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-lsmc-steel">
        Select a product preset to see pricing
      </div>
    );
  }

  const categories = [...new Set(STAGES.map((s) => s.category))];

  return (
    <div className="space-y-6">
      {/* Per-Sample Cost Table */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-lsmc-mist">
          14-Stage Per-Sample COGS
        </h3>
        <div className="rounded-lg border border-lsmc-steel/30 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lsmc-steel/30 bg-lsmc-deep">
                <th className="px-3 py-2 text-left font-medium text-lsmc-mist">Stage</th>
                <th className="px-3 py-2 text-right font-medium text-lsmc-mist">Cost/Sample</th>
                <th className="px-3 py-2 text-right font-medium text-lsmc-mist">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <CategoryGroup
                  key={cat}
                  category={cat}
                  stages={STAGES.filter((s) => s.category === cat)}
                  breakdown={breakdown}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rollup Summary */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-lsmc-mist">
          Pricing Summary
        </h3>
        <div className="space-y-2 rounded-lg border border-lsmc-steel/30 bg-lsmc-surface/80 p-4">
          <SummaryRow label="Variable Cost" value={breakdown.variableCost} />
          <SummaryRow label="Overhead" value={breakdown.overheadPerSample} />
          <SummaryRow label="Instrument Amort." value={breakdown.instrumentAmortization} />
          <div className="my-2 h-px bg-lsmc-steel/30" />
          <SummaryRow
            label="Fully Burdened Cost"
            value={breakdown.fullyBurdenedCost}
            bold
          />
          <SummaryRow
            label={`Target Margin (${Math.round(breakdown.targetMarginPct * 100)}%)`}
            value={breakdown.recommendedPrice - breakdown.fullyBurdenedCost}
          />
          <div className="my-2 h-px bg-lsmc-accent/30" />
          <SummaryRow
            label="Recommended Price"
            value={breakdown.recommendedPrice}
            accent
          />
        </div>
      </div>

      {/* Annual Projections */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-lsmc-mist">
          Annual Projections ({annualVolume.toLocaleString()} samples)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Revenue"
            value={`$${(breakdown.annualRevenue / 1000).toFixed(0)}K`}
            color="text-lsmc-teal"
          />
          <MetricCard
            label="Cost"
            value={`$${(breakdown.annualCost / 1000).toFixed(0)}K`}
            color="text-lsmc-mist"
          />
          <MetricCard
            label="Profit"
            value={`$${(breakdown.annualProfit / 1000).toFixed(0)}K`}
            color={breakdown.annualProfit > 0 ? "text-emerald-400" : "text-red-400"}
          />
        </div>
      </div>

      {/* Capacity */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-lsmc-mist">
          Capacity
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-lsmc-steel/30 bg-lsmc-surface/80 p-3">
            <div className="text-[10px] uppercase tracking-wider text-lsmc-mist">
              Utilization
            </div>
            <div className="mt-1 text-lg font-semibold text-lsmc-ice">
              {(breakdown.capacityUtilization * 100).toFixed(1)}%
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-lsmc-steel/30">
              <div
                className={`h-full rounded-full transition-all ${
                  breakdown.capacityUtilization > 0.85
                    ? "bg-red-400"
                    : breakdown.capacityUtilization > 0.65
                      ? "bg-amber-400"
                      : "bg-lsmc-teal"
                }`}
                style={{ width: `${Math.min(breakdown.capacityUtilization * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg border border-lsmc-steel/30 bg-lsmc-surface/80 p-3">
            <div className="text-[10px] uppercase tracking-wider text-lsmc-mist">
              Runs Needed (Annual)
            </div>
            <div className="mt-1 space-y-1">
              {breakdown.runsNeededSR > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-lsmc-mist">SR</span>
                  <span className="font-mono text-lsmc-ice">
                    {breakdown.runsNeededSR} ({breakdown.samplesPerRunSR}/run)
                  </span>
                </div>
              )}
              {breakdown.runsNeededLR > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-lsmc-mist">LR</span>
                  <span className="font-mono text-lsmc-ice">
                    {breakdown.runsNeededLR} ({breakdown.samplesPerRunLR}/run)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CategoryGroup({
  category,
  stages,
  breakdown,
}: {
  category: string;
  stages: typeof STAGES;
  breakdown: COGSBreakdown;
}) {
  return (
    <>
      <tr className="bg-lsmc-surface/50">
        <td
          colSpan={3}
          className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-lsmc-steel"
        >
          {category}
        </td>
      </tr>
      {stages.map((stage) => {
        const cost = breakdown[stage.key] as number;
        const pct =
          breakdown.fullyBurdenedCost > 0
            ? (cost / breakdown.fullyBurdenedCost) * 100
            : 0;
        return (
          <tr
            key={stage.key}
            className="border-b border-lsmc-steel/10 hover:bg-lsmc-surface/30"
          >
            <td className="px-3 py-1.5 text-lsmc-ice">{stage.label}</td>
            <td className="px-3 py-1.5 text-right font-mono text-lsmc-ice">
              ${cost.toFixed(2)}
            </td>
            <td className="px-3 py-1.5 text-right font-mono text-lsmc-mist">
              {pct > 0 ? `${pct.toFixed(1)}%` : "—"}
            </td>
          </tr>
        );
      })}
    </>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: number;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-xs ${bold || accent ? "font-semibold" : ""} ${accent ? "text-lsmc-accent" : "text-lsmc-mist"}`}
      >
        {label}
      </span>
      <span
        className={`font-mono text-sm ${bold ? "font-semibold text-lsmc-white" : ""} ${accent ? "font-semibold text-lsmc-accent" : "text-lsmc-ice"}`}
      >
        ${value.toFixed(2)}
      </span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-lsmc-steel/30 bg-lsmc-surface/80 p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-lsmc-mist">
        {label}
      </div>
      <div className={`mt-1 text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}
