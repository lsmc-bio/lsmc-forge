import Link from "next/link";

export default function PipelineViz() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          &larr; Forge
        </Link>
        <h1 className="text-2xl font-bold text-white">Pipeline Viz</h1>
        <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs text-purple-400">
          Customer-facing
        </span>
      </div>
      <p className="text-zinc-400">
        Interactive bioinformatics pipeline visualization. Scroll-driven
        animation showing the sample-to-report journey across LSMC platforms.
      </p>
      <p className="mt-4 text-sm text-zinc-600">
        Module scaffold ready. Port existing HTML + GSAP prototypes from vault.
      </p>
    </main>
  );
}
