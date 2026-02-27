"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

/* ────────────────────────────── DATA ────────────────────────────── */

interface StageData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  color: string; // tailwind accent
  ribbonLabel: string;
  description: string;
  stats: { value: string; label: string }[];
  techTitle: string;
  techItems: string[];
  limsTitle: string;
  limsEvents: { bold: string; rest: string; code?: string }[];
}

const STAGES: StageData[] = [
  {
    id: "stage-0",
    number: "01",
    title: "Kit Logistics",
    subtitle: "Collection & Shipping",
    color: "blue",
    ribbonLabel: "Kit Ship",
    description:
      "A white-label collection kit ships from the fulfillment vendor directly to the ordering site. Inside: a labeled specimen collection tube, biohazard bag, pre-paid return shipping label, and requisition form \u2014 all pre-barcoded to the order in Bloom before it leaves the warehouse.",
    stats: [
      { value: "Pre-barcoded", label: "Kit tracking" },
      { value: "Ambient", label: "Ship temp" },
      { value: "Pre-paid", label: "Return label" },
    ],
    techTitle: "Kit Contents & Specs",
    techItems: [
      "Specimen types: Blood, saliva, buccal swab, DBS (NBS)",
      "Volume: Specimen-type dependent",
      "Shipping: Ambient, Category B (UN3373)",
      "Return: Pre-paid carrier label",
      "Fulfillment: Third-party logistics vendor",
      "Labeling: 2D barcode + human-readable ID",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "Order Created",
        rest: "Requisition linked to patient + ordering provider. Sample ID",
        code: "LG-2026-00427",
      },
      {
        bold: "Kit Assembled",
        rest: "Barcode assigned to collection tube. Kit components scanned into lot record.",
      },
      {
        bold: "Kit Shipped",
        rest: "Tracking number captured. Workflow step \u2192",
        code: "in_progress",
      },
    ],
  },
  {
    id: "stage-1",
    number: "02",
    title: "Accessioning",
    subtitle: "Sample Intake & Verification",
    color: "cyan",
    ribbonLabel: "Accession",
    description:
      "The returned kit arrives at 365 Oyster Point. A lab tech scans the barcode \u2014 Bloom instantly pulls up the order, validates the requisition, checks specimen integrity, and timestamps receipt. The sample enters chain-of-custody. TAT clock is running.",
    stats: [
      { value: "Barcode scan", label: "Intake method" },
      { value: "Auto-validated", label: "Req check" },
      { value: "2\u20138\u00b0C", label: "Storage" },
    ],
    techTitle: "Accessioning Checks",
    techItems: [
      "Scan 2D barcode \u2192 Bloom links to order + requisition",
      "Specimen integrity: hemolysis check, volume \u2265200 \u00b5L, tube type correct",
      "Requisition completeness: patient demographics, ordering provider, ICD-10, indication",
      "Photo capture of tube label + requisition for permanent record",
      "If reject criteria met \u2192 flag for re-collection, notify ordering site",
      "Accepted samples aliquoted into deep-well plate for batch processing",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "Package Received",
        rest: "Inbound scan at loading dock. Status \u2192",
        code: "RECEIVED",
      },
      {
        bold: "Sample Accessioned",
        rest: "Barcode verified. Requisition validated. Accession workset \u2192",
        code: "complete",
      },
      {
        bold: "Plate Assignment",
        rest: "Sample mapped to deep-well plate position",
        code: "A07",
      },
      {
        bold: "TAT Checkpoint",
        rest: "Receipt timestamp logged. TAT timer validated against order priority tier.",
      },
    ],
  },
  {
    id: "stage-2",
    number: "03",
    title: "DNA Extraction",
    subtitle: "Isolating Genomic Material",
    color: "green",
    ribbonLabel: "Extraction",
    description:
      "A robotic liquid handler processes the 96-well plate using a magnetic-bead-based extraction protocol. DNA is isolated from the specimen, purified, and quantified. The entire batch moves through extraction in approximately two hours.",
    stats: [
      { value: "Robotic", label: "Handler" },
      { value: "Mag-bead", label: "Protocol" },
      { value: "96-well", label: "Batch size" },
      { value: "~2 hrs", label: "Duration" },
    ],
    techTitle: "Extraction Protocol",
    techItems: [
      "Automated liquid handler: KingFisher Apex (96 head)",
      "Magnetic bead-based purification (silica-coated paramagnetic beads)",
      "Lysis buffer + proteinase K digestion at 56\u00b0C",
      "Bind \u2192 Wash \u00d72 \u2192 Elute in 50 \u00b5L low-TE buffer",
      "Qubit quantification (dsDNA Broad Range assay)",
      "Target yield: \u2265500 ng gDNA, A260/280 = 1.7\u20131.9",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "Extraction Batch Created",
        rest: "Plate scanned onto KingFisher deck. Protocol auto-selected by specimen type.",
      },
      {
        bold: "Run Complete",
        rest: "96 samples extracted. Yield data uploaded from Qubit. Status \u2192",
        code: "extracted",
      },
      {
        bold: "QC Gate",
        rest: "Samples below 500 ng flagged for re-extraction or manual review.",
      },
    ],
  },
  {
    id: "stage-3",
    number: "04",
    title: "Library Preparation",
    subtitle: "Indexing & Fragmentation",
    color: "purple",
    ribbonLabel: "Library Prep",
    description:
      "Purified DNA is enzymatically fragmented and ligated with unique dual-index (UDI) adapters in a PCR-free workflow. Each sample gets a unique molecular barcode, enabling pooling and precise demultiplexing downstream. The library is ready for sequencing in about three hours.",
    stats: [
      { value: "PCR-free", label: "Workflow" },
      { value: "UDI", label: "Indexing" },
      { value: "Enzymatic", label: "Fragmentation" },
      { value: "~3 hrs", label: "Duration" },
    ],
    techTitle: "Library Prep Details",
    techItems: [
      "Enzymatic fragmentation (no mechanical shearing, less bias)",
      "Unique dual-index (UDI) adapters \u2014 eliminates index hopping",
      "PCR-free protocol preserves GC representation",
      "Target insert size: 350\u2013450 bp (platform-optimized)",
      "TapeStation QC: fragment distribution + adapter dimer check",
      "Normalized to equimolar concentration for pooling",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "Lib Prep Batch Created",
        rest: "Reagent lot numbers scanned. Index plate assigned.",
      },
      {
        bold: "Index Assignment",
        rest: "UDI pair",
        code: "UDI-0427A/B",
      },
      {
        bold: "Library QC",
        rest: "TapeStation trace uploaded. Fragment size distribution validated.",
      },
      {
        bold: "Pool Created",
        rest: "Libraries normalized and pooled. Pool EUID \u2192",
        code: "PL-2026-00087",
      },
    ],
  },
  {
    id: "stage-4",
    number: "05",
    title: "Sequencing",
    subtitle: "Generating Reads",
    color: "amber",
    ribbonLabel: "Sequencing",
    description:
      "The pooled library loads onto a flow cell or wafer. GQV-guided depth targeting ensures each genome gets exactly the coverage needed for clinical-grade results \u2014 not more, not less. Early FASTQ streaming begins as soon as the first base calls are ready.",
    stats: [
      { value: "GQV-guided", label: "Depth target" },
      { value: "Streaming", label: "FASTQ delivery" },
      { value: "~24 hrs", label: "Run time" },
    ],
    techTitle: "Sequencing Configuration",
    techItems: [
      "Multi-platform: Illumina NovaSeq X+, Ultima UG 100 (interchangeable for SR)",
      "Coverage: GQV-driven adaptive depth (typically 30\u00d7 clinical, adjustable)",
      "Read length: 2\u00d7150 bp (Illumina) or ~300 bp (Ultima native)",
      "On-instrument base calling with quality score recalibration",
      "Early FASTQ streaming: data flows to Daylily before run completes",
      "Run QC: cluster density, %PF, Q30 \u2265 85% monitored in real time",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "Run Created",
        rest: "Flow cell / wafer ID scanned. Pool loaded. Run parameters set.",
      },
      {
        bold: "Sequencing Started",
        rest: "Instrument status \u2192",
        code: "running",
      },
      {
        bold: "FASTQ Streaming",
        rest: "Early base calls streaming to Daylily cloud pipeline.",
      },
      {
        bold: "Run Complete",
        rest: "QC metrics captured. Demultiplexing initiated.",
      },
    ],
  },
  {
    id: "stage-5",
    number: "06",
    title: "Bioinformatics Pipeline",
    subtitle: "Daylily Cloud-Native Analysis",
    color: "amber",
    ribbonLabel: "Pipeline",
    description:
      "FASTQs stream into Daylily, LSMC's cloud-native bioinformatics engine. A 91-rule DAG (directed acyclic graph) orchestrates alignment, variant calling, quality scoring, and annotation. Multi-caller strategy ensures maximum sensitivity. Wall time: approximately 50 minutes per genome.",
    stats: [
      { value: "91-rule", label: "DAG" },
      { value: "~50 min", label: "Wall time" },
      { value: "Cloud-native", label: "Infrastructure" },
      { value: "Multi-caller", label: "Strategy" },
    ],
    techTitle: "Pipeline Architecture",
    techItems: [
      "Engine: Snakemake DAG on AWS Batch (spot + on-demand mix)",
      "Aligner: Sentieon BWA v202503.02 (hg38 + alt-aware)",
      "SNV/Indel: Sentieon DNAscope (DRAGEN-equivalent accuracy)",
      "SV callers: Manta + TIDDIT + SurVeyor (union call set)",
      "CNV: read-depth + B-allele frequency (clinical-grade for \u226550 kb)",
      "STR: ExpansionHunter + REViewer visualization",
      "Annotation: VEP + ClinVar + gnomAD + OMIM + SpliceAI",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "Pipeline Triggered",
        rest: "FASTQ manifest ingested. DAG execution begins.",
      },
      {
        bold: "Alignment Complete",
        rest: "BAM/CRAM generated. Coverage metrics calculated.",
      },
      {
        bold: "Variant Calling Complete",
        rest: "VCF files generated across all callers. Merge + dedup.",
      },
      {
        bold: "GQV Scoring",
        rest: "Five-axis quality vector computed. Status \u2192",
        code: "analysis_complete",
      },
    ],
  },
  {
    id: "stage-6",
    number: "07",
    title: "QC & Variant Analysis",
    subtitle: "Genome Quality Vector (GQV)",
    color: "rose",
    ribbonLabel: "QC & GQV",
    description:
      "Every genome passes through the GQV quality gate \u2014 a five-axis framework measuring Sensitivity, Specificity, Uniformity, Reproducibility, and Reportability. A clinical-grade genome must pass all five. GQV is platform-agnostic and depth-adaptive: quality is defined by analytical outcomes, not arbitrary coverage thresholds.",
    stats: [
      { value: "5-axis", label: "Quality gate" },
      { value: "Platform-agnostic", label: "Framework" },
      { value: "Depth-adaptive", label: "Approach" },
    ],
    techTitle: "GQV Five Axes",
    techItems: [
      "Sensitivity: SNV/Indel F1 vs truth set (Genome in a Bottle)",
      "Specificity: Ti/Tv ratio, het/hom balance, novel variant rate",
      "Uniformity: Coefficient of variation across clinically relevant regions",
      "Reproducibility: Concordance across replicate/control samples",
      "Reportability: % of clinically actionable genes with adequate coverage",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "GQV Computed",
        rest: "Five-axis score vector generated. Overall grade assigned.",
      },
      {
        bold: "QC Gate Decision",
        rest: "PASS / CONDITIONAL / FAIL logged per axis.",
      },
      {
        bold: "Variant Review Queue",
        rest: "Flagged variants enter clinical review workflow.",
      },
    ],
  },
  {
    id: "stage-7",
    number: "08",
    title: "Long-Read Reflex",
    subtitle: "Nanopore Adaptive Sequencing",
    color: "teal",
    ribbonLabel: "LR Reflex",
    description:
      "When short reads alone can\u2019t resolve a region \u2014 structural variants, repeat expansions, methylation signatures \u2014 the genome reflexes to nanopore long-read sequencing. Adaptive sampling enriches target regions in real time, no separate library prep required. Phased SVs and native methylation calls add layers short reads can\u2019t reach.",
    stats: [
      { value: "5\u201310\u00d7", label: "LR coverage" },
      { value: "Adaptive", label: "Sampling" },
      { value: "Native 5mC", label: "Methylation" },
      { value: "Phased SVs", label: "Resolution" },
    ],
    techTitle: "Long-Read Specifics",
    techItems: [
      "Platform: ONT PromethION 2 Solo (single flow cell)",
      "Adaptive sampling: real-time accept/reject based on target BED",
      "Native 5-methylcytosine detection (no bisulfite conversion)",
      "Phased structural variant calling with haplotype resolution",
      "Repeat expansion genotyping: FMR1, HTT, C9orf72, DMPK, ATXN family",
      "Complements SR data for comprehensive genome characterization",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "LR Reflex Triggered",
        rest: "Regions-of-interest BED file generated from SR analysis.",
      },
      {
        bold: "Flow Cell Loaded",
        rest: "Existing library loaded onto PromethION flow cell.",
      },
      {
        bold: "Adaptive Run Complete",
        rest: "Target regions enriched. Methylation + SV calls generated.",
      },
      {
        bold: "Data Merged",
        rest: "LR calls integrated into unified variant set. Status \u2192",
        code: "lr_complete",
      },
    ],
  },
  {
    id: "stage-8",
    number: "09",
    title: "Clinical Report",
    subtitle: "From Variants to Answers",
    color: "green",
    ribbonLabel: "Report",
    description:
      "Classified variants are assembled into a clinical genome report. For urgent cases, a preliminary positive report (PRELIM_POS) can issue within 72 hours. The full final report \u2014 complete with ACMG classification, gene-disease associations, and clinical interpretation \u2014 delivers within 144 hours.",
    stats: [
      { value: "\u226472 hrs", label: "PRELIM_POS" },
      { value: "\u2264144 hrs", label: "Final report" },
      { value: "ACMG", label: "Classification" },
    ],
    techTitle: "Report Components",
    techItems: [
      "ACMG/AMP 5-tier variant classification (Pathogenic \u2192 Benign)",
      "Gene-disease validity assessment (ClinGen framework)",
      "Pharmacogenomic star alleles (CPIC guidelines)",
      "Secondary findings per ACMG SF v3.2 (if consented)",
      "Structured PDF + HL7 FHIR integration for EHR delivery",
      "Board-certified clinical genomicist sign-out",
    ],
    limsTitle: "Bloom Events at This Stage",
    limsEvents: [
      {
        bold: "Report Drafted",
        rest: "Auto-generated from classified variant set + clinical template.",
      },
      {
        bold: "Clinical Sign-Out",
        rest: "Board-certified genomicist reviews and signs. Status \u2192",
        code: "signed",
      },
      {
        bold: "Report Delivered",
        rest: "PDF + FHIR bundle transmitted to ordering provider. TAT clock stops.",
      },
    ],
  },
];

const RIBBON_LABELS = STAGES.map((s) => s.ribbonLabel);

const FINAL_STATS = [
  { value: 9, label: "Stages" },
  { value: 91, label: "Pipeline Rules" },
  { value: 50, label: "Min Compute", suffix: " min" },
  { value: 132, label: "Hours to Report", suffix: " hrs" },
];

/* ────────────────────── COLOR HELPERS ────────────────────── */

function accentClasses(color: string) {
  const map: Record<string, { text: string; bg: string; border: string; dot: string }> = {
    blue: { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", dot: "bg-blue-400" },
    cyan: { text: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/30", dot: "bg-cyan-400" },
    green: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", dot: "bg-emerald-400" },
    purple: { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30", dot: "bg-purple-400" },
    amber: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", dot: "bg-amber-400" },
    rose: { text: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30", dot: "bg-rose-400" },
    teal: { text: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/30", dot: "bg-teal-400" },
  };
  return map[color] ?? map.blue;
}

/* ────────────────────── STAGE VISUALS (SVG) ────────────────────── */

function StageVisual({ stageIndex, color }: { stageIndex: number; color: string }) {
  const c = accentClasses(color);
  // Simplified abstract visuals per stage using CSS + SVG
  const visuals: Record<number, React.ReactNode> = {
    0: (
      // Kit logistics — shipping box
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        <defs>
          <linearGradient id="box0" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect x="30" y="40" width="140" height="100" rx="6" fill="url(#box0)" stroke="#334155" strokeWidth="1" className="animate-float" />
        <rect x="30" y="40" width="140" height="22" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <text x="100" y="55" textAnchor="middle" fill="#94a3b8" fontFamily="monospace" fontSize="6" letterSpacing="1.5">LSMC COLLECTION KIT</text>
        {/* Tube */}
        <rect x="55" y="75" width="14" height="40" rx="7" fill="#dc2626" opacity="0.8" />
        <rect x="52" y="72" width="20" height="8" rx="2" fill="#374151" />
        {/* Barcode */}
        <rect x="85" y="75" width="40" height="22" rx="2" fill="#f8fafc" />
        {[0, 4, 7, 10, 13, 17, 21, 24, 27, 31].map((x, i) => (
          <line key={i} x1={90 + x} y1={79} x2={90 + x} y2={91} stroke="#111827" strokeWidth={i % 3 === 0 ? 2 : 1} />
        ))}
        <text x="105" y="101" textAnchor="middle" fill="#374151" fontFamily="monospace" fontSize="4">LG-2026-00427</text>
        {/* Return label */}
        <rect x="85" y="107" width="40" height="18" rx="2" fill="#dbeafe" />
        <text x="105" y="118" textAnchor="middle" fill="#1e40af" fontSize="5" fontWeight="600">RETURN LABEL</text>
        {/* Biohazard */}
        <text x="150" y="98" textAnchor="middle" fill="#f59e0b" fontSize="16" opacity="0.5">{"\u2623"}</text>
        <text x="100" y="175" textAnchor="middle" fill="#64748b" fontFamily="monospace" fontSize="6">SHIPS TO SITE</text>
      </svg>
    ),
    1: (
      // Accessioning — scanner + tube
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        <rect x="20" y="145" width="160" height="6" rx="1" fill="#1e293b" />
        {/* Scanner */}
        <rect x="35" y="80" width="28" height="55" rx="4" fill="#374151" stroke="#4b5563" strokeWidth="0.5" transform="rotate(-12, 49, 107)" />
        {/* Scan beam */}
        <line x1="65" y1="95" x2="110" y2="82" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" strokeDasharray="3 3" className="animate-scan" />
        {/* Tube */}
        <rect x="105" y="80" width="12" height="38" rx="6" fill="#dc2626" opacity="0.8" />
        {/* Bloom screen */}
        <rect x="130" y="60" width="50" height="70" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
        <text x="155" y="78" textAnchor="middle" fill="#06b6d4" fontFamily="monospace" fontSize="5">BLOOM</text>
        <rect x="136" y="84" width="38" height="4" rx="1" fill="#06b6d4" opacity="0.3" />
        <rect x="136" y="92" width="28" height="4" rx="1" fill="#06b6d4" opacity="0.2" />
        <rect x="136" y="100" width="33" height="4" rx="1" fill="#10b981" opacity="0.3" />
        <circle cx="155" cy="118" r="5" fill="none" stroke="#10b981" strokeWidth="1" />
        <text x="155" y="120" textAnchor="middle" fill="#10b981" fontSize="6">{"\u2713"}</text>
      </svg>
    ),
    2: (
      // DNA Extraction — 96-well plate + magnetic beads
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        {/* Plate outline */}
        <rect x="25" y="50" width="150" height="100" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        {/* Wells grid */}
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 12 }, (_, c) => (
            <circle key={`${r}-${c}`} cx={38 + c * 12} cy={62 + r * 11} r="3.5" fill={r < 4 ? "#10b981" : "#1e293b"} opacity={r < 4 ? 0.3 + Math.random() * 0.4 : 0.5} stroke="#334155" strokeWidth="0.3" />
          ))
        )}
        {/* Magnetic beads animation dots */}
        {[{ cx: 60, cy: 75 }, { cx: 100, cy: 85 }, { cx: 140, cy: 70 }].map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r="2" fill="#10b981" className="animate-bead" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
        <text x="100" y="175" textAnchor="middle" fill="#64748b" fontFamily="monospace" fontSize="6">96-WELL EXTRACTION BATCH</text>
      </svg>
    ),
    3: (
      // Library Prep — enzyme + adapter ligation
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        {/* DNA strand */}
        <path d="M30 100 Q60 70, 90 100 Q120 130, 150 100 Q180 70, 200 100" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.5" />
        <path d="M30 108 Q60 78, 90 108 Q120 138, 150 108 Q180 78, 200 108" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.3" />
        {/* Scissors / enzyme */}
        <text x="90" y="85" fill="#c4b5fd" fontSize="18" className="animate-scissors">{"\u2702"}</text>
        {/* Adapter blocks */}
        <rect x="45" y="115" width="20" height="8" rx="2" fill="#8b5cf6" opacity="0.6" />
        <text x="55" y="121" textAnchor="middle" fill="#f8fafc" fontSize="4">UDI</text>
        <rect x="115" y="115" width="20" height="8" rx="2" fill="#8b5cf6" opacity="0.6" />
        <text x="125" y="121" textAnchor="middle" fill="#f8fafc" fontSize="4">UDI</text>
        {/* Fragment labels */}
        <text x="100" y="155" textAnchor="middle" fill="#64748b" fontFamily="monospace" fontSize="5">ENZYMATIC FRAGMENTATION + UDI LIGATION</text>
        <text x="100" y="168" textAnchor="middle" fill="#8b5cf6" fontFamily="monospace" fontSize="5" opacity="0.7">PCR-FREE WORKFLOW</text>
      </svg>
    ),
    4: (
      // Sequencing — flow cell lanes
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        <defs>
          <linearGradient id="fc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#292f3d" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        {/* Flow cell body */}
        <rect x="30" y="40" width="140" height="120" rx="6" fill="url(#fc)" stroke="#f59e0b" strokeWidth="1" opacity="0.8" />
        {/* Lanes */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <g key={i}>
            <rect x="40" y={50 + i * 13} width="120" height="8" rx="2" fill="#f59e0b" opacity={0.08 + i * 0.025} />
            <rect x="40" y={50 + i * 13} width={40 + Math.random() * 80} height="8" rx="2" fill="#f59e0b" opacity="0.15" className="animate-lane" style={{ animationDelay: `${i * 0.2}s` }} />
          </g>
        ))}
        <text x="100" y="175" textAnchor="middle" fill="#f59e0b" fontFamily="monospace" fontSize="5" opacity="0.7">GQV-GUIDED DEPTH TARGETING</text>
        <text x="100" y="188" textAnchor="middle" fill="#64748b" fontFamily="monospace" fontSize="5">EARLY FASTQ STREAMING</text>
      </svg>
    ),
    5: (
      // Pipeline — DAG nodes
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        {/* DAG nodes */}
        {[
          { x: 100, y: 25, label: "FASTQ", active: true },
          { x: 50, y: 65, label: "Align", active: true },
          { x: 150, y: 65, label: "QC", active: true },
          { x: 30, y: 110, label: "SNV", active: false },
          { x: 85, y: 110, label: "SV", active: false },
          { x: 140, y: 110, label: "CNV", active: false },
          { x: 170, y: 110, label: "STR", active: false },
          { x: 60, y: 155, label: "Merge", active: false },
          { x: 130, y: 155, label: "Annotate", active: false },
          { x: 100, y: 190, label: "VCF", active: false },
        ].map((node, i) => (
          <g key={i}>
            <rect x={node.x - 22} y={node.y - 10} width="44" height="20" rx="4" fill={node.active ? "#f59e0b" : "#1e293b"} stroke={node.active ? "#f59e0b" : "#334155"} strokeWidth="0.8" opacity={node.active ? 0.25 : 0.8} className={node.active ? "animate-dagpulse" : ""} style={{ animationDelay: `${i * 0.3}s` }} />
            <text x={node.x} y={node.y + 3} textAnchor="middle" fill={node.active ? "#fbbf24" : "#94a3b8"} fontSize="5" fontFamily="monospace">{node.label}</text>
          </g>
        ))}
        {/* Edges */}
        {[
          [100, 35, 50, 55], [100, 35, 150, 55],
          [50, 75, 30, 100], [50, 75, 85, 100], [150, 75, 140, 100], [150, 75, 170, 100],
          [30, 120, 60, 145], [85, 120, 60, 145], [140, 120, 130, 145], [170, 120, 130, 145],
          [60, 165, 100, 180], [130, 165, 100, 180],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="0.8" strokeDasharray="2 2" className="animate-dash" />
        ))}
      </svg>
    ),
    6: (
      // QC & GQV — radar chart
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        {/* Pentagon grid */}
        {[60, 40, 20].map((r, i) => {
          const pts = Array.from({ length: 5 }, (_, j) => {
            const angle = (j * 72 - 90) * (Math.PI / 180);
            return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
          }).join(" ");
          return <polygon key={i} points={pts} fill="none" stroke="#334155" strokeWidth="0.5" opacity={0.5 + i * 0.15} />;
        })}
        {/* Axis lines */}
        {Array.from({ length: 5 }, (_, j) => {
          const angle = (j * 72 - 90) * (Math.PI / 180);
          return <line key={j} x1="100" y1="100" x2={100 + 60 * Math.cos(angle)} y2={100 + 60 * Math.sin(angle)} stroke="#334155" strokeWidth="0.5" />;
        })}
        {/* Data polygon */}
        {(() => {
          const scores = [0.92, 0.88, 0.95, 0.90, 0.85];
          const pts = scores.map((s, j) => {
            const angle = (j * 72 - 90) * (Math.PI / 180);
            return `${100 + 60 * s * Math.cos(angle)},${100 + 60 * s * Math.sin(angle)}`;
          }).join(" ");
          return (
            <>
              <polygon points={pts} fill="#f43f5e" fillOpacity="0.12" stroke="#f43f5e" strokeWidth="1.5" className="animate-radardraw" />
              {scores.map((s, j) => {
                const angle = (j * 72 - 90) * (Math.PI / 180);
                return <circle key={j} cx={100 + 60 * s * Math.cos(angle)} cy={100 + 60 * s * Math.sin(angle)} r="3" fill="#f43f5e" className="animate-dotpop" style={{ animationDelay: `${j * 0.1}s` }} />;
              })}
            </>
          );
        })()}
        {/* Labels */}
        {["Sensitivity", "Specificity", "Uniformity", "Reproducibility", "Reportability"].map((label, j) => {
          const angle = (j * 72 - 90) * (Math.PI / 180);
          return <text key={j} x={100 + 75 * Math.cos(angle)} y={100 + 75 * Math.sin(angle)} textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="monospace">{label}</text>;
        })}
      </svg>
    ),
    7: (
      // Long-read — nanopore signal
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        {/* Nanopore chip */}
        <rect x="60" y="30" width="80" height="40" rx="4" fill="#0f172a" stroke="#14b8a6" strokeWidth="1" />
        <text x="100" y="55" textAnchor="middle" fill="#14b8a6" fontFamily="monospace" fontSize="5">PromethION</text>
        {/* Pore */}
        <circle cx="100" cy="90" r="8" fill="none" stroke="#14b8a6" strokeWidth="1.5" />
        <circle cx="100" cy="90" r="3" fill="#14b8a6" opacity="0.4" />
        {/* Signal trace */}
        <path d="M20 140 L35 125 L42 145 L55 120 L62 150 L75 115 L82 148 L95 122 L102 142 L115 118 L122 140 L135 128 L142 145 L155 125 L162 138 L175 130 L180 140" fill="none" stroke="#14b8a6" strokeWidth="1.5" className="animate-signaldraw" />
        {/* Labels */}
        <text x="100" y="175" textAnchor="middle" fill="#14b8a6" fontFamily="monospace" fontSize="5" opacity="0.7">ADAPTIVE SAMPLING</text>
        <text x="100" y="188" textAnchor="middle" fill="#64748b" fontFamily="monospace" fontSize="5">NATIVE 5mC METHYLATION</text>
      </svg>
    ),
    8: (
      // Clinical report
      <svg viewBox="0 0 200 200" className="w-full max-w-[280px]">
        {/* Report page */}
        <rect x="40" y="20" width="120" height="160" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" className="animate-reportreveal" />
        {/* Header */}
        <rect x="50" y="30" width="100" height="14" rx="2" fill="#10b981" opacity="0.15" />
        <text x="100" y="40" textAnchor="middle" fill="#10b981" fontFamily="monospace" fontSize="5" fontWeight="600">CLINICAL GENOME REPORT</text>
        {/* Content lines */}
        {[55, 62, 69, 76, 83, 90, 97].map((y, i) => (
          <rect key={i} x="55" y={y} width={60 + (i % 3) * 15} height="3" rx="1" fill="#334155" opacity={0.3 + i * 0.05} />
        ))}
        {/* Variant box */}
        <rect x="55" y="108" width="90" height="28" rx="3" fill="#10b981" opacity="0.08" stroke="#10b981" strokeWidth="0.5" />
        <text x="100" y="118" textAnchor="middle" fill="#10b981" fontSize="4" fontFamily="monospace">PATHOGENIC VARIANT IDENTIFIED</text>
        <text x="100" y="128" textAnchor="middle" fill="#94a3b8" fontSize="3.5" fontFamily="monospace">BRCA1 c.5266dupC p.Gln1756fs</text>
        {/* Signature line */}
        <line x1="55" y1="150" x2="120" y2="150" stroke="#334155" strokeWidth="0.5" />
        <text x="87" y="158" textAnchor="middle" fill="#64748b" fontSize="3.5">Board-certified Clinical Genomicist</text>
        {/* ACMG badge */}
        <rect x="125" y="145" width="25" height="14" rx="3" fill="#10b981" opacity="0.2" />
        <text x="137" y="154" textAnchor="middle" fill="#10b981" fontSize="4" fontWeight="600">ACMG</text>
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`rounded-2xl border p-8 ${c.border} ${c.bg}`}>
        {visuals[stageIndex] ?? <div className="h-48 w-48" />}
      </div>
    </div>
  );
}

/* ────────────────────── LIMS RIBBON ────────────────────── */

function LimsRibbon({
  activeStage,
  onClickStage,
}: {
  activeStage: number;
  onClickStage: (i: number) => void;
}) {
  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex h-12 items-center gap-1 border-b border-lsmc-steel/30 bg-lsmc-night/92 px-4 backdrop-blur-md sm:px-6">
      <span className="mr-3 hidden font-mono text-[11px] font-medium tracking-widest text-cyan-400 uppercase sm:block">
        Bloom LIMS
      </span>
      {RIBBON_LABELS.map((label, i) => (
        <div key={i} className="flex items-center">
          <button
            onClick={() => onClickStage(i)}
            title={label}
            className={`group relative h-[10px] w-[10px] rounded-full border-2 transition-all duration-500 ${
              i < activeStage
                ? "border-emerald-400 bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                : i === activeStage
                  ? "border-cyan-400 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  : "border-lsmc-steel bg-lsmc-slate"
            }`}
          >
            <span className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-lsmc-steel opacity-0 transition-opacity group-hover:opacity-100">
              {label}
            </span>
          </button>
          {i < 8 && (
            <div
              className={`mx-0.5 h-[2px] w-4 transition-all duration-500 sm:w-7 ${
                i < activeStage
                  ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                  : "bg-lsmc-slate"
              }`}
            />
          )}
        </div>
      ))}
      <div className="ml-auto hidden font-mono text-[11px] text-lsmc-steel sm:block">
        Sample <span className="text-amber-400">LG-2026-00427</span>
      </div>
    </div>
  );
}

/* ────────────────────── EXPAND PANEL ────────────────────── */

function ExpandPanel({
  label,
  icon,
  isLims,
  children,
  open,
  onToggle,
}: {
  label: string;
  icon: React.ReactNode;
  isLims?: boolean;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] transition-all ${
          open
            ? isLims
              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
              : "border-lsmc-accent/40 bg-lsmc-accent/10 text-lsmc-accent"
            : "border-lsmc-steel/40 bg-lsmc-deep text-lsmc-mist hover:border-cyan-400/30 hover:text-lsmc-ice"
        }`}
      >
        {icon}
        {label}
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ${
          open ? "mt-2 max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`rounded-lg border p-4 ${
            isLims
              ? "border-cyan-400/20 bg-cyan-400/[0.03]"
              : "border-lsmc-steel/30 bg-lsmc-deep"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── STAGE SECTION ────────────────────── */

function StageSection({ stage, index }: { stage: StageData; index: number }) {
  const [techOpen, setTechOpen] = useState(false);
  const [limsOpen, setLimsOpen] = useState(false);
  const c = accentClasses(stage.color);

  const techIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
  const limsIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );

  return (
    <section
      id={stage.id}
      data-stage={index}
      className="stage-observer flex min-h-[70vh] items-start justify-center px-4 pt-20 pb-12 sm:px-6 opacity-0 translate-y-8 transition-all duration-700 ease-out"
    >
      <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-10 lg:grid-cols-2">
        {/* Left: text */}
        <div className="space-y-5">
          <div className="font-mono text-xs tracking-widest text-lsmc-steel uppercase">
            Stage {stage.number}
          </div>
          <h2 className="text-3xl font-bold text-lsmc-white sm:text-4xl">
            {stage.title}
          </h2>
          <div className={`text-sm font-medium ${c.text}`}>{stage.subtitle}</div>
          <p className="text-[15px] leading-relaxed text-lsmc-mist">
            {stage.description}
          </p>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-3">
            {stage.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-lsmc-steel/30 bg-lsmc-deep px-3 py-2 transition-transform hover:-translate-y-0.5"
              >
                <div className="font-mono text-base font-semibold text-cyan-400">
                  {s.value}
                </div>
                <div className="text-[11px] tracking-wide text-lsmc-steel uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Expand panels */}
          <div className="flex flex-wrap gap-2">
            <ExpandPanel
              label="Technical Detail"
              icon={techIcon}
              open={techOpen}
              onToggle={() => setTechOpen(!techOpen)}
            >
              <h4 className="mb-3 text-[13px] font-semibold tracking-wide text-cyan-400 uppercase">
                {stage.techTitle}
              </h4>
              <ul className="space-y-1.5">
                {stage.techItems.map((item, i) => (
                  <li
                    key={i}
                    className="relative pl-4 text-[13px] leading-relaxed text-lsmc-mist"
                  >
                    <span className="absolute left-0 font-bold text-cyan-400">
                      {"\u203a"}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </ExpandPanel>

            <ExpandPanel
              label="LIMS Tracking"
              icon={limsIcon}
              isLims
              open={limsOpen}
              onToggle={() => setLimsOpen(!limsOpen)}
            >
              <h4 className="mb-3 text-[13px] font-semibold tracking-wide text-cyan-400 uppercase">
                {stage.limsTitle}
              </h4>
              <div className="space-y-2">
                {stage.limsEvents.map((ev, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
                    <div className="text-[13px] text-lsmc-mist">
                      <strong className="font-medium text-lsmc-ice">
                        {ev.bold}
                      </strong>{" "}
                      &mdash; {ev.rest}
                      {ev.code && (
                        <code className="ml-1 rounded bg-cyan-400/10 px-1 py-0.5 font-mono text-[11px] text-cyan-400">
                          {ev.code}
                        </code>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ExpandPanel>
          </div>
        </div>

        {/* Right: visual */}
        <StageVisual stageIndex={index} color={stage.color} />
      </div>
    </section>
  );
}

/* ────────────────────── COUNTER ANIMATION ────────────────────── */

function AnimatedCounter({
  target,
  suffix,
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="font-mono text-4xl font-bold text-cyan-400 transition-[text-shadow] hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
      {count}
      {suffix}
    </span>
  );
}

/* ────────────────────── MAIN PAGE ────────────────────── */

export default function PipelineViz() {
  const [activeStage, setActiveStage] = useState(-1);
  const stageRefs = useRef<Map<number, Element>>(new Map());

  // IntersectionObserver for LIMS ribbon tracking + scroll-triggered fade-in
  useEffect(() => {
    // Ribbon tracking (tight threshold)
    const ribbonObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.stage ?? -1
            );
            if (idx >= 0) setActiveStage(idx);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );

    // Fade-in on scroll (generous threshold so it fires early)
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    // Observe all stage sections
    const sections = document.querySelectorAll(".stage-observer");
    sections.forEach((s) => {
      ribbonObserver.observe(s);
      fadeObserver.observe(s);
    });

    return () => {
      ribbonObserver.disconnect();
      fadeObserver.disconnect();
    };
  }, []);

  const scrollToStage = useCallback((i: number) => {
    const el = document.getElementById(`stage-${i}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Pipeline-specific animations */
        @keyframes pv-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float { animation: pv-float 4s ease-in-out infinite; }

        @keyframes pv-scan {
          0%, 100% { opacity: 0.2; stroke-dashoffset: 12; }
          50% { opacity: 0.9; stroke-dashoffset: 0; }
        }
        .animate-scan { animation: pv-scan 1.5s ease-in-out infinite; }

        @keyframes pv-bead {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(2px, -3px); }
          50% { transform: translate(-1px, 2px); }
          75% { transform: translate(3px, 1px); }
        }
        .animate-bead { animation: pv-bead 5s ease-in-out infinite; }

        @keyframes pv-scissors {
          0%, 80%, 100% { transform: rotate(0deg); }
          85% { transform: rotate(10deg); }
          90% { transform: rotate(-5deg); }
          95% { transform: rotate(5deg); }
        }
        .animate-scissors { transform-origin: center; animation: pv-scissors 3s ease-in-out infinite; }

        @keyframes pv-lane {
          0% { opacity: 0.1; }
          50% { opacity: 0.25; }
          100% { opacity: 0.1; }
        }
        .animate-lane { animation: pv-lane 2s ease-in-out infinite; }

        @keyframes pv-dagpulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .animate-dagpulse { animation: pv-dagpulse 3s ease-in-out infinite; }

        @keyframes pv-dash {
          to { stroke-dashoffset: -8; }
        }
        .animate-dash { stroke-dasharray: 3 2; animation: pv-dash 1s linear infinite; }

        @keyframes pv-radardraw {
          from { stroke-dashoffset: 600; opacity: 0.3; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        .animate-radardraw { stroke-dasharray: 600; animation: pv-radardraw 2s ease-out forwards; }

        @keyframes pv-dotpop {
          from { r: 0; opacity: 0; }
          to { opacity: 1; }
        }
        .animate-dotpop { animation: pv-dotpop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes pv-signaldraw {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        .animate-signaldraw { stroke-dasharray: 300; animation: pv-signaldraw 2s ease-out forwards; }

        @keyframes pv-reportreveal {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-reportreveal { animation: pv-reportreveal 0.8s ease-out forwards; }

        @keyframes pv-pulsedown {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        .animate-pulsedown { animation: pv-pulsedown 2s ease-in-out infinite; }

        /* Hero gradient text */
        .hero-gradient-text {
          background: linear-gradient(135deg, #f1f5f9, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Hero grid background */
        .hero-grid-bg {
          background-image:
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
        }

        /* Final gradient text */
        .final-gradient-text {
          background: linear-gradient(135deg, #10b981, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <LimsRibbon activeStage={activeStage} onClickStage={scrollToStage} />

      <main className="bg-lsmc-night">
        {/* ─── HERO ─── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-20 text-center">
          <div className="hero-grid-bg absolute inset-0" />
          <div className="relative z-10">
            <Image
              src="/brand/lsmc-wordmark-logo-white.svg"
              alt="LSMC"
              width={120}
              height={30}
              className="mx-auto mb-6 opacity-60"
            />
            <h1 className="hero-gradient-text mb-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Clinical Genome
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-base font-light text-lsmc-mist sm:text-lg">
              Journey of a Sample &mdash; from collection kit to clinical
              report, every handoff, every instrument, every data checkpoint
              across the end-to-end whole-genome sequencing pipeline.
            </p>
            <div className="animate-pulsedown flex flex-col items-center gap-2 text-xs tracking-wider text-lsmc-steel">
              <span>SCROLL TO BEGIN</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>
        </section>

        {/* ─── PIPELINE OVERVIEW ─── */}
        <section className="px-6 py-20 text-center">
          <h2 className="mb-3 text-2xl font-bold text-lsmc-white sm:text-3xl">
            The Pipeline at a Glance
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-sm text-lsmc-mist">
            Nine stages from sample collection to clinical report &mdash; click
            any stage or scroll to explore in detail.
          </p>

          {/* Flow diagram */}
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-1">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => scrollToStage(i)}
                  className="group flex flex-col items-center gap-1 rounded-lg border border-lsmc-steel/30 bg-lsmc-deep px-3 py-2 transition-all hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/5"
                >
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    {i + 1}
                  </span>
                  <span className="text-[10px] text-lsmc-mist group-hover:text-lsmc-ice">
                    {s.ribbonLabel}
                  </span>
                </button>
                {i < 8 && (
                  <span className="mx-1 text-lsmc-steel">&rarr;</span>
                )}
              </div>
            ))}
          </div>

          {/* GQV callout */}
          <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-lsmc-steel/20 bg-lsmc-deep/50 px-5 py-4 text-left text-sm leading-relaxed text-lsmc-mist">
            <strong className="text-lsmc-ice">
              Genome Quality Vector (GQV)
            </strong>{" "}
            &mdash; a platform-agnostic, depth-adaptive quality framework.
            Rather than locking to a fixed coverage target, GQV defines genome
            quality by analytical outcomes across five axes. Clinical-grade
            results at any depth, on any sequencing platform.
          </div>

          <div className="mt-8 text-xs tracking-wider text-lsmc-steel">
            &darr; SCROLL TO EXPLORE EACH STAGE &darr;
          </div>
        </section>

        {/* ─── STAGE SECTIONS ─── */}
        {STAGES.map((stage, i) => (
          <StageSection key={stage.id} stage={stage} index={i} />
        ))}

        {/* ─── FINAL SUMMARY ─── */}
        <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
          <h2 className="final-gradient-text mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Sample to Report
          </h2>
          <p className="mx-auto max-w-lg text-sm text-lsmc-mist">
            End-to-end clinical whole-genome sequencing &mdash; every stage
            tracked, every quality checkpoint enforced, every result
            reproducible.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-10">
            {FINAL_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                />
                <span className="mt-1 text-xs tracking-wide text-lsmc-steel uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Back to Forge */}
          <Link
            href="/"
            className="mt-14 inline-flex items-center gap-2 rounded-xl border border-lsmc-steel/40 px-5 py-3 text-sm text-lsmc-mist transition-colors hover:border-lsmc-accent/40 hover:text-lsmc-ice"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            Back to Forge
          </Link>
        </section>
      </main>
    </>
  );
}
