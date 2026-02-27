// Analysis engine — synthetic metrics, coverage generation, chromosome data, utilities.
// Ported from shared.js and score.js. All functions are deterministic (seeded RNG).

import { type Gene, type BedRegion, GENE_DB } from "./genome-data";

// ── Chromosome data (hg38) ───────────────────────────────────────────────
export interface Chromosome {
  name: string;
  len: number;
}

export const CHROMOSOMES: Chromosome[] = [
  { name: "chr1", len: 248956422 },
  { name: "chr2", len: 242193529 },
  { name: "chr3", len: 198295559 },
  { name: "chr4", len: 190214555 },
  { name: "chr5", len: 181538259 },
  { name: "chr6", len: 170805979 },
  { name: "chr7", len: 159345973 },
  { name: "chr8", len: 145138636 },
  { name: "chr9", len: 138394717 },
  { name: "chr10", len: 133797422 },
  { name: "chr11", len: 135086622 },
  { name: "chr12", len: 133275309 },
  { name: "chr13", len: 114364328 },
  { name: "chr14", len: 107043718 },
  { name: "chr15", len: 101991189 },
  { name: "chr16", len: 90338345 },
  { name: "chr17", len: 83257441 },
  { name: "chr18", len: 80373285 },
  { name: "chr19", len: 58617616 },
  { name: "chr20", len: 64444167 },
  { name: "chr21", len: 46709983 },
  { name: "chr22", len: 50818468 },
  { name: "chrX", len: 156040895 },
  { name: "chrY", len: 57227415 },
];

// ── Region classes & synthetic metrics ───────────────────────────────────
export type RegionClass =
  | "easy"
  | "difficult"
  | "segdup"
  | "repeats"
  | "gc_extremes";

const REGION_CLASSES: RegionClass[] = [
  "easy",
  "easy",
  "easy",
  "easy",
  "difficult",
  "segdup",
  "repeats",
  "gc_extremes",
];

export interface Metrics {
  region_class: RegionClass;
  snv_fscore: number;
  indel_fscore: number;
  callable: number;
  depth: number;
}

export function synthMetrics(
  gene: { gene?: string; symbol?: string; name?: string },
  depth: number,
): Metrics {
  let seed = 0;
  const gn = gene.gene || gene.symbol || gene.name || "region";
  for (let i = 0; i < gn.length; i++) seed += gn.charCodeAt(i);
  seed += depth;

  const r = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const rc = REGION_CLASSES[seed % REGION_CLASSES.length];
  const depthBonus = Math.min((depth - 10) / 40, 1) * 0.015;
  const classPenalty =
    rc === "easy"
      ? 0
      : rc === "difficult"
        ? 0.015
        : rc === "segdup"
          ? 0.025
          : rc === "repeats"
            ? 0.03
            : 0.02;

  return {
    region_class: rc,
    snv_fscore: Math.min(
      0.9999,
      0.985 + depthBonus + r(1) * 0.012 - classPenalty,
    ),
    indel_fscore: Math.min(
      0.999,
      0.975 + depthBonus + r(2) * 0.015 - classPenalty * 1.5,
    ),
    callable: Math.min(
      0.999,
      0.975 + depthBonus * 0.8 + r(3) * 0.015 - classPenalty,
    ),
    depth: depth + (r(4) - 0.5) * 4,
  };
}

// ── Exon generator ───────────────────────────────────────────────────────
export interface Exon {
  start: number;
  end: number;
}

export function generateExons(gene: Gene): Exon[] {
  const geneLen = gene.end - gene.start;
  const seed = gene.start % 10000;
  const rng = (i: number) => {
    const x = Math.sin(seed + i * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };

  let nExons: number;
  if (geneLen < 5000) nExons = Math.max(1, Math.floor(2 + rng(0) * 3));
  else if (geneLen < 20000) nExons = Math.max(3, Math.floor(4 + rng(0) * 8));
  else if (geneLen < 100000)
    nExons = Math.max(5, Math.floor(8 + rng(0) * 15));
  else nExons = Math.max(10, Math.floor(15 + rng(0) * 30));

  const exons: Exon[] = [];
  const codingFraction = 0.02 + rng(1) * 0.08;
  const totalCoding = Math.floor(geneLen * codingFraction);
  const avgExonLen = Math.max(80, Math.floor(totalCoding / nExons));
  const spacing = geneLen / (nExons + 1);

  for (let i = 0; i < nExons; i++) {
    const center =
      gene.start + spacing * (i + 1) + (rng(i + 10) - 0.5) * spacing * 0.4;
    let exonLen = Math.max(
      50,
      Math.floor(avgExonLen * (0.5 + rng(i + 20) * 1.0)),
    );
    if (i === 0 || i === nExons - 1)
      exonLen = Math.floor(exonLen * (1.2 + rng(i + 30) * 0.5));
    const s = Math.max(gene.start, Math.floor(center - exonLen / 2));
    const e = Math.min(gene.end, s + exonLen);
    exons.push({ start: s, end: e });
  }

  exons.sort((a, b) => a.start - b.start);
  const merged: Exon[] = [exons[0]];
  for (let i = 1; i < exons.length; i++) {
    const prev = merged[merged.length - 1];
    if (exons[i].start <= prev.end + 100) {
      prev.end = Math.max(prev.end, exons[i].end);
    } else {
      merged.push(exons[i]);
    }
  }
  return merged;
}

// ── Coverage data generator ──────────────────────────────────────────────
export interface CoveragePoint {
  pos: number;
  depth: number;
}

export interface CoverageData {
  data: CoveragePoint[];
  windowSize: number;
}

export function generateCoverageData(
  gene: Gene,
  exons: Exon[],
  depth: number,
): CoverageData {
  const geneLen = gene.end - gene.start;
  const windowSize = Math.max(100, Math.floor(geneLen / 500));
  const nWindows = Math.ceil(geneLen / windowSize);
  const data: CoveragePoint[] = [];

  const seed = (gene.start % 10000) + depth;
  const rng = (i: number) => {
    const x = Math.sin(seed + i * 31.7) * 43758.5453;
    return x - Math.floor(x);
  };

  const isExonic = (pos: number) =>
    exons.some((ex) => pos >= ex.start && pos < ex.end);
  const gcWave = (i: number) =>
    Math.sin(i * 0.03) * 0.15 + Math.sin(i * 0.007) * 0.1;

  let prevDepth = depth;
  for (let i = 0; i < nWindows; i++) {
    const pos = gene.start + i * windowSize;
    let baseDepth = depth;
    if (isExonic(pos)) baseDepth *= 1.05 + rng(i * 3) * 0.05;
    baseDepth *= 1 + gcWave(i);

    const noise = (rng(i) - 0.5) * depth * 0.15;
    const walkNoise = (prevDepth - depth) * 0.3;
    let d = baseDepth + noise - walkNoise;
    if (rng(i * 7 + 3) < 0.03) d *= 0.2 + rng(i * 7 + 4) * 0.3;
    d = Math.max(0, d);
    prevDepth = d;
    data.push({ pos, depth: d });
  }

  data.push({ pos: gene.end, depth: data[data.length - 1].depth });
  return { data, windowSize };
}

// ── Whole genome region builder ──────────────────────────────────────────
export function buildWholeGenomeRegions(): BedRegion[] {
  const regions: BedRegion[] = [];

  for (const chr of CHROMOSOMES) {
    const nRegions = Math.max(3, Math.floor(chr.len / 15000000));
    for (let ri = 0; ri < nRegions; ri++) {
      const start = Math.floor((ri / nRegions) * chr.len * 0.95);
      const size = 50000 + Math.floor(Math.random() * 200000);
      regions.push({
        chr: chr.name,
        start,
        end: start + size,
        name: chr.name.replace("chr", "") + "p" + (ri + 1),
      });
    }
  }

  for (const g of GENE_DB) {
    regions.push({ chr: g.chr, start: g.start, end: g.end, name: g.symbol });
  }

  return regions;
}

// ── Summary calculation ──────────────────────────────────────────────────
export interface AnalysisSummary {
  totalBp: number;
  avgSnv: number;
  avgIndel: number;
  avgCallable: number;
  regionCount: number;
}

export function computeSummary(
  regions: BedRegion[],
  depth: number,
): AnalysisSummary {
  let totalBp = 0;
  let wSnv = 0;
  let wIndel = 0;
  let wCall = 0;

  for (const r of regions) {
    const size = r.end - r.start;
    const m = synthMetrics({ gene: r.name || "region" }, depth);
    totalBp += size;
    wSnv += m.snv_fscore * size;
    wIndel += m.indel_fscore * size;
    wCall += m.callable * size;
  }

  return {
    totalBp,
    avgSnv: totalBp > 0 ? wSnv / totalBp : 0,
    avgIndel: totalBp > 0 ? wIndel / totalBp : 0,
    avgCallable: totalBp > 0 ? wCall / totalBp : 0,
    regionCount: regions.length,
  };
}

// ── Stratification ───────────────────────────────────────────────────────
export interface StratClass {
  label: string;
  count: number;
  avgSnv: number;
  avgIndel: number;
}

export function computeStratification(
  regions: BedRegion[],
  depth: number,
): StratClass[] {
  const classMap: Record<string, string> = {
    easy: "High-Confidence",
    difficult: "Difficult",
    segdup: "Segmental Dups",
    repeats: "Tandem Repeats",
    gc_extremes: "GC Extremes",
  };

  const buckets: Record<string, { snv: number[]; indel: number[] }> = {
    "All Regions": { snv: [], indel: [] },
    "High-Confidence": { snv: [], indel: [] },
    Difficult: { snv: [], indel: [] },
    "Segmental Dups": { snv: [], indel: [] },
    "Tandem Repeats": { snv: [], indel: [] },
    "GC Extremes": { snv: [], indel: [] },
  };

  for (const r of regions) {
    const m = synthMetrics({ gene: r.name || "region" }, depth);
    buckets["All Regions"].snv.push(m.snv_fscore);
    buckets["All Regions"].indel.push(m.indel_fscore);
    const label = classMap[m.region_class] || "High-Confidence";
    buckets[label].snv.push(m.snv_fscore);
    buckets[label].indel.push(m.indel_fscore);
  }

  return Object.entries(buckets)
    .filter(([, v]) => v.snv.length > 0)
    .map(([label, v]) => ({
      label,
      count: v.snv.length,
      avgSnv: v.snv.reduce((a, b) => a + b, 0) / v.snv.length,
      avgIndel: v.indel.reduce((a, b) => a + b, 0) / v.indel.length,
    }));
}

// ── Chromosome-level aggregation ─────────────────────────────────────────
export interface ChromSummary {
  chr: string;
  regionCount: number;
  totalBp: number;
  avgSnv: number;
  avgIndel: number;
  avgCallable: number;
  avgDepth: number;
}

export function computeChromSummaries(
  regions: BedRegion[],
  depth: number,
): ChromSummary[] {
  const data: Record<
    string,
    {
      regions: number;
      totalBp: number;
      wSnv: number;
      wIndel: number;
      wCall: number;
      wDepth: number;
    }
  > = {};

  for (const chr of CHROMOSOMES) {
    data[chr.name] = {
      regions: 0,
      totalBp: 0,
      wSnv: 0,
      wIndel: 0,
      wCall: 0,
      wDepth: 0,
    };
  }

  for (const r of regions) {
    const m = synthMetrics({ gene: r.name || "region" }, depth);
    const size = r.end - r.start;
    const cd = data[r.chr];
    if (!cd) continue;
    cd.regions++;
    cd.totalBp += size;
    cd.wSnv += m.snv_fscore * size;
    cd.wIndel += m.indel_fscore * size;
    cd.wCall += m.callable * size;
    cd.wDepth += m.depth * size;
  }

  return CHROMOSOMES.map((chr) => {
    const cd = data[chr.name];
    return {
      chr: chr.name,
      regionCount: cd.regions,
      totalBp: cd.totalBp,
      avgSnv: cd.totalBp > 0 ? cd.wSnv / cd.totalBp : 0,
      avgIndel: cd.totalBp > 0 ? cd.wIndel / cd.totalBp : 0,
      avgCallable: cd.totalBp > 0 ? cd.wCall / cd.totalBp : 0,
      avgDepth: cd.totalBp > 0 ? cd.wDepth / cd.totalBp : 0,
    };
  });
}

// ── Utility functions ────────────────────────────────────────────────────
export function fmtSize(bp: number): string {
  return bp > 1e6
    ? (bp / 1e6).toFixed(1) + " Mb"
    : bp > 1e3
      ? (bp / 1e3).toFixed(1) + " kb"
      : bp + " bp";
}

export function classLabel(rc: string): string {
  switch (rc) {
    case "easy":
      return "High-confidence";
    case "difficult":
      return "Difficult";
    case "segdup":
      return "Seg. duplication";
    case "repeats":
      return "Tandem repeat";
    case "gc_extremes":
      return "GC extreme";
    default:
      return rc;
  }
}

export function scoreColor(value: number, green: number, yellow: number) {
  if (value >= green) return { dot: "bg-emerald-400", text: "text-emerald-400" };
  if (value >= yellow) return { dot: "bg-amber-400", text: "text-amber-400" };
  return { dot: "bg-red-400", text: "text-red-400" };
}
