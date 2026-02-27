"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BedRegion } from "./_lib/genome-data";
import Landing from "./_components/landing";
import Wizard from "./_components/wizard";
import ScoreView from "./_components/score-view";

type View = "landing" | "wizard" | "score";

interface AnalysisResult {
  regions: BedRegion[];
  depth: number;
  label: string;
}

export default function GenomeExplorer() {
  const [view, setView] = useState<View>("landing");
  const [result, setResult] = useState<AnalysisResult | null>(null);

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
              Genome Performance Explorer
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/genome-explorer/browse"
              className="group flex items-center gap-1.5 rounded-lg border border-lsmc-steel/40 px-3 py-1.5 text-xs font-medium text-lsmc-mist transition-all hover:border-lsmc-accent/40 hover:text-lsmc-white"
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
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              Browse Genes
            </Link>
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-xs text-lsmc-steel transition-colors hover:text-lsmc-mist"
            >
              Back to Forge
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      {view === "landing" && (
        <Landing onStart={() => setView("wizard")} />
      )}

      {view === "wizard" && (
        <Wizard
          onComplete={(regions, depth, label) => {
            setResult({ regions, depth, label });
            setView("score");
          }}
          onBack={() => setView("landing")}
        />
      )}

      {view === "score" && result && (
        <ScoreView
          regions={result.regions}
          depth={result.depth}
          label={result.label}
          onBack={() => setView("wizard")}
        />
      )}
    </div>
  );
}
