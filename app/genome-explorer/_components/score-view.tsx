"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { type BedRegion } from "../_lib/genome-data";
import {
  CHROMOSOMES,
  synthMetrics,
  computeSummary,
  computeStratification,
  computeChromSummaries,
  fmtSize,
  classLabel,
  scoreColor,
} from "../_lib/analysis";

interface ScoreViewProps {
  regions: BedRegion[];
  depth: number;
  label: string;
  onBack: () => void;
}

const PAGE_SIZE = 20;
type TableView = "genes" | "chromosomes";

export default function ScoreView({
  regions,
  depth,
  label,
  onBack,
}: ScoreViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tablePage, setTablePage] = useState(0);
  const [tableView, setTableView] = useState<TableView>("genes");

  const summary = useMemo(
    () => computeSummary(regions, depth),
    [regions, depth],
  );
  const strat = useMemo(
    () => computeStratification(regions, depth),
    [regions, depth],
  );
  const chromSummaries = useMemo(
    () => computeChromSummaries(regions, depth),
    [regions, depth],
  );
  const regionMetrics = useMemo(
    () =>
      regions.map((r) => ({
        ...r,
        metrics: synthMetrics({ gene: r.name || "region" }, depth),
      })),
    [regions, depth],
  );

  // Draw chromosome ideogram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const maxLen = Math.max(...CHROMOSOMES.map((c) => c.len));
    const barH = 5;
    const gap = Math.floor((h - 20) / 24);
    const labelW = 40;
    const barW = w - labelW - 20;

    CHROMOSOMES.forEach((chr, i) => {
      const y = 10 + i * gap;
      const chrW = (chr.len / maxLen) * barW;

      // Label
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px 'DM Sans', system-ui";
      ctx.textAlign = "right";
      ctx.fillText(chr.name.replace("chr", ""), labelW - 8, y + barH / 2 + 3);

      // Background bar
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(labelW, y, chrW, barH, 2);
      ctx.fill();

      // Region overlays
      const chrRegions = regions.filter((r) => r.chr === chr.name);
      for (const r of chrRegions) {
        const m = synthMetrics({ gene: r.name || "region" }, depth);
        const x = labelW + (r.start / chr.len) * chrW;
        const rw = Math.max(2, ((r.end - r.start) / chr.len) * chrW);
        const color =
          m.snv_fscore >= 0.99
            ? "#34d399"
            : m.snv_fscore >= 0.98
              ? "#fbbf24"
              : "#f87171";
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x, y, rw, barH);
        ctx.globalAlpha = 1;
      }
    });
  }, [regions, depth]);

  const totalPages = Math.ceil(regionMetrics.length / PAGE_SIZE);
  const pageData = regionMetrics.slice(
    tablePage * PAGE_SIZE,
    (tablePage + 1) * PAGE_SIZE,
  );

  const exportCSV = useCallback(() => {
    const header =
      "Region,Chr,Start,End,Size,RegionClass,SNV_Fscore,Indel_Fscore,Callable,Depth\n";
    const rows = regionMetrics
      .map(
        (r) =>
          `${r.name || ""},${r.chr},${r.start},${r.end},${r.end - r.start},${r.metrics.region_class},${r.metrics.snv_fscore.toFixed(4)},${r.metrics.indel_fscore.toFixed(4)},${r.metrics.callable.toFixed(4)},${r.metrics.depth.toFixed(1)}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lsmc-genome-analysis-${label.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [regionMetrics, label]);

  const fc = (v: number) => (v * 100).toFixed(2) + "%";

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1 text-xs text-lsmc-mist transition-colors hover:text-lsmc-white"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            New Analysis
          </button>
          <h1 className="text-xl font-semibold text-lsmc-white">{label}</h1>
          <p className="mt-1 text-sm text-lsmc-mist">
            {summary.regionCount.toLocaleString()} regions &middot;{" "}
            {fmtSize(summary.totalBp)} &middot; {depth}x depth
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-lsmc-steel/50 bg-lsmc-surface px-3 py-2 text-xs text-lsmc-mist transition-colors hover:border-lsmc-steel hover:text-lsmc-ice"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-lsmc-steel/50 bg-lsmc-surface px-3 py-2 text-xs text-lsmc-mist transition-colors hover:border-lsmc-steel hover:text-lsmc-ice"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
              />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "SNV F-score",
            value: summary.avgSnv,
            fmt: fc,
            green: 0.99,
            yellow: 0.98,
          },
          {
            label: "Indel F-score",
            value: summary.avgIndel,
            fmt: fc,
            green: 0.98,
            yellow: 0.97,
          },
          {
            label: "Callable",
            value: summary.avgCallable,
            fmt: fc,
            green: 0.98,
            yellow: 0.97,
          },
          {
            label: "Mean Depth",
            value: depth,
            fmt: (v: number) => v.toFixed(1) + "x",
            green: 30,
            yellow: 20,
          },
        ].map((card) => {
          const color = scoreColor(card.value, card.green, card.yellow);
          return (
            <div
              key={card.label}
              className="rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80 p-5"
            >
              <div className="mb-1 text-xs text-lsmc-mist">{card.label}</div>
              <div className={`text-2xl font-semibold ${color.text}`}>
                {card.fmt(card.value)}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                <span className="text-[10px] text-lsmc-steel">
                  {card.value >= card.green
                    ? "Excellent"
                    : card.value >= card.yellow
                      ? "Good"
                      : "Below target"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Genome ideogram */}
      <div className="mb-8 rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80 p-5">
        <h3 className="mb-3 text-sm font-medium text-lsmc-ice">
          Genome Overview
        </h3>
        <canvas ref={canvasRef} className="h-[200px] w-full" />
        <div className="mt-2 flex items-center gap-4 text-[10px] text-lsmc-steel">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-sm bg-emerald-400" />
            F-score &ge; 99%
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-sm bg-amber-400" />
            F-score 98&ndash;99%
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-sm bg-red-400" />
            F-score &lt; 98%
          </div>
        </div>
      </div>

      {/* Stratification */}
      <div className="mb-8 rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80 p-5">
        <h3 className="mb-4 text-sm font-medium text-lsmc-ice">
          Performance by Region Class
        </h3>
        <div className="space-y-3">
          {strat.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <div className="w-28 shrink-0 text-xs text-lsmc-mist">
                {s.label}
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-lsmc-slate">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-lsmc-accent transition-all"
                    style={{ width: `${s.avgSnv * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-xs text-lsmc-ice">
                  {(s.avgSnv * 100).toFixed(2)}%
                </span>
              </div>
              <span className="w-10 text-right text-[10px] text-lsmc-steel">
                n={s.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80">
        <div className="flex items-center justify-between border-b border-lsmc-steel/30 px-5 py-3">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setTableView("genes");
                setTablePage(0);
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                tableView === "genes"
                  ? "bg-lsmc-accent/10 text-lsmc-accent"
                  : "text-lsmc-mist hover:text-lsmc-ice"
              }`}
            >
              Regions ({regions.length})
            </button>
            <button
              onClick={() => {
                setTableView("chromosomes");
                setTablePage(0);
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                tableView === "chromosomes"
                  ? "bg-lsmc-accent/10 text-lsmc-accent"
                  : "text-lsmc-mist hover:text-lsmc-ice"
              }`}
            >
              Chromosomes (24)
            </button>
          </div>
          {tableView === "genes" && totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs text-lsmc-mist">
              <button
                onClick={() => setTablePage((p) => Math.max(0, p - 1))}
                disabled={tablePage === 0}
                className="rounded px-2 py-1 transition-colors hover:text-lsmc-ice disabled:opacity-30"
              >
                Prev
              </button>
              <span>
                {tablePage + 1} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setTablePage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={tablePage >= totalPages - 1}
                className="rounded px-2 py-1 transition-colors hover:text-lsmc-ice disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {tableView === "genes" ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-lsmc-steel/30 text-left text-lsmc-mist">
                  <th className="px-5 py-2.5 font-medium">Region</th>
                  <th className="px-3 py-2.5 font-medium">Chr</th>
                  <th className="px-3 py-2.5 font-medium">Size</th>
                  <th className="px-3 py-2.5 font-medium">Class</th>
                  <th className="px-3 py-2.5 text-right font-medium">SNV F</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Indel F
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Callable
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">Depth</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((r, i) => {
                  const snvC = scoreColor(r.metrics.snv_fscore, 0.99, 0.98);
                  const indelC = scoreColor(r.metrics.indel_fscore, 0.98, 0.97);
                  return (
                    <tr
                      key={i}
                      className="border-b border-lsmc-steel/20 text-lsmc-ice hover:bg-lsmc-deep/50"
                    >
                      <td className="px-5 py-2 font-medium">
                        {r.name || `${r.chr}:${r.start}-${r.end}`}
                      </td>
                      <td className="px-3 py-2 text-lsmc-mist">{r.chr}</td>
                      <td className="px-3 py-2 text-lsmc-mist">
                        {fmtSize(r.end - r.start)}
                      </td>
                      <td className="px-3 py-2 text-lsmc-mist">
                        {classLabel(r.metrics.region_class)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono ${snvC.text}`}
                      >
                        {(r.metrics.snv_fscore * 100).toFixed(2)}%
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono ${indelC.text}`}
                      >
                        {(r.metrics.indel_fscore * 100).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {(r.metrics.callable * 100).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.metrics.depth.toFixed(1)}x
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-lsmc-steel/30 text-left text-lsmc-mist">
                  <th className="px-5 py-2.5 font-medium">Chromosome</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Regions
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Coverage
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">SNV F</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Indel F
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Callable
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">Depth</th>
                </tr>
              </thead>
              <tbody>
                {chromSummaries
                  .filter((c) => c.regionCount > 0)
                  .map((c) => {
                    const snvC = scoreColor(c.avgSnv, 0.99, 0.98);
                    const indelC = scoreColor(c.avgIndel, 0.98, 0.97);
                    return (
                      <tr
                        key={c.chr}
                        className="border-b border-lsmc-steel/20 text-lsmc-ice hover:bg-lsmc-deep/50"
                      >
                        <td className="px-5 py-2 font-medium">{c.chr}</td>
                        <td className="px-3 py-2 text-right text-lsmc-mist">
                          {c.regionCount}
                        </td>
                        <td className="px-3 py-2 text-right text-lsmc-mist">
                          {fmtSize(c.totalBp)}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-mono ${snvC.text}`}
                        >
                          {(c.avgSnv * 100).toFixed(2)}%
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-mono ${indelC.text}`}
                        >
                          {(c.avgIndel * 100).toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {(c.avgCallable * 100).toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {c.avgDepth.toFixed(1)}x
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
