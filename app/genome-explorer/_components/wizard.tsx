"use client";

import { useState, useCallback } from "react";
import {
  type Gene,
  type BedRegion,
  PANEL_PRESETS,
  genesToRegions,
  parseBedFile,
} from "../_lib/genome-data";
import { buildWholeGenomeRegions } from "../_lib/analysis";
import GeneSearch from "./gene-search";

interface WizardProps {
  onComplete: (regions: BedRegion[], depth: number, label: string) => void;
  onBack: () => void;
}

type AnalysisType = "whole-genome" | "preset" | "custom";

const DEPTH_OPTIONS = [
  { value: 10, label: "10x" },
  { value: 20, label: "20x" },
  { value: 30, label: "30x", recommended: true },
  { value: 50, label: "50x" },
];

const STEPS = ["Depth", "Type", "Targets", "Review"];

const ANALYSIS_TYPES = [
  {
    id: "whole-genome" as const,
    title: "Whole Genome",
    desc: "All 24 chromosomes — broad performance overview across the full genome.",
  },
  {
    id: "preset" as const,
    title: "Preset Panel",
    desc: "Choose from curated clinical gene panels (cancer, cardiac, neuro, etc.).",
  },
  {
    id: "custom" as const,
    title: "Custom Panel",
    desc: "Search genes or upload a BED file with your target regions.",
  },
];

export default function Wizard({ onComplete, onBack }: WizardProps) {
  const [step, setStep] = useState(0);
  const [depth, setDepth] = useState(30);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("whole-genome");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedGenes, setSelectedGenes] = useState<Gene[]>([]);
  const [customRegions, setCustomRegions] = useState<BedRegion[]>([]);
  const [bedError, setBedError] = useState<string | null>(null);

  const addGene = useCallback((gene: Gene) => {
    setSelectedGenes((prev) => {
      if (prev.some((g) => g.symbol === gene.symbol)) return prev;
      return [...prev, gene];
    });
  }, []);

  const removeGene = useCallback((symbol: string) => {
    setSelectedGenes((prev) => prev.filter((g) => g.symbol !== symbol));
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const parsed = parseBedFile(text);
        if (parsed.regions.length === 0) {
          setBedError(
            parsed.warnings.length > 0
              ? parsed.warnings[0]
              : "No valid BED regions found. Expected tab-separated: chr  start  end  [name]",
          );
        } else {
          setBedError(
            parsed.warnings.length > 0 ? parsed.warnings[0] : null,
          );
          setCustomRegions(parsed.regions);
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  const canAdvance = () => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return true;
      case 2:
        if (analysisType === "whole-genome") return true;
        if (analysisType === "preset") return selectedPreset !== null;
        return selectedGenes.length > 0 || customRegions.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const submit = () => {
    let regions: BedRegion[];
    let label: string;

    if (analysisType === "whole-genome") {
      regions = buildWholeGenomeRegions();
      label = "Whole Genome";
    } else if (analysisType === "preset" && selectedPreset) {
      const preset = PANEL_PRESETS[selectedPreset];
      if (!preset) return;
      regions = genesToRegions(preset.genes);
      label = preset.name;
    } else {
      regions = [
        ...genesToRegions(selectedGenes),
        ...customRegions,
      ];
      label = `Custom Panel (${regions.length} regions)`;
    }

    onComplete(regions, depth, label);
  };

  const nextStep = () => {
    if (step === 1 && analysisType === "whole-genome") {
      setStep(3);
    } else {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (step === 3 && analysisType === "whole-genome") {
      setStep(1);
    } else if (step === 0) {
      onBack();
    } else {
      setStep((s) => s - 1);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Step indicator */}
      <div className="mb-10 flex items-center gap-1">
        {STEPS.map((label, i) => {
          if (i === 2 && analysisType === "whole-genome") return null;
          const isFirst =
            i === 0 || (i === 3 && analysisType === "whole-genome");
          return (
            <div key={label} className="flex items-center gap-1">
              {!isFirst && (
                <div
                  className={`h-px w-8 ${i <= step ? "bg-lsmc-accent" : "bg-lsmc-steel/50"}`}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    i < step
                      ? "bg-lsmc-accent text-white"
                      : i === step
                        ? "border border-lsmc-accent bg-lsmc-accent/10 text-lsmc-accent"
                        : "border border-lsmc-steel/50 text-lsmc-steel"
                  }`}
                >
                  {i < step ? "\u2713" : i + 1}
                </div>
                <span
                  className={`text-xs ${i <= step ? "text-lsmc-ice" : "text-lsmc-steel"}`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="min-h-[320px]">
        {step === 0 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-lsmc-white">
              Coverage Depth
            </h2>
            <p className="mb-6 text-sm text-lsmc-mist">
              Select the mean sequencing depth for your analysis. Higher depth
              improves sensitivity, especially in difficult genomic regions.
            </p>
            <div className="grid grid-cols-4 gap-3">
              {DEPTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDepth(opt.value)}
                  className={`relative rounded-lg border p-4 text-center transition-all ${
                    depth === opt.value
                      ? "border-lsmc-accent bg-lsmc-accent/10 text-lsmc-white"
                      : "border-lsmc-steel/40 bg-lsmc-surface text-lsmc-mist hover:border-lsmc-steel hover:text-lsmc-ice"
                  }`}
                >
                  <div className="text-2xl font-semibold">{opt.label}</div>
                  <div className="mt-1 text-xs text-lsmc-mist">mean depth</div>
                  {opt.recommended && (
                    <span className="absolute -top-2 right-2 rounded-full bg-lsmc-accent/20 px-2 py-0.5 text-[9px] font-medium text-lsmc-accent">
                      Clinical
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-lsmc-white">
              Analysis Type
            </h2>
            <p className="mb-6 text-sm text-lsmc-mist">
              Choose what to analyze. Whole genome provides the broadest view;
              panels focus on specific targets.
            </p>
            <div className="space-y-3">
              {ANALYSIS_TYPES.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAnalysisType(opt.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    analysisType === opt.id
                      ? "border-lsmc-accent bg-lsmc-accent/10"
                      : "border-lsmc-steel/40 bg-lsmc-surface hover:border-lsmc-steel"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold ${analysisType === opt.id ? "text-lsmc-white" : "text-lsmc-ice"}`}
                  >
                    {opt.title}
                  </div>
                  <div className="mt-1 text-xs text-lsmc-mist">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && analysisType === "preset" && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-lsmc-white">
              Select Panel
            </h2>
            <p className="mb-6 text-sm text-lsmc-mist">
              Choose a curated gene panel. Each panel targets genes relevant to
              a specific clinical area.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PANEL_PRESETS).map(([id, preset]) => (
                <button
                  key={id}
                  onClick={() => setSelectedPreset(id)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    selectedPreset === id
                      ? "border-lsmc-accent bg-lsmc-accent/10"
                      : "border-lsmc-steel/40 bg-lsmc-surface hover:border-lsmc-steel"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold ${selectedPreset === id ? "text-lsmc-white" : "text-lsmc-ice"}`}
                  >
                    {preset.name}
                  </div>
                  <div className="mt-1 text-xs text-lsmc-mist">
                    {preset.genes.length} genes
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && analysisType === "custom" && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-lsmc-white">
              Build Your Panel
            </h2>
            <p className="mb-4 text-sm text-lsmc-mist">
              Search our gene database to add targets, or upload a BED file.
            </p>

            <GeneSearch
              onSelect={addGene}
              placeholder="Search genes (e.g., BRCA1, TP53...)"
              autoFocus
            />

            {selectedGenes.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-medium text-lsmc-mist">
                  {selectedGenes.length} gene
                  {selectedGenes.length !== 1 ? "s" : ""} selected
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedGenes.map((gene) => (
                    <span
                      key={gene.symbol}
                      className="inline-flex items-center gap-1.5 rounded-full border border-lsmc-accent/30 bg-lsmc-accent/10 px-3 py-1 text-xs text-lsmc-ice"
                    >
                      {gene.symbol}
                      <button
                        onClick={() => removeGene(gene.symbol)}
                        className="text-lsmc-mist hover:text-lsmc-white"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="mb-2 text-xs font-medium text-lsmc-mist">
                Or upload a BED file
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-lsmc-steel/50 bg-lsmc-surface/50 p-4 transition-colors hover:border-lsmc-steel">
                <svg
                  className="h-5 w-5 text-lsmc-steel"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-sm text-lsmc-mist">
                  {customRegions.length > 0
                    ? `${customRegions.length} regions loaded`
                    : "Choose .bed file"}
                </span>
                <input
                  type="file"
                  accept=".bed,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {bedError && (
                <p className="mt-2 text-xs text-red-400">{bedError}</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold text-lsmc-white">
              Review
            </h2>
            <p className="mb-6 text-sm text-lsmc-mist">
              Confirm your analysis configuration before running.
            </p>
            <div className="space-y-4 rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80 p-6">
              <div className="flex justify-between">
                <span className="text-sm text-lsmc-mist">Coverage Depth</span>
                <span className="text-sm font-medium text-lsmc-white">
                  {depth}x
                </span>
              </div>
              <div className="h-px bg-lsmc-steel/30" />
              <div className="flex justify-between">
                <span className="text-sm text-lsmc-mist">Analysis Type</span>
                <span className="text-sm font-medium text-lsmc-white">
                  {analysisType === "whole-genome"
                    ? "Whole Genome"
                    : analysisType === "preset"
                      ? (selectedPreset ? PANEL_PRESETS[selectedPreset]?.name : "Preset") || "Preset"
                      : "Custom Panel"}
                </span>
              </div>
              <div className="h-px bg-lsmc-steel/30" />
              <div className="flex justify-between">
                <span className="text-sm text-lsmc-mist">Targets</span>
                <span className="text-sm font-medium text-lsmc-white">
                  {analysisType === "whole-genome"
                    ? "24 chromosomes"
                    : analysisType === "preset"
                      ? `${(selectedPreset ? PANEL_PRESETS[selectedPreset]?.genes.length : 0) || 0} genes`
                      : `${selectedGenes.length} genes, ${customRegions.length} BED regions`}
                </span>
              </div>
            </div>

            <button
              onClick={submit}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lsmc-accent px-6 py-3 text-sm font-medium text-white transition-all hover:bg-lsmc-accent-dim hover:shadow-lg hover:shadow-lsmc-accent/20"
            >
              Run Analysis
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-1 text-sm text-lsmc-mist transition-colors hover:text-lsmc-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
        {step < 3 && (
          <button
            onClick={nextStep}
            disabled={!canAdvance()}
            className="inline-flex items-center gap-1 rounded-lg bg-lsmc-accent/10 px-4 py-2 text-sm font-medium text-lsmc-accent transition-all hover:bg-lsmc-accent/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
