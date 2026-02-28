"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DealWizardState } from "@/lib/config/deal-state";
import type { SOWDocument, SOWSection } from "@/lib/sow/types";
import SOWActions from "./SOWActions";

interface SOWPreviewProps {
  state: DealWizardState;
}

type GenerationStatus = "idle" | "generating" | "done" | "error";

export default function SOWPreview({ state }: SOWPreviewProps) {
  const [doc, setDoc] = useState<SOWDocument | null>(null);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasConfig = !!(state.selectedPresetId || state.config.testConfiguration);

  const generate = useCallback(async () => {
    setStatus("generating");
    setError(null);
    try {
      const res = await fetch("/api/sow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const result: SOWDocument = await res.json();
      setDoc(result);
      setStatus("done");
      // Default to first included section
      const first = result.sections.find((s) => s.included);
      if (first) setActiveSection(first.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStatus("error");
    }
  }, [state]);

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`sow-section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Track which section is visible during scroll
  useEffect(() => {
    if (!doc) return;
    const container = contentRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("sow-section-", "");
            setActiveSection(id);
            break;
          }
        }
      },
      { root: container, rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    const sectionEls = container.querySelectorAll("[id^='sow-section-']");
    sectionEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [doc]);

  // Idle state — no config
  if (!hasConfig) {
    return (
      <EmptyState
        icon="\u2699\uFE0F"
        title="Configure a deal first"
        subtitle="Select a product preset or configure test parameters to generate a SOW"
      />
    );
  }

  // Idle state — has config but hasn't generated
  if (status === "idle") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <EmptyState
          icon="\uD83D\uDCC4"
          title="Ready to generate"
          subtitle={`${state.dealName || "Untitled deal"} \u2014 ${state.clientName || "No client"}`}
        />
        <button
          onClick={generate}
          className="rounded-lg bg-lsmc-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-lsmc-accent/20 transition-all hover:bg-lsmc-accent/90 hover:shadow-lg"
        >
          Generate SOW
        </button>
      </div>
    );
  }

  // Generating
  if (status === "generating") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-lsmc-steel border-t-lsmc-accent" />
          <p className="text-sm text-lsmc-mist">
            Generating SOW...
          </p>
          <p className="mt-1 text-xs text-lsmc-steel">
            Tier 1-2 sections are instant. Tier 3 AI sections may take a few seconds.
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <EmptyState
          icon="\u26A0\uFE0F"
          title="Generation failed"
          subtitle={error ?? "Unknown error"}
        />
        <button
          onClick={generate}
          className="rounded-lg border border-lsmc-steel/40 bg-lsmc-surface px-4 py-2 text-xs font-medium text-lsmc-ice transition-colors hover:border-lsmc-accent/50"
        >
          Retry
        </button>
      </div>
    );
  }

  // Done — render the document
  if (!doc) return null;

  const includedSections = doc.sections.filter((s) => s.included);

  return (
    <div className="flex h-full gap-0">
      {/* Section nav sidebar */}
      <nav className="w-48 shrink-0 border-r border-lsmc-steel/20 pr-3">
        <div className="sticky top-0 space-y-0.5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-lsmc-steel">
              Sections
            </span>
            <TierLegend />
          </div>
          {includedSections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                activeSection === s.id
                  ? "bg-lsmc-accent/10 text-lsmc-accent"
                  : "text-lsmc-mist hover:text-lsmc-ice"
              }`}
            >
              <TierDot tier={s.tier} />
              <span className="truncate">{s.title}</span>
            </button>
          ))}
          <div className="mt-4 border-t border-lsmc-steel/20 pt-3">
            <SOWActions doc={doc} />
          </div>
          <button
            onClick={generate}
            className="mt-2 w-full rounded-md border border-lsmc-steel/30 px-2 py-1.5 text-[11px] font-medium text-lsmc-steel transition-colors hover:border-lsmc-accent/40 hover:text-lsmc-mist"
          >
            Regenerate
          </button>
        </div>
      </nav>

      {/* Document content */}
      <div ref={contentRef} className="min-w-0 flex-1 overflow-y-auto pl-6">
        {/* Document header */}
        <div className="mb-6 border-b border-lsmc-steel/20 pb-4">
          <p className="text-[10px] uppercase tracking-wider text-lsmc-steel">
            Draft Statement of Work
          </p>
          <h2 className="mt-1 text-lg font-semibold text-lsmc-white">
            {doc.metadata.dealName || "Untitled Deal"}
          </h2>
          <div className="mt-1 flex items-center gap-3 text-xs text-lsmc-mist">
            {doc.metadata.clientName && <span>{doc.metadata.clientName}</span>}
            {doc.metadata.presetName && (
              <>
                <span className="text-lsmc-steel">{"\u00B7"}</span>
                <span>{doc.metadata.presetName}</span>
              </>
            )}
            <span className="text-lsmc-steel">{"\u00B7"}</span>
            <span>
              Generated{" "}
              {new Date(doc.metadata.generatedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="sow-markdown space-y-8 pb-12">
          {includedSections.map((section) => (
            <SectionBlock key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: SOWSection }) {
  const hasInputNeeded = section.content.includes("[INPUT NEEDED");

  return (
    <div id={`sow-section-${section.id}`} className="scroll-mt-4">
      {/* Section tier badge */}
      <div className="mb-2 flex items-center gap-2">
        <TierBadge tier={section.tier} />
        {section.conditional && (
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
            Conditional
          </span>
        )}
        {hasInputNeeded && (
          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-medium text-rose-400">
            Needs Input
          </span>
        )}
      </div>

      {/* Rendered markdown */}
      <div className="chat-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {section.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: 1 | 2 | 3 }) {
  const styles = {
    1: "bg-emerald-500/10 text-emerald-400",
    2: "bg-blue-500/10 text-blue-400",
    3: "bg-violet-500/10 text-violet-400",
  };
  const labels = {
    1: "Computed",
    2: "Parameterized",
    3: "AI-Generated",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${styles[tier]}`}>
      Tier {tier} — {labels[tier]}
    </span>
  );
}

function TierDot({ tier }: { tier: 1 | 2 | 3 }) {
  const colors = {
    1: "bg-emerald-400",
    2: "bg-blue-400",
    3: "bg-violet-400",
  };
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${colors[tier]}`} />;
}

function TierLegend() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="text-4xl">{icon}</div>
        <p className="mt-3 text-sm text-lsmc-mist">{title}</p>
        <p className="mt-1 text-xs text-lsmc-steel">{subtitle}</p>
      </div>
    </div>
  );
}
