"use client";

import { useState } from "react";
import type { DealConfig } from "@/lib/config/dimensions";
import {
  CUSTOMER_TYPE_LABELS,
  ENGAGEMENT_MODEL_LABELS,
  REGULATORY_LABELS,
  TAT_DEFAULTS,
  type CustomerType,
  type EngagementModel,
  type RegulatoryLevel,
} from "@/lib/config/dimensions";
import type { DealAction } from "@/lib/config/deal-state";

interface ConfigFormProps {
  config: DealConfig;
  dispatch: React.Dispatch<DealAction>;
}

export default function ConfigForm({ config, dispatch }: ConfigFormProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-1">
      {/* Customer Type */}
      <AccordionSection
        id="customer"
        title="Customer Type"
        summary={
          config.customerType
            ? CUSTOMER_TYPE_LABELS[config.customerType]
            : "Not set"
        }
        open={openSection === "customer"}
        onToggle={() => toggle("customer")}
      >
        <SelectGrid
          options={Object.entries(CUSTOMER_TYPE_LABELS).map(([k, v]) => ({
            id: k,
            label: v,
          }))}
          selected={config.customerType}
          onSelect={(v) =>
            dispatch({ type: "SET_CUSTOMER_TYPE", value: v as CustomerType })
          }
        />
      </AccordionSection>

      {/* Engagement Model */}
      <AccordionSection
        id="engagement"
        title="Engagement Model"
        summary={
          config.engagementModel
            ? ENGAGEMENT_MODEL_LABELS[config.engagementModel]
            : "Not set"
        }
        open={openSection === "engagement"}
        onToggle={() => toggle("engagement")}
      >
        <SelectGrid
          options={Object.entries(ENGAGEMENT_MODEL_LABELS).map(([k, v]) => ({
            id: k,
            label: v,
          }))}
          selected={config.engagementModel}
          onSelect={(v) =>
            dispatch({
              type: "SET_ENGAGEMENT_MODEL",
              value: v as EngagementModel,
            })
          }
        />
      </AccordionSection>

      {/* Test Configuration */}
      <AccordionSection
        id="test"
        title="Test Configuration"
        summary={
          config.testConfiguration
            ? `${config.testConfiguration.shortReadPlatform} ${config.testConfiguration.shortReadDepth}${config.testConfiguration.longReadPlatform !== "none" ? ` + ONT ${config.testConfiguration.longReadDepth}` : ""}`
            : "Not set"
        }
        open={openSection === "test"}
        onToggle={() => toggle("test")}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="SR Platform"
              value={config.testConfiguration?.shortReadPlatform ?? "ultima"}
              options={[
                { value: "illumina", label: "Illumina" },
                { value: "ultima", label: "Ultima" },
                { value: "both", label: "Both" },
                { value: "none", label: "None" },
              ]}
              onChange={(v) =>
                dispatch({
                  type: "SET_TEST_CONFIG",
                  updates: {
                    shortReadPlatform: v as "illumina" | "ultima" | "both" | "none",
                  },
                })
              }
            />
            <SelectField
              label="SR Depth"
              value={config.testConfiguration?.shortReadDepth ?? "30x"}
              options={[
                { value: "0.5x", label: "0.5x" },
                { value: "1x", label: "1x" },
                { value: "1.5x", label: "1.5x" },
                { value: "5x", label: "5x" },
                { value: "15x", label: "15x" },
                { value: "20x", label: "20x" },
                { value: "30x", label: "30x" },
                { value: "40x", label: "40x" },
              ]}
              onChange={(v) =>
                dispatch({
                  type: "SET_TEST_CONFIG",
                  updates: {
                    shortReadDepth: v as "0.5x" | "1x" | "1.5x" | "5x" | "15x" | "20x" | "30x" | "40x",
                  },
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="LR Platform"
              value={config.testConfiguration?.longReadPlatform ?? "none"}
              options={[
                { value: "ont", label: "ONT" },
                { value: "none", label: "None" },
              ]}
              onChange={(v) =>
                dispatch({
                  type: "SET_TEST_CONFIG",
                  updates: { longReadPlatform: v as "ont" | "none" },
                })
              }
            />
            <SelectField
              label="LR Depth"
              value={config.testConfiguration?.longReadDepth ?? "none"}
              options={[
                { value: "5x", label: "5x" },
                { value: "10x", label: "10x" },
                { value: "15x", label: "15x" },
                { value: "none", label: "None" },
              ]}
              onChange={(v) =>
                dispatch({
                  type: "SET_TEST_CONFIG",
                  updates: { longReadDepth: v as "5x" | "10x" | "15x" | "none" },
                })
              }
            />
          </div>
          <SelectField
            label="Assay Type"
            value={config.testConfiguration?.assayType ?? "wgs"}
            options={[
              { value: "wgs", label: "Whole Genome" },
              { value: "wes", label: "Whole Exome" },
              { value: "panel", label: "Panel" },
              { value: "lowpass", label: "Low-Pass" },
            ]}
            onChange={(v) =>
              dispatch({
                type: "SET_TEST_CONFIG",
                updates: { assayType: v as "wgs" | "wes" | "panel" | "lowpass" },
              })
            }
          />
        </div>
      </AccordionSection>

      {/* Sample Characteristics */}
      <AccordionSection
        id="sample"
        title="Sample Specs"
        summary={
          config.sampleCharacteristics
            ? `${config.sampleCharacteristics.sampleType.replace("_", " ")} · ${config.sampleCharacteristics.extractionNeeded ? "ext." : "no ext."}`
            : "Not set"
        }
        open={openSection === "sample"}
        onToggle={() => toggle("sample")}
      >
        <div className="space-y-3">
          <SelectField
            label="Sample Type"
            value={config.sampleCharacteristics?.sampleType ?? "blood_edta"}
            options={[
              { value: "blood_edta", label: "Blood (EDTA)" },
              { value: "saliva", label: "Saliva" },
              { value: "dbs", label: "Dried Blood Spot" },
              { value: "tissue", label: "Tissue" },
              { value: "other", label: "Other" },
            ]}
            onChange={(v) =>
              dispatch({
                type: "SET_SAMPLE",
                updates: {
                  sampleType: v as "blood_edta" | "saliva" | "dbs" | "tissue" | "other",
                },
              })
            }
          />
          <SelectField
            label="Volume Range"
            value={config.sampleCharacteristics?.volumeRange ?? "100_1000"}
            options={[
              { value: "1_10", label: "1-10" },
              { value: "10_100", label: "10-100" },
              { value: "100_1000", label: "100-1,000" },
              { value: "1000_plus", label: "1,000+" },
            ]}
            onChange={(v) =>
              dispatch({
                type: "SET_SAMPLE",
                updates: {
                  volumeRange: v as "1_10" | "10_100" | "100_1000" | "1000_plus",
                },
              })
            }
          />
          <div className="flex gap-4">
            <Toggle
              label="Extraction needed"
              checked={config.sampleCharacteristics?.extractionNeeded ?? true}
              onChange={(v) =>
                dispatch({ type: "SET_SAMPLE", updates: { extractionNeeded: v } })
              }
            />
            <Toggle
              label="Kits provided"
              checked={config.sampleCharacteristics?.kitsProvided ?? false}
              onChange={(v) =>
                dispatch({ type: "SET_SAMPLE", updates: { kitsProvided: v } })
              }
            />
          </div>
        </div>
      </AccordionSection>

      {/* Deliverables */}
      <AccordionSection
        id="deliverables"
        title="Deliverables"
        summary={summarizeDeliverables(config.deliverables)}
        open={openSection === "deliverables"}
        onToggle={() => toggle("deliverables")}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {(
            [
              ["fastq", "FASTQ"],
              ["bam_cram", "BAM/CRAM"],
              ["vcf", "VCF"],
              ["clinical_report", "Clinical Report"],
              ["interpretation", "Interpretation"],
              ["research_summary", "Research Summary"],
            ] as const
          ).map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={config.deliverables?.[key] ?? false}
              onChange={(v) =>
                dispatch({ type: "SET_DELIVERABLES", updates: { [key]: v } })
              }
            />
          ))}
        </div>
      </AccordionSection>

      {/* Regulatory Level */}
      <AccordionSection
        id="regulatory"
        title="Regulatory"
        summary={
          config.regulatoryLevel
            ? REGULATORY_LABELS[config.regulatoryLevel]
            : "Not set"
        }
        open={openSection === "regulatory"}
        onToggle={() => toggle("regulatory")}
      >
        <SelectGrid
          options={Object.entries(REGULATORY_LABELS).map(([k, v]) => ({
            id: k,
            label: v,
          }))}
          selected={config.regulatoryLevel}
          onSelect={(v) =>
            dispatch({ type: "SET_REGULATORY", value: v as RegulatoryLevel })
          }
        />
      </AccordionSection>

      {/* Logistics */}
      <AccordionSection
        id="logistics"
        title="Logistics"
        summary={summarizeLogistics(config.logistics)}
        open={openSection === "logistics"}
        onToggle={() => toggle("logistics")}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {(
            [
              ["kitShipping", "Kit Shipping"],
              ["sampleTracking", "Sample Tracking"],
              ["chainOfCustody", "Chain of Custody"],
              ["international", "International"],
            ] as const
          ).map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={config.logistics?.[key] ?? false}
              onChange={(v) =>
                dispatch({ type: "SET_LOGISTICS", updates: { [key]: v } })
              }
            />
          ))}
        </div>
      </AccordionSection>

      {/* TAT */}
      <AccordionSection
        id="tat"
        title="Turnaround Time"
        summary={
          config.tat
            ? TAT_DEFAULTS[config.tat.tier]?.label ?? config.tat.tier
            : "Not set"
        }
        open={openSection === "tat"}
        onToggle={() => toggle("tat")}
      >
        <SelectGrid
          options={Object.entries(TAT_DEFAULTS).map(([k, v]) => ({
            id: k,
            label: `${v.label} (${v.days})`,
          }))}
          selected={config.tat?.tier ?? null}
          onSelect={(v) =>
            dispatch({
              type: "SET_TAT",
              updates: { tier: v as "standard" | "expedited" | "stat" },
            })
          }
        />
      </AccordionSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function AccordionSection({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-lsmc-steel/30 bg-lsmc-surface/50">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2"
      >
        <div className="flex items-center gap-2 text-left">
          <span className="text-xs font-medium text-lsmc-ice">{title}</span>
          {!open && (
            <span className="text-[10px] text-lsmc-mist">{summary}</span>
          )}
        </div>
        <svg
          className={`h-3.5 w-3.5 text-lsmc-steel transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-lsmc-steel/20 px-3 py-3">{children}</div>}
    </div>
  );
}

function SelectGrid({
  options,
  selected,
  onSelect,
}: {
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`rounded-md border px-2.5 py-1.5 text-left text-[11px] transition-all ${
            selected === opt.id
              ? "border-lsmc-accent bg-lsmc-accent/10 text-lsmc-white"
              : "border-lsmc-steel/30 text-lsmc-mist hover:border-lsmc-steel hover:text-lsmc-ice"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-lsmc-mist">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-lsmc-steel/40 bg-lsmc-surface px-2.5 py-1.5 text-xs text-lsmc-ice focus:border-lsmc-accent focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-7 rounded-full transition-colors ${
          checked ? "bg-lsmc-accent" : "bg-lsmc-steel/50"
        }`}
      >
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
            checked ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className="text-[11px] text-lsmc-mist">{label}</span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Summary helpers
// ---------------------------------------------------------------------------

function summarizeDeliverables(
  del: DealConfig["deliverables"],
): string {
  if (!del) return "Not set";
  const items: string[] = [];
  if (del.fastq) items.push("FASTQ");
  if (del.bam_cram) items.push("BAM");
  if (del.vcf) items.push("VCF");
  if (del.clinical_report) items.push("Report");
  if (del.interpretation) items.push("Interp.");
  if (del.research_summary) items.push("Summary");
  return items.length > 0 ? items.join(", ") : "None";
}

function summarizeLogistics(
  log: DealConfig["logistics"],
): string {
  if (!log) return "Not set";
  const items: string[] = [];
  if (log.kitShipping) items.push("Kits");
  if (log.sampleTracking) items.push("Tracking");
  if (log.chainOfCustody) items.push("CoC");
  if (log.international) items.push("Int'l");
  return items.length > 0 ? items.join(", ") : "None";
}
