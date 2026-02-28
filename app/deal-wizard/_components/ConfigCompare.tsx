"use client";

import { useState, useMemo } from "react";
import {
  createInitialState,
  configToDealInput,
  dealReducer,
} from "@/lib/config/deal-state";
import { calculateCOGS } from "@/lib/engine/cogs-calculator";
import { PRODUCT_PRESETS } from "@/lib/config/presets";
import type { DealWizardState } from "@/lib/config/deal-state";
import type { COGSBreakdown } from "@/lib/engine/types";

interface ConfigCompareProps {
  state: DealWizardState;
  breakdown: COGSBreakdown | null;
}

const COST_STAGES: { key: keyof COGSBreakdown; label: string }[] = [
  { key: "accessioning", label: "Accessioning" },
  { key: "extraction", label: "Extraction" },
  { key: "libraryPrep", label: "Library Prep" },
  { key: "qc", label: "QC" },
  { key: "sequencingShortRead", label: "Sequencing (SR)" },
  { key: "sequencingLongRead", label: "Sequencing (LR)" },
  { key: "instrumentAmortization", label: "Instrument Amort." },
  { key: "secondaryAnalysis", label: "Secondary Analysis" },
  { key: "tertiaryAnalysis", label: "Tertiary Analysis" },
  { key: "clinicalSignOut", label: "Clinical Sign-out" },
  { key: "dataStorage", label: "Data Storage" },
  { key: "labor", label: "Labor" },
  { key: "logistics", label: "Logistics" },
  { key: "overhead", label: "Overhead" },
];

export default function ConfigCompare({
  state,
  breakdown,
}: ConfigCompareProps) {
  const [comparePresetId, setComparePresetId] = useState<string | null>(null);

  // Build comparison breakdown from selected preset
  const compareBreakdown = useMemo(() => {
    if (!comparePresetId) return null;
    // Create a fresh state from the preset, inheriting volume/margin from current deal
    const compareState = createInitialState();
    // Apply preset
    const preset = PRODUCT_PRESETS.find((p) => p.id === comparePresetId);
    if (!preset) return null;

    // Simulate SELECT_PRESET by using the same state shape
    const presetState: DealWizardState = {
      ...compareState,
      selectedPresetId: comparePresetId,
      annualVolume: state.annualVolume,
      batchSize: state.batchSize,
      marginPct: state.marginPct,
      config: {
        ...compareState.config,
        ...getPresetConfig(comparePresetId),
      },
    };

    try {
      const input = configToDealInput(presetState);
      return calculateCOGS(input);
    } catch {
      return null;
    }
  }, [comparePresetId, state.annualVolume, state.batchSize, state.marginPct]);

  const currentPresetName =
    PRODUCT_PRESETS.find((p) => p.id === state.selectedPresetId)?.name ??
    "Current Config";

  const comparePresetName =
    PRODUCT_PRESETS.find((p) => p.id === comparePresetId)?.name ??
    "Select a preset";

  if (!breakdown) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-4xl">{"\u2696\uFE0F"}</div>
          <p className="mt-3 text-sm text-lsmc-mist">
            Configure a deal first
          </p>
          <p className="mt-1 text-xs text-lsmc-steel">
            Select a preset or configure test parameters, then compare against
            another preset
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Preset selector for comparison */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-lsmc-mist">
          Compare against:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_PRESETS.filter((p) => p.id !== "custom").map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                setComparePresetId(
                  preset.id === comparePresetId ? null : preset.id,
                )
              }
              disabled={preset.id === state.selectedPresetId}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                preset.id === comparePresetId
                  ? "bg-lsmc-accent/15 text-lsmc-accent ring-1 ring-lsmc-accent/30"
                  : preset.id === state.selectedPresetId
                    ? "bg-lsmc-surface/50 text-lsmc-steel/50 cursor-not-allowed"
                    : "bg-lsmc-surface text-lsmc-mist hover:text-lsmc-ice"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {!compareBreakdown ? (
        <div className="rounded-lg border border-lsmc-steel/20 bg-lsmc-surface/30 p-8 text-center">
          <p className="text-xs text-lsmc-steel">
            Select a preset above to compare side-by-side
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard
              label="Cost/Sample"
              currentValue={breakdown.fullyBurdenedCost}
              compareValue={compareBreakdown.fullyBurdenedCost}
              format="dollar"
            />
            <SummaryCard
              label="Price/Sample"
              currentValue={breakdown.recommendedPrice}
              compareValue={compareBreakdown.recommendedPrice}
              format="dollar"
            />
            <SummaryCard
              label="Annual Profit"
              currentValue={breakdown.annualProfit}
              compareValue={compareBreakdown.annualProfit}
              format="dollar-large"
            />
          </div>

          {/* Side-by-side table */}
          <div className="overflow-hidden rounded-lg border border-lsmc-steel/20">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-lsmc-steel/20 bg-lsmc-surface/50">
                  <th className="px-3 py-2 text-left font-semibold text-lsmc-mist">
                    Stage
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-lsmc-accent">
                    {currentPresetName}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-lsmc-teal">
                    {comparePresetName}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-lsmc-mist">
                    Diff
                  </th>
                </tr>
              </thead>
              <tbody>
                {COST_STAGES.map(({ key, label }) => {
                  const a = breakdown[key] as number;
                  const b = compareBreakdown[key] as number;
                  const diff = a - b;
                  const significant = Math.abs(diff) > 0.5;

                  return (
                    <tr
                      key={key}
                      className="border-b border-lsmc-steel/10 last:border-0"
                    >
                      <td className="px-3 py-1.5 text-lsmc-mist">{label}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-lsmc-ice">
                        ${a.toFixed(2)}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-lsmc-ice">
                        ${b.toFixed(2)}
                      </td>
                      <td
                        className={`px-3 py-1.5 text-right font-mono ${
                          !significant
                            ? "text-lsmc-steel"
                            : diff > 0
                              ? "text-rose-400"
                              : "text-emerald-400"
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

                {/* Totals row */}
                <tr className="border-t border-lsmc-steel/30 bg-lsmc-surface/30">
                  <td className="px-3 py-2 font-semibold text-lsmc-white">
                    Fully Burdened Cost
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-lsmc-accent">
                    ${breakdown.fullyBurdenedCost.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-lsmc-teal">
                    ${compareBreakdown.fullyBurdenedCost.toFixed(2)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono font-semibold ${
                      breakdown.fullyBurdenedCost -
                        compareBreakdown.fullyBurdenedCost >
                      0
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {breakdown.fullyBurdenedCost -
                      compareBreakdown.fullyBurdenedCost >
                    0
                      ? "+"
                      : ""}
                    {(
                      breakdown.fullyBurdenedCost -
                      compareBreakdown.fullyBurdenedCost
                    ).toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-lsmc-surface/30">
                  <td className="px-3 py-2 font-semibold text-lsmc-white">
                    Recommended Price
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-lsmc-accent">
                    ${breakdown.recommendedPrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-lsmc-teal">
                    ${compareBreakdown.recommendedPrice.toFixed(2)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono font-semibold ${
                      breakdown.recommendedPrice -
                        compareBreakdown.recommendedPrice >
                      0
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {breakdown.recommendedPrice -
                      compareBreakdown.recommendedPrice >
                    0
                      ? "+"
                      : ""}
                    {(
                      breakdown.recommendedPrice -
                      compareBreakdown.recommendedPrice
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  currentValue,
  compareValue,
  format,
}: {
  label: string;
  currentValue: number;
  compareValue: number;
  format: "dollar" | "dollar-large";
}) {
  const diff = currentValue - compareValue;
  const pctDiff =
    compareValue !== 0 ? ((currentValue - compareValue) / compareValue) * 100 : 0;

  const formatVal = (v: number) =>
    format === "dollar-large"
      ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : `$${v.toFixed(2)}`;

  return (
    <div className="rounded-lg border border-lsmc-steel/20 bg-lsmc-surface/30 p-3">
      <p className="text-[9px] uppercase tracking-wider text-lsmc-steel">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-sm font-semibold text-lsmc-accent">
          {formatVal(currentValue)}
        </span>
        <span className="text-lsmc-steel">vs</span>
        <span className="font-mono text-sm font-semibold text-lsmc-teal">
          {formatVal(compareValue)}
        </span>
      </div>
      <p
        className={`mt-1 text-[10px] font-medium ${
          Math.abs(diff) < 0.01
            ? "text-lsmc-steel"
            : diff > 0
              ? "text-rose-400"
              : "text-emerald-400"
        }`}
      >
        {diff > 0 ? "+" : ""}
        {pctDiff.toFixed(1)}%
      </p>
    </div>
  );
}

/**
 * Returns the DealConfig for a given preset ID by running it through the reducer.
 */
function getPresetConfig(presetId: string) {
  const tempState = createInitialState();
  const result = dealReducer(tempState, {
    type: "SELECT_PRESET",
    presetId,
  });
  return result.config;
}
