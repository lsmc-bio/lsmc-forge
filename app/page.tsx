import Link from "next/link";

const modules = [
  {
    name: "Deal Agent",
    href: "/deal-agent",
    description:
      "Conversational deal configurator. Chat with Claude to build pricing estimates and deal configs from LSMC's 8-dimension model.",
    status: "Phase 0",
    audience: "Internal (Andrew, Eric)",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/30",
  },
  {
    name: "BED Viz",
    href: "/bed-viz",
    description:
      "Genomic performance visualization. Upload BED files to see coverage, variant calling performance, and quality metrics across LSMC platforms.",
    status: "Prototype",
    audience: "Customer-facing",
    color: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/30",
  },
  {
    name: "Deal Wizard",
    href: "/deal-wizard",
    description:
      "Structured deal configuration form. The 8-dimension configurator with archetype presets, pricing engine, and SOW generation.",
    status: "Planned",
    audience: "Internal",
    color: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/30",
  },
  {
    name: "Pipeline Viz",
    href: "/pipeline-viz",
    description:
      "Interactive bioinformatics pipeline visualization. Scroll-driven animation showing sample-to-report journey across LSMC platforms.",
    status: "Prototype",
    audience: "Customer-facing (website)",
    color: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/30",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          LSMC Forge
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Product and workflow prototypes. Some customer-facing, others for
          internal business orchestration. All functional, all connected.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`group rounded-xl border ${mod.border} bg-gradient-to-br ${mod.color} p-6 transition-all hover:scale-[1.02] hover:border-opacity-60`}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-white">{mod.name}</h2>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                {mod.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {mod.description}
            </p>
            <p className="mt-3 text-xs text-zinc-500">{mod.audience}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
