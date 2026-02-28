"use client";

import { PRODUCT_PRESETS, type ProductPreset } from "@/lib/config/presets";

interface PresetSelectorProps {
  selectedId: string | null;
  onSelect: (presetId: string) => void;
}

const PRESET_ICONS: Record<string, string> = {
  inflection_rwgs: "🧬",
  clinical_standard: "🏥",
  lowpass_genome: "📊",
  biobank: "🏦",
  "23andme_dtc": "🧪",
  custom: "⚙️",
};

export default function PresetSelector({ selectedId, onSelect }: PresetSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRODUCT_PRESETS.map((preset) => (
        <PresetCard
          key={preset.id}
          preset={preset}
          selected={selectedId === preset.id}
          onSelect={() => onSelect(preset.id)}
        />
      ))}
    </div>
  );
}

function PresetCard({
  preset,
  selected,
  onSelect,
}: {
  preset: ProductPreset;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-lg border p-3 text-left transition-all ${
        selected
          ? "border-lsmc-accent bg-lsmc-accent/10"
          : "border-lsmc-steel/40 bg-lsmc-surface hover:border-lsmc-steel"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-base">{PRESET_ICONS[preset.id] ?? "📋"}</span>
        <div className="min-w-0">
          <div
            className={`text-xs font-semibold leading-tight ${
              selected ? "text-lsmc-white" : "text-lsmc-ice"
            }`}
          >
            {preset.name}
          </div>
          <div className="mt-0.5 text-[10px] leading-tight text-lsmc-mist">
            {preset.shortRead.platform !== "both"
              ? `${preset.shortRead.platform} ${preset.shortRead.depth}`
              : `Multi-platform ${preset.shortRead.depth}`}
            {preset.longRead.platform !== "none" &&
              ` + ${preset.longRead.platform.toUpperCase()} ${preset.longRead.depth}`}
          </div>
        </div>
      </div>
    </button>
  );
}
