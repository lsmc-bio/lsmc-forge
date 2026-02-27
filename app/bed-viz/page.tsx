"use client";

import Link from "next/link";
import Image from "next/image";

export default function BedViz() {
  return (
    <main className="flex h-screen flex-col bg-lsmc-night">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-lsmc-steel/30 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-lsmc-mist transition-colors hover:text-lsmc-white"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
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
        <span className="rounded-full bg-lsmc-accent/10 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-lsmc-glow">
          Prototype
        </span>
      </header>

      {/* Embedded BED Viz app */}
      <iframe
        src="/bed-viz-app/index.html"
        className="flex-1 w-full border-0"
        title="LSMC Genome Performance Explorer"
      />
    </main>
  );
}
