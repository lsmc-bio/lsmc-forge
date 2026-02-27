"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { GENE_DB, type Gene } from "../_lib/genome-data";
import {
  synthMetrics,
  generateExons,
  generateCoverageData,
  classLabel,
  scoreColor,
  fmtSize,
  type Exon,
  type CoveragePoint,
} from "../_lib/analysis";
import GeneSearch from "../_components/gene-search";

const DEFAULT_DEPTH = 30;

export default function BrowseGenes() {
  const [selected, setSelected] = useState<Gene | null>(null);
  const [depth] = useState(DEFAULT_DEPTH);

  const metrics = useMemo(
    () =>
      selected ? synthMetrics({ symbol: selected.symbol }, depth) : null,
    [selected, depth],
  );

  const exons = useMemo(
    () => (selected ? generateExons(selected) : []),
    [selected],
  );

  const coverage = useMemo(
    () =>
      selected ? generateCoverageData(selected, exons, depth) : null,
    [selected, exons, depth],
  );

  return (
    <div className="min-h-screen bg-lsmc-night">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-lsmc-steel/30 bg-lsmc-night/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Image
                src="/brand/lsmc-wordmark-logo-white.svg"
                alt="LSMC"
                width={100}
                height={22}
                priority
              />
            </Link>
            <div className="h-4 w-px bg-lsmc-steel/40" />
            <span className="text-sm font-medium text-lsmc-mist">
              Gene Browser
            </span>
          </div>
          <Link
            href="/genome-explorer"
            className="rounded-lg px-3 py-1.5 text-xs text-lsmc-steel transition-colors hover:text-lsmc-mist"
          >
            Back to Explorer
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar — search + gene list */}
          <aside className="space-y-4">
            <GeneSearch onSelect={setSelected} autoFocus />

            <div className="max-h-[calc(100vh-220px)] overflow-auto rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80">
              {GENE_DB.map((gene) => {
                const m = synthMetrics({ symbol: gene.symbol }, depth);
                const sc = scoreColor(m.snv_fscore, 0.99, 0.98);
                const isActive = selected?.symbol === gene.symbol;
                return (
                  <button
                    key={gene.symbol}
                    onClick={() => setSelected(gene)}
                    className={`flex w-full items-center justify-between border-b border-lsmc-steel/20 px-4 py-2.5 text-left text-sm transition-colors last:border-0 ${
                      isActive
                        ? "bg-lsmc-accent/10 text-lsmc-white"
                        : "text-lsmc-ice hover:bg-lsmc-deep"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-medium">{gene.symbol}</span>
                      <span className="ml-2 truncate text-xs text-lsmc-mist">
                        {gene.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${sc.dot}`}
                      />
                      <span className={`font-mono text-xs ${sc.text}`}>
                        {(m.snv_fscore * 100).toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main — gene detail */}
          <main>
            {!selected ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-lsmc-steel/40 text-sm text-lsmc-steel">
                Select a gene to view performance details
              </div>
            ) : (
              <div className="space-y-6">
                {/* Gene header */}
                <div>
                  <h2 className="text-2xl font-semibold text-lsmc-white">
                    {selected.symbol}
                  </h2>
                  <p className="mt-1 text-sm text-lsmc-mist">
                    {selected.name} &middot; {selected.chr}:
                    {selected.start.toLocaleString()}-
                    {selected.end.toLocaleString()} &middot;{" "}
                    {fmtSize(selected.end - selected.start)}
                  </p>
                </div>

                {/* Metrics cards */}
                {metrics && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: "SNV F-score",
                        val: metrics.snv_fscore,
                        fmt: (v: number) => (v * 100).toFixed(2) + "%",
                        g: 0.99,
                        y: 0.98,
                      },
                      {
                        label: "Indel F-score",
                        val: metrics.indel_fscore,
                        fmt: (v: number) => (v * 100).toFixed(2) + "%",
                        g: 0.985,
                        y: 0.97,
                      },
                      {
                        label: "Callable",
                        val: metrics.callable,
                        fmt: (v: number) => (v * 100).toFixed(1) + "%",
                        g: 0.99,
                        y: 0.97,
                      },
                      {
                        label: "Region Class",
                        val: 1,
                        fmt: () => classLabel(metrics.region_class),
                        g: 0.5,
                        y: 0,
                      },
                    ].map((card) => {
                      const sc = scoreColor(card.val, card.g, card.y);
                      return (
                        <div
                          key={card.label}
                          className="rounded-lg border border-lsmc-steel/40 bg-lsmc-surface/80 p-4"
                        >
                          <div className="text-xs text-lsmc-steel">
                            {card.label}
                          </div>
                          <div
                            className={`mt-1 font-mono text-lg font-semibold ${sc.text}`}
                          >
                            {card.fmt(card.val)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Coverage track */}
                {coverage && (
                  <CoverageTrack
                    gene={selected}
                    exons={exons}
                    coverage={coverage.data}
                    depth={depth}
                  />
                )}

                {/* Exon table */}
                <div className="rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80">
                  <div className="border-b border-lsmc-steel/30 px-4 py-3">
                    <h3 className="text-sm font-semibold text-lsmc-white">
                      Exons ({exons.length})
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-lsmc-surface text-lsmc-steel">
                        <tr>
                          <th className="px-4 py-2 font-medium">#</th>
                          <th className="px-4 py-2 font-medium">Start</th>
                          <th className="px-4 py-2 font-medium">End</th>
                          <th className="px-4 py-2 font-medium">Size</th>
                        </tr>
                      </thead>
                      <tbody className="text-lsmc-ice">
                        {exons.map((ex, i) => (
                          <tr
                            key={i}
                            className="border-t border-lsmc-steel/20"
                          >
                            <td className="px-4 py-2 text-lsmc-steel">
                              {i + 1}
                            </td>
                            <td className="px-4 py-2 font-mono">
                              {ex.start.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 font-mono">
                              {ex.end.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 font-mono">
                              {fmtSize(ex.end - ex.start)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ── Coverage track canvas ─────────────────────────────────────────────── */

function CoverageTrack({
  gene,
  exons,
  coverage,
  depth,
}: {
  gene: Gene;
  exons: Exon[];
  coverage: CoveragePoint[];
  depth: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    pos: number;
    depth: number;
  } | null>(null);

  const maxDepth = useMemo(
    () => Math.max(...coverage.map((c) => c.depth), depth * 1.5),
    [coverage, depth],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 16, bottom: 40, left: 50 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const geneLen = gene.end - gene.start;
    const toX = (pos: number) =>
      pad.left + ((pos - gene.start) / geneLen) * plotW;
    const toY = (d: number) => pad.top + plotH - (d / maxDepth) * plotH;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let d = 0; d <= maxDepth; d += Math.ceil(maxDepth / 5)) {
      const y = toY(d);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      ctx.fillStyle = "#475569";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(d.toFixed(0) + "x", pad.left - 6, y + 3);
    }

    // Depth threshold line
    ctx.strokeStyle = "#f59e0b50";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, toY(depth));
    ctx.lineTo(w - pad.right, toY(depth));
    ctx.stroke();
    ctx.setLineDash([]);

    // Coverage area
    ctx.beginPath();
    ctx.moveTo(toX(coverage[0].pos), toY(0));
    for (const pt of coverage) {
      ctx.lineTo(toX(pt.pos), toY(pt.depth));
    }
    ctx.lineTo(toX(coverage[coverage.length - 1].pos), toY(0));
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
    grad.addColorStop(0, "#3b82f640");
    grad.addColorStop(1, "#3b82f608");
    ctx.fillStyle = grad;
    ctx.fill();

    // Coverage line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < coverage.length; i++) {
      const x = toX(coverage[i].pos);
      const y = toY(coverage[i].depth);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Exon track (bottom bar)
    const exonY = h - pad.bottom + 8;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(pad.left, exonY, plotW, 12);
    ctx.fillStyle = "#2dd4bf80";
    for (const ex of exons) {
      const x1 = toX(ex.start);
      const x2 = toX(ex.end);
      ctx.fillRect(x1, exonY, Math.max(2, x2 - x1), 12);
    }

    // Exon label
    ctx.fillStyle = "#475569";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Exons", pad.left, exonY + 24);
  }, [gene, exons, coverage, depth, maxDepth]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || coverage.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pad = { left: 50, right: 16 };
      const plotW = rect.width - pad.left - pad.right;
      const frac = (x - pad.left) / plotW;

      if (frac < 0 || frac > 1) {
        setTooltip(null);
        return;
      }

      const pos = gene.start + frac * (gene.end - gene.start);
      let closest = coverage[0];
      let minDist = Infinity;
      for (const pt of coverage) {
        const d = Math.abs(pt.pos - pos);
        if (d < minDist) {
          minDist = d;
          closest = pt;
        }
      }

      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        pos: closest.pos,
        depth: closest.depth,
      });
    },
    [gene, coverage],
  );

  return (
    <div className="rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80 p-4">
      <h3 className="mb-3 text-sm font-semibold text-lsmc-white">
        Coverage Track
      </h3>
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          className="w-full cursor-crosshair"
        />
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border border-lsmc-steel/50 bg-lsmc-night/95 px-3 py-1.5 text-xs shadow-lg"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 40,
            }}
          >
            <span className="text-lsmc-steel">
              {gene.chr}:{tooltip.pos.toLocaleString()}
            </span>
            <br />
            <span className="font-mono text-lsmc-accent">
              {tooltip.depth.toFixed(1)}x
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
