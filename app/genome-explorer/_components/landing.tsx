"use client";

interface LandingProps {
  onStart: () => void;
}

const CARDS = [
  {
    title: "Whole Genome",
    desc: "Analyze performance across all 24 chromosomes with synthetic coverage metrics.",
    icon: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
  },
  {
    title: "Panel Presets",
    desc: "Choose from curated clinical panels — cancer, cardiac, neuro, and more.",
    icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z",
  },
  {
    title: "Custom Panel",
    desc: "Search our gene database or upload a BED file with your own target regions.",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  },
];

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-lsmc-accent" />
          <span className="text-xs font-medium uppercase tracking-widest text-lsmc-accent">
            Genome Performance Explorer
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-lsmc-white">
          How will your targets perform on our clinical genome?
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-lsmc-mist">
          Select genes, build a custom panel, or analyze whole-genome coverage.
          See SNV and Indel F-scores, callable regions, and depth metrics — all
          modeled on LSMC&apos;s clinical WGS pipeline.
        </p>
      </div>

      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-lsmc-steel/40 bg-lsmc-surface/80 p-5"
          >
            <svg
              className="mb-3 h-5 w-5 text-lsmc-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={card.icon}
              />
            </svg>
            <h3 className="text-sm font-semibold text-lsmc-white">
              {card.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-lsmc-mist">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="group inline-flex items-center gap-2 rounded-lg bg-lsmc-accent px-6 py-3 text-sm font-medium text-white transition-all hover:bg-lsmc-accent-dim hover:shadow-lg hover:shadow-lsmc-accent/20"
      >
        Start Analysis
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
