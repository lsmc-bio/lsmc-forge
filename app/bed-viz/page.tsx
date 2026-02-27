"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ---------------------------------------------------------------------------
// Synthetic gene data (200 clinical genes with metadata)
// ---------------------------------------------------------------------------

interface Gene {
  symbol: string;
  name: string;
  chr: string;
  start: number;
  end: number;
  exons: number;
  category: string;
}

const GENES: Gene[] = [
  { symbol: "BRCA1", name: "BRCA1 DNA Repair Associated", chr: "chr17", start: 43044295, end: 43170245, exons: 23, category: "cancer" },
  { symbol: "BRCA2", name: "BRCA2 DNA Repair Associated", chr: "chr13", start: 32315086, end: 32400266, exons: 27, category: "cancer" },
  { symbol: "TP53", name: "Tumor Protein P53", chr: "chr17", start: 7668402, end: 7687538, exons: 11, category: "cancer" },
  { symbol: "CFTR", name: "CF Transmembrane Conductance Regulator", chr: "chr7", start: 117120017, end: 117308719, exons: 27, category: "rare_disease" },
  { symbol: "DMD", name: "Dystrophin", chr: "chrX", start: 31119222, end: 33339609, exons: 79, category: "rare_disease" },
  { symbol: "EGFR", name: "Epidermal Growth Factor Receptor", chr: "chr7", start: 55019017, end: 55211628, exons: 28, category: "cancer" },
  { symbol: "KRAS", name: "KRAS Proto-Oncogene", chr: "chr12", start: 25204789, end: 25250936, exons: 6, category: "cancer" },
  { symbol: "MLH1", name: "MutL Homolog 1", chr: "chr3", start: 37034841, end: 37092337, exons: 19, category: "cancer" },
  { symbol: "MSH2", name: "MutS Homolog 2", chr: "chr2", start: 47403067, end: 47563564, exons: 16, category: "cancer" },
  { symbol: "APC", name: "APC Regulator of WNT Signaling", chr: "chr5", start: 112707498, end: 112846239, exons: 16, category: "cancer" },
  { symbol: "SCN5A", name: "Sodium Voltage-Gated Channel Alpha 5", chr: "chr3", start: 38589553, end: 38691164, exons: 28, category: "cardio" },
  { symbol: "KCNQ1", name: "Potassium Voltage-Gated Channel KQT-like 1", chr: "chr11", start: 2465914, end: 2870340, exons: 16, category: "cardio" },
  { symbol: "MYBPC3", name: "Myosin Binding Protein C3", chr: "chr11", start: 47331396, end: 47352699, exons: 35, category: "cardio" },
  { symbol: "MYH7", name: "Myosin Heavy Chain 7", chr: "chr14", start: 23412751, end: 23435453, exons: 40, category: "cardio" },
  { symbol: "LMNA", name: "Lamin A/C", chr: "chr1", start: 156084459, end: 156109880, exons: 12, category: "cardio" },
  { symbol: "PKD1", name: "Polycystin 1", chr: "chr16", start: 2138710, end: 2185899, exons: 46, category: "rare_disease" },
  { symbol: "PKD2", name: "Polycystin 2", chr: "chr4", start: 88928798, end: 88998929, exons: 15, category: "rare_disease" },
  { symbol: "FBN1", name: "Fibrillin 1", chr: "chr15", start: 48700503, end: 48938046, exons: 66, category: "rare_disease" },
  { symbol: "HTT", name: "Huntingtin", chr: "chr4", start: 3074681, end: 3243960, exons: 67, category: "rare_disease" },
  { symbol: "SMN1", name: "Survival of Motor Neuron 1", chr: "chr5", start: 70924941, end: 70953015, exons: 9, category: "nicu" },
  { symbol: "HEXA", name: "Hexosaminidase Subunit Alpha", chr: "chr15", start: 72346580, end: 72380325, exons: 14, category: "nicu" },
  { symbol: "CYP2D6", name: "Cytochrome P450 Family 2 D6", chr: "chr22", start: 42126499, end: 42130865, exons: 9, category: "pgx" },
  { symbol: "CYP2C19", name: "Cytochrome P450 Family 2 C19", chr: "chr10", start: 94762681, end: 94855547, exons: 9, category: "pgx" },
  { symbol: "DPYD", name: "Dihydropyrimidine Dehydrogenase", chr: "chr1", start: 97543299, end: 98386615, exons: 23, category: "pgx" },
  { symbol: "TPMT", name: "Thiopurine S-Methyltransferase", chr: "chr6", start: 18128542, end: 18155374, exons: 10, category: "pgx" },
  { symbol: "NF1", name: "Neurofibromin 1", chr: "chr17", start: 31094927, end: 31377677, exons: 58, category: "rare_disease" },
  { symbol: "TSC1", name: "TSC Complex Subunit 1", chr: "chr9", start: 132891348, end: 132945367, exons: 23, category: "rare_disease" },
  { symbol: "TSC2", name: "TSC Complex Subunit 2", chr: "chr16", start: 2086876, end: 2138713, exons: 42, category: "rare_disease" },
  { symbol: "RB1", name: "RB Transcriptional Corepressor 1", chr: "chr13", start: 48303751, end: 48481890, exons: 27, category: "cancer" },
  { symbol: "VHL", name: "Von Hippel-Lindau Tumor Suppressor", chr: "chr3", start: 10141610, end: 10153670, exons: 3, category: "cancer" },
  { symbol: "KCNH2", name: "Potassium Voltage-Gated Channel H2", chr: "chr7", start: 150642049, end: 150675403, exons: 15, category: "cardio" },
  { symbol: "RYR2", name: "Ryanodine Receptor 2", chr: "chr1", start: 237042131, end: 237833940, exons: 105, category: "cardio" },
  { symbol: "GBA", name: "Glucosylceramidase Beta", chr: "chr1", start: 155234452, end: 155244699, exons: 12, category: "nicu" },
  { symbol: "GAA", name: "Alpha Glucosidase", chr: "chr17", start: 80101535, end: 80119881, exons: 20, category: "nicu" },
  { symbol: "ABCA4", name: "ATP Binding Cassette A4", chr: "chr1", start: 94458394, end: 94586688, exons: 50, category: "rare_disease" },
  { symbol: "USH2A", name: "Usherin", chr: "chr1", start: 215622891, end: 216423448, exons: 72, category: "rare_disease" },
];

const PRESET_PANELS: { id: string; name: string; category: string; genes: string[]; description: string }[] = [
  { id: "cancer", name: "Cancer Hotspots", category: "cancer", genes: ["BRCA1", "BRCA2", "TP53", "EGFR", "KRAS", "MLH1", "MSH2", "APC", "RB1", "VHL"], description: "Key cancer susceptibility and somatic driver genes" },
  { id: "cardio", name: "Cardiac Panel", category: "cardio", genes: ["SCN5A", "KCNQ1", "MYBPC3", "MYH7", "LMNA", "KCNH2", "RYR2"], description: "Arrhythmia, cardiomyopathy, and inherited cardiac conditions" },
  { id: "rare_disease", name: "Rare Disease", category: "rare_disease", genes: ["CFTR", "DMD", "PKD1", "PKD2", "FBN1", "HTT", "NF1", "TSC1", "TSC2", "ABCA4", "USH2A"], description: "Common rare disease genes" },
  { id: "nicu", name: "NICU/NBS", category: "nicu", genes: ["SMN1", "HEXA", "GBA", "GAA", "CFTR", "DMD"], description: "Newborn screening and NICU rapid diagnostics" },
  { id: "pgx", name: "Pharmacogenomics", category: "pgx", genes: ["CYP2D6", "CYP2C19", "DPYD", "TPMT"], description: "Pharmacogenomic actionable genes" },
];

// Synthetic metric generator
function syntheticMetrics(gene: Gene, depth: number) {
  const seed = gene.symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };
  const meanDepth = depth * (0.92 + r(1) * 0.16);
  const above30 = Math.min(0.999, 0.96 + r(2) * 0.039);
  const snvF = 0.9960 + r(3) * 0.0039;
  const indelF = 0.9920 + r(4) * 0.0075;
  return { meanDepth, above30, snvF, indelF };
}

// ---------------------------------------------------------------------------
// Coverage Canvas Component
// ---------------------------------------------------------------------------

function CoverageCanvas({ gene, depth }: { gene: Gene; depth: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);

    // Draw depth threshold lines
    const maxDepth = depth * 2;
    const yFor = (d: number) => H - (d / maxDepth) * H;

    // Threshold lines
    [20, 30].forEach((thr) => {
      if (thr <= maxDepth) {
        const y = yFor(thr);
        ctx.strokeStyle = thr === 30 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = thr === 30 ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)";
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(`${thr}x`, 4, y - 3);
      }
    });

    // Generate synthetic coverage trace
    const points = 200;
    const seed = gene.symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const coverageData: number[] = [];
    for (let i = 0; i < points; i++) {
      const noise = Math.sin(seed + i * 0.3) * depth * 0.15 +
        Math.sin(seed + i * 0.07) * depth * 0.08 +
        (Math.random() - 0.5) * depth * 0.1;
      coverageData.push(Math.max(0, depth + noise));
    }

    // Draw coverage fill
    ctx.beginPath();
    ctx.moveTo(0, H);
    coverageData.forEach((d, i) => {
      const x = (i / (points - 1)) * W;
      ctx.lineTo(x, yFor(d));
    });
    ctx.lineTo(W, H);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.02)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw coverage line
    ctx.beginPath();
    coverageData.forEach((d, i) => {
      const x = (i / (points - 1)) * W;
      if (i === 0) ctx.moveTo(x, yFor(d));
      else ctx.lineTo(x, yFor(d));
    });
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Exon markers
    const exonWidth = W / (gene.exons + 2);
    for (let e = 0; e < gene.exons; e++) {
      const x = exonWidth * (e + 1);
      ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
      ctx.fillRect(x - 2, H - 6, 4, 6);
    }
  }, [gene, depth]);

  return (
    <canvas
      ref={canvasRef}
      className="h-40 w-full rounded-lg"
      style={{ imageRendering: "auto" }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main BED Viz Page
// ---------------------------------------------------------------------------

type Tab = "browse" | "build" | "score";

export default function BedViz() {
  const [tab, setTab] = useState<Tab>("browse");
  const [depth, setDepth] = useState(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGene, setSelectedGene] = useState<Gene | null>(null);
  const [panelGenes, setPanelGenes] = useState<Gene[]>([]);
  const [scoreResults, setScoreResults] = useState<Gene[] | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  const filteredGenes = searchQuery.length >= 1
    ? GENES.filter(
        (g) =>
          g.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ).slice(0, 8)
    : [];

  const addToPanel = useCallback(
    (gene: Gene) => {
      if (!panelGenes.find((g) => g.symbol === gene.symbol)) {
        setPanelGenes((prev) => [...prev, gene]);
      }
    },
    [panelGenes],
  );

  const loadPreset = useCallback(
    (preset: (typeof PRESET_PANELS)[0]) => {
      const genes = preset.genes
        .map((s) => GENES.find((g) => g.symbol === s))
        .filter(Boolean) as Gene[];
      setPanelGenes(genes);
    },
    [],
  );

  const runAnalysis = useCallback(() => {
    setTab("score");
    setScanning(true);
    setScanProgress(0);
    const genes = panelGenes.length > 0 ? panelGenes : GENES.slice(0, 10);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setScoreResults(genes);
        setScanning(false);
      }
      setScanProgress(Math.min(100, p));
    }, 120);
  }, [panelGenes]);

  // Aggregate score metrics
  const aggregateMetrics = scoreResults
    ? (() => {
        let totalSnv = 0, totalIndel = 0, totalCov = 0, totalCall = 0;
        scoreResults.forEach((g) => {
          const m = syntheticMetrics(g, depth);
          totalSnv += m.snvF;
          totalIndel += m.indelF;
          totalCov += m.above30;
          totalCall += m.meanDepth >= 20 ? 1 : 0;
        });
        const n = scoreResults.length;
        return {
          snv: totalSnv / n,
          indel: totalIndel / n,
          coverage: totalCov / n,
          callability: totalCall / n,
        };
      })()
    : null;

  return (
    <main className="flex min-h-screen flex-col bg-lsmc-night">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-lsmc-steel/30 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-lsmc-mist transition-colors hover:text-lsmc-white"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Forge
        </Link>
        <div className="h-4 w-px bg-lsmc-steel/40" />
        <div className="flex items-center gap-3">
          <Image
            src="/brand/lsmc-wordmark-logo-white.svg"
            alt="LSMC"
            width={100}
            height={24}
            className="opacity-80"
          />
          <span className="text-sm font-medium text-lsmc-white">
            Genome Performance Explorer
          </span>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-emerald-400">
          Customer-facing
        </span>
      </header>

      {/* Tab nav + Depth selector */}
      <div className="flex items-center gap-6 border-b border-lsmc-steel/30 px-6">
        <div className="flex">
          {(["browse", "build", "score"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "text-lsmc-white"
                  : "text-lsmc-steel hover:text-lsmc-mist"
              }`}
            >
              {t}
              {t === "build" && panelGenes.length > 0 && (
                <span className="ml-1.5 rounded-full bg-lsmc-accent/20 px-1.5 py-0.5 text-[10px] text-lsmc-glow">
                  {panelGenes.length}
                </span>
              )}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lsmc-accent" />
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-lsmc-steel">Depth:</span>
          {[15, 20, 30, 40].map((d) => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
                depth === d
                  ? "bg-lsmc-accent/15 text-lsmc-accent"
                  : "text-lsmc-steel hover:text-lsmc-mist"
              }`}
            >
              {d}x
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* ──────────── BROWSE TAB ──────────── */}
          {tab === "browse" && (
            <div>
              {/* Search */}
              <div className="relative mb-8">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a gene (e.g. BRCA1, TP53, CFTR...)"
                  className="w-full rounded-xl border border-lsmc-steel/50 bg-lsmc-surface px-4 py-3 pl-10 text-sm text-lsmc-white placeholder-lsmc-steel focus:border-lsmc-accent/50 focus:outline-none"
                />
                <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3.5 top-3.5 h-4 w-4 text-lsmc-steel">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                </svg>
                {filteredGenes.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-lsmc-steel/50 bg-lsmc-deep shadow-xl">
                    {filteredGenes.map((g) => (
                      <button
                        key={g.symbol}
                        onClick={() => {
                          setSelectedGene(g);
                          setSearchQuery("");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-lsmc-slate/40"
                      >
                        <span className="font-mono font-medium text-lsmc-accent">
                          {g.symbol}
                        </span>
                        <span className="truncate text-lsmc-mist">{g.name}</span>
                        <span className="ml-auto font-mono text-xs text-lsmc-steel">
                          {g.chr}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Gene detail or empty state */}
              {selectedGene ? (
                <div>
                  <div className="mb-4 flex items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-lsmc-white">
                        {selectedGene.symbol}
                      </h2>
                      <p className="text-sm text-lsmc-mist">{selectedGene.name}</p>
                    </div>
                    <span className="rounded-md bg-lsmc-slate/60 px-2.5 py-1 font-mono text-xs text-lsmc-mist">
                      {selectedGene.chr}:{selectedGene.start.toLocaleString()}-{selectedGene.end.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs text-lsmc-steel">
                      {selectedGene.exons} exons
                    </span>
                    <button
                      onClick={() => addToPanel(selectedGene)}
                      className="ml-auto rounded-lg bg-lsmc-accent/15 px-3 py-1.5 text-xs font-medium text-lsmc-accent transition-colors hover:bg-lsmc-accent/25"
                    >
                      + Add to Panel
                    </button>
                  </div>

                  {/* Coverage canvas */}
                  <div className="mb-4 rounded-xl border border-lsmc-steel/30 bg-lsmc-surface p-4">
                    <CoverageCanvas gene={selectedGene} depth={depth} />
                    <div className="mt-3 flex gap-4 text-[11px] text-lsmc-steel">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500/50" /> &ge; 30x
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500/50" /> 20-30x
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500/50" /> &lt; 20x
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-lsmc-accent" /> Exons
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  {(() => {
                    const m = syntheticMetrics(selectedGene, depth);
                    return (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-xl border border-lsmc-steel/30 bg-lsmc-surface p-4">
                          <p className="text-xs text-lsmc-steel">Mean Depth</p>
                          <p className="mt-1 font-mono text-lg font-semibold text-lsmc-white">
                            {m.meanDepth.toFixed(1)}x
                          </p>
                        </div>
                        <div className="rounded-xl border border-lsmc-steel/30 bg-lsmc-surface p-4">
                          <p className="text-xs text-lsmc-steel">&ge; 30x Bases</p>
                          <p className="mt-1 font-mono text-lg font-semibold text-emerald-400">
                            {(m.above30 * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="rounded-xl border border-lsmc-steel/30 bg-lsmc-surface p-4">
                          <p className="text-xs text-lsmc-steel">SNV F-score</p>
                          <p className="mt-1 font-mono text-lg font-semibold text-emerald-400">
                            {m.snvF.toFixed(4)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-lsmc-steel/30 bg-lsmc-surface p-4">
                          <p className="text-xs text-lsmc-steel">Indel F-score</p>
                          <p className="mt-1 font-mono text-lg font-semibold text-emerald-400">
                            {m.indelF.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                  <div className="mb-4 text-4xl opacity-30">&#x1F9EC;</div>
                  <p className="text-sm text-lsmc-mist">
                    Search for a gene to see its coverage profile
                  </p>
                  <p className="mt-2 text-xs text-lsmc-steel">
                    Try BRCA1, CFTR, or DMD
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ──────────── BUILD TAB ──────────── */}
          {tab === "build" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div>
                {/* Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Add gene to panel..."
                    className="w-full rounded-xl border border-lsmc-steel/50 bg-lsmc-surface px-4 py-3 pl-10 text-sm text-lsmc-white placeholder-lsmc-steel focus:border-lsmc-accent/50 focus:outline-none"
                  />
                  <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3.5 top-3.5 h-4 w-4 text-lsmc-steel">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                  </svg>
                  {filteredGenes.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-lsmc-steel/50 bg-lsmc-deep shadow-xl">
                      {filteredGenes.map((g) => (
                        <button
                          key={g.symbol}
                          onClick={() => {
                            addToPanel(g);
                            setSearchQuery("");
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-lsmc-slate/40"
                        >
                          <span className="font-mono font-medium text-lsmc-accent">
                            {g.symbol}
                          </span>
                          <span className="truncate text-lsmc-mist">{g.name}</span>
                          {panelGenes.find((p) => p.symbol === g.symbol) && (
                            <span className="ml-auto text-xs text-emerald-400">Added</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Panel genes */}
                <div className="rounded-xl border border-lsmc-steel/30 bg-lsmc-surface">
                  <div className="flex items-center justify-between border-b border-lsmc-steel/20 px-4 py-3">
                    <h3 className="text-sm font-medium text-lsmc-white">
                      Panel Genes
                    </h3>
                    {panelGenes.length > 0 && (
                      <button
                        onClick={() => setPanelGenes([])}
                        className="text-xs text-lsmc-steel transition-colors hover:text-red-400"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {panelGenes.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-lsmc-steel">
                      No genes added yet. Search above or choose a preset panel.
                    </p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {panelGenes.map((g) => (
                        <div
                          key={g.symbol}
                          className="flex items-center gap-3 border-b border-lsmc-steel/10 px-4 py-2.5"
                        >
                          <span className="font-mono text-sm font-medium text-lsmc-accent">
                            {g.symbol}
                          </span>
                          <span className="truncate text-xs text-lsmc-mist">
                            {g.name}
                          </span>
                          <span className="ml-auto font-mono text-[10px] text-lsmc-steel">
                            {g.chr}
                          </span>
                          <button
                            onClick={() =>
                              setPanelGenes((prev) =>
                                prev.filter((p) => p.symbol !== g.symbol),
                              )
                            }
                            className="text-lsmc-steel transition-colors hover:text-red-400"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-xl border border-lsmc-steel/30 bg-lsmc-surface p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-lsmc-steel">
                    Panel Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-mono text-lg font-semibold text-lsmc-white">
                        {panelGenes.length}
                      </p>
                      <p className="text-xs text-lsmc-steel">Genes</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-semibold text-lsmc-white">
                        {panelGenes
                          .reduce((a, g) => a + (g.end - g.start), 0)
                          .toLocaleString()}{" "}
                        <span className="text-xs font-normal text-lsmc-steel">bp</span>
                      </p>
                      <p className="text-xs text-lsmc-steel">Total Size</p>
                    </div>
                  </div>
                  <button
                    onClick={runAnalysis}
                    disabled={panelGenes.length === 0}
                    className="mt-4 w-full rounded-lg bg-lsmc-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-lsmc-accent-dim disabled:opacity-30"
                  >
                    Analyze Panel &rarr;
                  </button>
                </div>

                {/* Presets */}
                <div className="rounded-xl border border-lsmc-steel/30 bg-lsmc-surface p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-lsmc-steel">
                    Quick Load Presets
                  </h4>
                  <div className="space-y-2">
                    {PRESET_PANELS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => loadPreset(p)}
                        className="w-full rounded-lg border border-lsmc-steel/30 px-3 py-2.5 text-left transition-colors hover:border-lsmc-accent/30 hover:bg-lsmc-slate/30"
                      >
                        <p className="text-sm font-medium text-lsmc-ice">
                          {p.name}
                        </p>
                        <p className="mt-0.5 text-xs text-lsmc-steel">
                          {p.genes.length} genes &mdash; {p.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────── SCORE TAB ──────────── */}
          {tab === "score" && (
            <div>
              {!scoreResults && !scanning && (
                <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                  <p className="text-sm text-lsmc-mist">
                    Add genes in the Build tab, then click &quot;Analyze Panel&quot;
                  </p>
                  <p className="mt-2 text-xs text-lsmc-steel">
                    Or upload a BED file to score custom regions
                  </p>
                  <button
                    onClick={() => {
                      if (panelGenes.length === 0) {
                        loadPreset(PRESET_PANELS[0]);
                      }
                      runAnalysis();
                    }}
                    className="mt-6 rounded-lg bg-lsmc-accent/15 px-4 py-2.5 text-sm font-medium text-lsmc-accent transition-colors hover:bg-lsmc-accent/25"
                  >
                    Quick demo with Cancer Hotspots
                  </button>
                </div>
              )}

              {/* Scan progress */}
              {scanning && (
                <div className="flex min-h-[30vh] flex-col items-center justify-center">
                  <div className="mb-4 h-1.5 w-64 overflow-hidden rounded-full bg-lsmc-slate/60">
                    <div
                      className="h-full rounded-full bg-lsmc-accent transition-all duration-200"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-lsmc-mist">
                    Scanning {panelGenes.length || 10} gene regions...
                  </p>
                </div>
              )}

              {/* Results */}
              {scoreResults && aggregateMetrics && (
                <div>
                  {/* Summary cards */}
                  <div className="mb-8 grid grid-cols-4 gap-3">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <p className="text-xs text-lsmc-steel">SNV F-score</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                        {aggregateMetrics.snv.toFixed(4)}
                      </p>
                      <p className="mt-1 text-[10px] text-lsmc-steel">
                        Threshold: &ge; 0.995
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <p className="text-xs text-lsmc-steel">Indel F-score</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                        {aggregateMetrics.indel.toFixed(4)}
                      </p>
                      <p className="mt-1 text-[10px] text-lsmc-steel">
                        Threshold: &ge; 0.990
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <p className="text-xs text-lsmc-steel">&ge; 30x Coverage</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                        {(aggregateMetrics.coverage * 100).toFixed(1)}%
                      </p>
                      <p className="mt-1 text-[10px] text-lsmc-steel">
                        Fraction of bases
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <p className="text-xs text-lsmc-steel">Callability</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                        {(aggregateMetrics.callability * 100).toFixed(0)}%
                      </p>
                      <p className="mt-1 text-[10px] text-lsmc-steel">
                        Regions callable
                      </p>
                    </div>
                  </div>

                  {/* Per-gene table */}
                  <div className="rounded-xl border border-lsmc-steel/30 bg-lsmc-surface">
                    <div className="border-b border-lsmc-steel/20 px-4 py-3">
                      <h3 className="text-sm font-medium text-lsmc-white">
                        Per-Gene Results
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-lsmc-steel/20 text-xs text-lsmc-steel">
                            <th className="px-4 py-2.5 text-left font-medium">Gene</th>
                            <th className="px-4 py-2.5 text-left font-medium">Chr</th>
                            <th className="px-4 py-2.5 text-right font-medium">Mean Depth</th>
                            <th className="px-4 py-2.5 text-right font-medium">&ge; 30x</th>
                            <th className="px-4 py-2.5 text-right font-medium">SNV F</th>
                            <th className="px-4 py-2.5 text-right font-medium">Indel F</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scoreResults.map((g) => {
                            const m = syntheticMetrics(g, depth);
                            return (
                              <tr
                                key={g.symbol}
                                className="border-b border-lsmc-steel/10 transition-colors hover:bg-lsmc-slate/20"
                              >
                                <td className="px-4 py-2.5">
                                  <span className="font-mono font-medium text-lsmc-accent">
                                    {g.symbol}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 font-mono text-xs text-lsmc-steel">
                                  {g.chr}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-lsmc-ice">
                                  {m.meanDepth.toFixed(1)}x
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-emerald-400">
                                  {(m.above30 * 100).toFixed(1)}%
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-emerald-400">
                                  {m.snvF.toFixed(4)}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-emerald-400">
                                  {m.indelF.toFixed(4)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Synthetic data notice */}
                  <p className="mt-6 text-center text-xs text-lsmc-steel">
                    Data shown is synthetic for demonstration. Production version will pull real benchmarking metrics from LSMC&apos;s GIAB/HG002 validation data via the Daylily pipeline.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      {scoreResults && (
        <div className="border-t border-lsmc-steel/30 bg-lsmc-deep px-6 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <p className="text-sm text-lsmc-mist">
              <span className="font-medium text-lsmc-white">Ready for a detailed report?</span>{" "}
              Get TAT options, volume pricing, and a full performance certificate.
            </p>
            <Link
              href="/deal-agent"
              className="rounded-lg bg-lsmc-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lsmc-accent-dim"
            >
              Talk to our team &rarr;
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
