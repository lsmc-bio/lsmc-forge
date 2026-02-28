"use client";

import type { DealAction } from "@/lib/config/deal-state";

interface DealMetadataProps {
  clientName: string;
  dealName: string;
  term: string;
  annualVolume: number;
  marginPct: number;
  batchSize: number;
  dispatch: React.Dispatch<DealAction>;
}

export default function DealMetadata({
  clientName,
  dealName,
  term,
  annualVolume,
  marginPct,
  batchSize,
  dispatch,
}: DealMetadataProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Client"
          value={clientName}
          placeholder="Company name"
          onChange={(v) => dispatch({ type: "SET_FIELD", field: "clientName", value: v })}
        />
        <Field
          label="Deal Name"
          value={dealName}
          placeholder="e.g., Pilot Phase 1"
          onChange={(v) => dispatch({ type: "SET_FIELD", field: "dealName", value: v })}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <NumberField
          label="Annual Volume"
          value={annualVolume}
          onChange={(v) => dispatch({ type: "SET_VOLUME", value: v })}
          min={1}
          step={100}
        />
        <NumberField
          label="Margin %"
          value={Math.round(marginPct * 100)}
          onChange={(v) => dispatch({ type: "SET_MARGIN", value: v / 100 })}
          min={0}
          max={80}
          step={5}
          suffix="%"
        />
        <NumberField
          label="Batch Size"
          value={batchSize}
          onChange={(v) => dispatch({ type: "SET_BATCH_SIZE", value: v })}
          min={1}
          max={384}
          step={48}
        />
      </div>
      <Field
        label="Term"
        value={term}
        placeholder="e.g., 12 months"
        onChange={(v) => dispatch({ type: "SET_FIELD", field: "term", value: v })}
      />
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-lsmc-mist">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-lsmc-steel/40 bg-lsmc-surface px-3 py-1.5 text-sm text-lsmc-ice placeholder:text-lsmc-steel focus:border-lsmc-accent focus:outline-none"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-lsmc-mist">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-md border border-lsmc-steel/40 bg-lsmc-surface px-3 py-1.5 text-sm text-lsmc-ice focus:border-lsmc-accent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-lsmc-steel">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
