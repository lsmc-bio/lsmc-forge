import Link from "next/link";

export default function DealWizard() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          &larr; Forge
        </Link>
        <h1 className="text-2xl font-bold text-white">Deal Wizard</h1>
        <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs text-amber-400">
          Internal
        </span>
      </div>
      <p className="text-zinc-400">
        Structured 8-dimension deal configurator with archetype presets, pricing
        engine integration, and SOW generation.
      </p>
      <p className="mt-4 text-sm text-zinc-600">
        Module scaffold ready. Form UI layer over the same tool backend as the
        Deal Agent.
      </p>
    </main>
  );
}
