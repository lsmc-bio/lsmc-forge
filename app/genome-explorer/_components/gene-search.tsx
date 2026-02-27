"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchGenes, type Gene } from "../_lib/genome-data";

interface GeneSearchProps {
  onSelect: (gene: Gene) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function GeneSearch({
  onSelect,
  placeholder = "Search genes...",
  autoFocus = false,
}: GeneSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Gene[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (query.length >= 1) {
      setResults(searchGenes(query, 12));
      setOpen(true);
      setActiveIndex(-1);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, [query]);

  const select = useCallback(
    (gene: Gene) => {
      onSelect(gene);
      setQuery("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [onSelect],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.children[activeIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 1 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-lsmc-steel/50 bg-lsmc-deep px-4 py-2.5 text-sm text-lsmc-ice placeholder:text-lsmc-steel focus:border-lsmc-accent/50 focus:outline-none focus:ring-1 focus:ring-lsmc-accent/30"
      />
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lsmc-steel"
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

      {open && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-lsmc-steel/50 bg-lsmc-surface shadow-xl"
        >
          {results.map((gene, i) => (
            <li
              key={gene.symbol}
              onMouseDown={() => select(gene)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors ${
                i === activeIndex
                  ? "bg-lsmc-accent/10 text-lsmc-white"
                  : "text-lsmc-ice hover:bg-lsmc-deep"
              }`}
            >
              <div>
                <span className="font-medium">{gene.symbol}</span>
                <span className="ml-2 text-xs text-lsmc-mist">{gene.name}</span>
              </div>
              <span className="font-mono text-xs text-lsmc-steel">
                {gene.chr}:{Math.floor(gene.start / 1000)}k
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
