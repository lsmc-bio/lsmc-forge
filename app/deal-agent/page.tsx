"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ROADMAP_ITEMS = [
  {
    category: "Live",
    color: "emerald",
    items: [
      "14-stage per-sample COGS engine (accessioning through margin)",
      "Coverage-aware sequencing cost (depth drives samples-per-run)",
      "7 platform configs (NovaSeq X+, UG 100, PromethION)",
      "6 product presets (Inflection rWGS, Clinical Standard, Low-Pass, Biobank, 23andMe, Custom)",
      "Side-by-side config comparison and sensitivity analysis",
    ],
  },
  {
    category: "Placeholder Data",
    color: "amber",
    items: [
      "Capacity model uses static defaults (2x UG, 1x ILMN, 1x ONT @ ~720 samples/wk) — will wire to Bloom LIMS for real-time utilization",
      "Consumable pricing hardcoded from GSheet snapshot — needs live database or API",
      "Labor rates and overhead figures from Emily's COGS model — need periodic recalibration",
      "Volume discount tiers (Low/High/Biobank) use step-function — need smooth curves from actual contracts",
      "Analysis costs (secondary/tertiary/clinical sign-out) are flat estimates — need per-pipeline benchmarks",
    ],
  },
  {
    category: "Needs Wiring",
    color: "blue",
    items: [
      "Bloom LIMS integration → real-time instrument capacity and weekly throughput",
      "GSheet pricing sync → automated pull from COGS Calculator v2",
      "SOW generation → feed COGS breakdown into deal wizard SOW template",
      "Deal history → persist conversations and quotes to a database",
      "Customer-facing mode → stripped-down agent showing price ranges without full cost stack",
    ],
  },
];

export default function DealAgent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ maxSteps: 5 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="flex h-screen flex-col bg-lsmc-night">
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
          <span className="text-sm font-medium text-lsmc-white">Deal Agent</span>
        </div>
        <span className="rounded-full bg-lsmc-accent/10 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-lsmc-glow">
          Internal
        </span>
        <button
          onClick={() => setRoadmapOpen(!roadmapOpen)}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-lsmc-steel/50 px-3 py-1.5 text-[11px] font-medium text-lsmc-mist transition-colors hover:border-lsmc-accent/40 hover:text-lsmc-ice"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
          </svg>
          Roadmap
        </button>
      </header>

      {/* Internal notice */}
      <div className="border-b border-amber-500/20 bg-amber-500/5 px-6 py-2.5">
        <p className="mx-auto max-w-3xl text-xs text-amber-400/80">
          <span className="font-semibold">Internal tool</span> — full cost stack, margins, and economics visible. An external customer-facing agent may be built separately for the website.
        </p>
      </div>

      {/* Roadmap panel */}
      {roadmapOpen && (
        <div className="border-b border-lsmc-steel/30 bg-lsmc-surface/80 px-6 py-5">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-lsmc-white">Engine Status & Roadmap</h3>
              <button
                onClick={() => setRoadmapOpen(false)}
                className="text-xs text-lsmc-steel transition-colors hover:text-lsmc-mist"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              {ROADMAP_ITEMS.map((group) => (
                <div key={group.category}>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        group.color === "emerald"
                          ? "bg-emerald-400"
                          : group.color === "amber"
                            ? "bg-amber-400"
                            : "bg-blue-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold tracking-wide uppercase ${
                        group.color === "emerald"
                          ? "text-emerald-400"
                          : group.color === "amber"
                            ? "text-amber-400"
                            : "text-blue-400"
                      }`}
                    >
                      {group.category}
                    </span>
                  </div>
                  <ul className="space-y-1 pl-4">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs leading-relaxed text-lsmc-mist"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lsmc-steel" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-lsmc-steel">
              The pricing engine is calibrated against the LSMC COGS Calculator v2 GSheet.
              Capacity defaults are illustrative — in production, real utilization data will flow from Bloom (LSMC&apos;s LIMS) or equivalent, so the model reflects actual instrument availability and weekly throughput.
            </p>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6">
          {messages.length === 0 && (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-lsmc-accent/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-lsmc-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-lsmc-white">
                  Configure a deal
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-lsmc-mist">
                  Describe what the customer needs and I&apos;ll build a quote.
                  I know our platforms, pricing tiers, and product presets.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "Health system, 5K genomes/yr, Illumina 30x, CLIA",
                    "Biobank, 50K samples, low-pass, FASTQ only",
                    "Pharma, 500 samples, hybrid SR+LR, full report",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                          window.HTMLInputElement.prototype,
                          "value"
                        )?.set;
                        const inputEl = document.querySelector<HTMLInputElement>("#chat-input");
                        if (inputEl && nativeInputValueSetter) {
                          nativeInputValueSetter.call(inputEl, example);
                          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
                        }
                      }}
                      className="rounded-lg border border-lsmc-steel/50 bg-lsmc-surface px-3 py-2 text-left text-xs leading-relaxed text-lsmc-mist transition-colors hover:border-lsmc-accent/30 hover:text-lsmc-ice"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-lsmc-accent/15 px-4 py-3 text-sm text-lsmc-ice">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lsmc-slate/60">
                    <Image
                      src="/brand/lsmc-wordmark-logo-white.svg"
                      alt=""
                      width={22}
                      height={22}
                      className="opacity-70"
                    />
                  </div>
                  <div className="chat-markdown min-w-0 max-w-[90%]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ),
            )}

            {isLoading && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lsmc-slate/60">
                  <Image
                    src="/brand/lsmc-wordmark-logo-white.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-60"
                  />
                </div>
                <div className="flex items-center gap-1 py-3">
                  <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-lsmc-accent" />
                  <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-lsmc-accent" />
                  <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-lsmc-accent" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-lsmc-steel/30 bg-lsmc-night/80 px-6 py-4 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl gap-3"
        >
          <input
            id="chat-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Describe what the customer needs..."
            className="flex-1 rounded-xl border border-lsmc-steel/50 bg-lsmc-surface px-4 py-3 text-sm text-lsmc-white placeholder-lsmc-steel transition-colors focus:border-lsmc-accent/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-lsmc-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-lsmc-accent-dim disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
