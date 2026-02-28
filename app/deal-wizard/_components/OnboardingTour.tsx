"use client";

import { useEffect, useCallback, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "lsmc-wizard-tour-seen";

const tourSteps = [
  {
    element: "#tour-deal-info",
    popover: {
      title: "1. Deal Info",
      description:
        "Start here — enter the client name, deal name, annual volume, target margin, and batch size. These drive the pricing engine.",
      side: "right" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-presets",
    popover: {
      title: "2. Product Preset",
      description:
        "Pick a preset to auto-fill the configuration. Each preset maps to a real deal archetype — Inflection rWGS, Clinical Standard, Low-Pass, Biobank, 23andMe DTC, or Custom.",
      side: "right" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-config",
    popover: {
      title: "3. Configuration",
      description:
        "Fine-tune 8 dimensions: customer type, engagement model, test configuration (platform, coverage, assay), sample specs, deliverables, regulatory level, logistics, and turnaround time.",
      side: "right" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-tab-pricing",
    popover: {
      title: "4. Pricing Breakdown",
      description:
        "See real-time cost breakdown from the 14-stage COGS engine — extraction, library prep, sequencing, compute, overhead, and more. Updates instantly as you change the configuration.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-tab-sow",
    popover: {
      title: "5. SOW Preview",
      description:
        "Generate a full 14-section Statement of Work from your configuration. Three tiers of content: computed pricing, parameterized templates, and AI-generated narrative sections.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-tab-compare",
    popover: {
      title: "6. Compare Presets",
      description:
        "Compare your current configuration against other presets side-by-side. See cost differences, configuration deltas, and trade-offs at a glance.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-agent-btn",
    popover: {
      title: "7. AI Agent",
      description:
        "Need help? The Deal Agent uses the same COGS engine in a conversational interface. Describe a deal in plain language and it calculates pricing, compares platforms, and models capacity.",
      side: "left" as const,
      align: "start" as const,
    },
  },
];

export default function OnboardingTour() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM elements are rendered
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      startTour();
    }
  }, [ready]);

  return null;
}

export function startTour() {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: "rgba(10, 14, 23, 0.85)",
    stagePadding: 8,
    stageRadius: 12,
    popoverClass: "lsmc-tour-popover",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Get Started",
    progressText: "{{current}} of {{total}}",
    steps: tourSteps,
    onDestroyStarted: () => {
      localStorage.setItem(TOUR_KEY, "true");
      driverObj.destroy();
    },
  });

  driverObj.drive();
}
