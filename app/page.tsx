import Link from "next/link";
import Image from "next/image";

const modules = [
  {
    name: "Deal Agent",
    href: "/deal-agent",
    description:
      "Conversational deal configurator powered by AI. Build pricing quotes and deal configurations through natural conversation.",
    status: "Live",
    audience: "Internal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
  {
    name: "Genome Performance Explorer",
    href: "/genome-explorer",
    description:
      "Browse genes, build panels, and see how your targets perform on LSMC's clinical genome.",
    status: "Prototype",
    audience: "Customer-facing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    name: "Deal Wizard",
    href: "/deal-wizard",
    description:
      "Structured deal configuration. 8-dimension configurator with archetype presets, real-time pricing, and SOW generation.",
    status: "Live",
    audience: "Internal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    name: "Pipeline Viz",
    href: "/pipeline-viz",
    description:
      "Interactive bioinformatics pipeline visualization. Scroll-driven animation of the sample-to-report journey.",
    status: "Prototype",
    audience: "Customer-facing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="relative mx-auto max-w-5xl px-6 py-16">
      {/* Subtle background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-lsmc-steel) 1px, transparent 1px), linear-gradient(90deg, var(--color-lsmc-steel) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mb-14">
        <Image
          src="/brand/lsmc-wordmark-logo-white.svg"
          alt="LSMC"
          width={160}
          height={35}
          className="mb-6 opacity-90"
          priority
        />
        <h1 className="text-3xl font-semibold tracking-tight text-lsmc-white">
          Forge
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-lsmc-mist">
          Product and workflow prototypes. Some customer-facing, others for
          internal business orchestration.
        </p>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group relative rounded-xl border border-lsmc-steel/50 bg-lsmc-surface/80 p-6 backdrop-blur-sm transition-all duration-200 hover:border-lsmc-accent/40 hover:bg-lsmc-deep"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lsmc-slate/80 text-lsmc-mist transition-colors group-hover:bg-lsmc-accent/15 group-hover:text-lsmc-accent">
                  {mod.icon}
                </div>
                <h2 className="text-base font-semibold text-lsmc-white">
                  {mod.name}
                </h2>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                  mod.status === "Live"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : mod.status === "Prototype"
                      ? "bg-lsmc-accent/10 text-lsmc-glow"
                      : "bg-lsmc-slate text-lsmc-mist"
                }`}
              >
                {mod.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-lsmc-mist">
              {mod.description}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-lsmc-steel transition-colors group-hover:text-lsmc-mist">
              <span>{mod.audience}</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
