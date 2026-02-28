"use client";

import { useCallback, useState } from "react";
import type { SOWDocument } from "@/lib/sow/types";
import { renderSOWToMarkdown } from "@/lib/sow/template-engine";

interface SOWActionsProps {
  doc: SOWDocument | null;
}

export default function SOWActions({ doc }: SOWActionsProps) {
  const [copied, setCopied] = useState(false);

  const markdown = doc ? renderSOWToMarkdown(doc) : "";

  const handleCopy = useCallback(async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  const handleDownload = useCallback(() => {
    if (!doc || !markdown) return;
    const filename = doc.metadata.dealName
      ? `${doc.metadata.dealName.replace(/\s+/g, "-").toLowerCase()}-sow.md`
      : "sow-draft.md";
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [doc, markdown]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        disabled={!doc}
        className="rounded-md border border-lsmc-steel/40 bg-lsmc-surface px-3 py-1.5 text-xs font-medium text-lsmc-ice transition-colors hover:border-lsmc-accent/50 hover:text-lsmc-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copied ? "Copied!" : "Copy All"}
      </button>
      <button
        onClick={handleDownload}
        disabled={!doc}
        className="rounded-md border border-lsmc-steel/40 bg-lsmc-surface px-3 py-1.5 text-xs font-medium text-lsmc-ice transition-colors hover:border-lsmc-accent/50 hover:text-lsmc-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Download .md
      </button>
    </div>
  );
}
