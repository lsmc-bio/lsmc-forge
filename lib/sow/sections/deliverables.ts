/**
 * SOW Section 5: Deliverables & Data Transfer
 * Tier 1 — Computed list
 */

import type { SOWSection, SectionContext } from "../types";

interface DeliverableItem {
  name: string;
  description: string;
  format: string;
}

const DELIVERABLE_DETAILS: Record<string, DeliverableItem> = {
  fastq: {
    name: "FASTQ Files",
    description:
      "Raw sequencing reads in FASTQ format, demultiplexed per sample",
    format: "FASTQ (.fastq.gz)",
  },
  bam_cram: {
    name: "Aligned Reads",
    description:
      "Sequence reads aligned to the GRCh38 reference genome",
    format: "BAM (.bam) or CRAM (.cram) with index",
  },
  vcf: {
    name: "Variant Call File",
    description:
      "Called variants (SNVs, indels, and structural variants where applicable)",
    format: "VCF (.vcf.gz) with index",
  },
  clinical_report: {
    name: "Clinical Report",
    description:
      "Formatted clinical report summarizing findings, variant classifications, and recommendations",
    format: "PDF (.pdf)",
  },
  interpretation: {
    name: "Variant Interpretation",
    description:
      "Expert interpretation of identified variants per ACMG/AMP guidelines with clinical significance assessment",
    format: "Included in Clinical Report",
  },
  research_summary: {
    name: "Research Summary",
    description:
      "Summary of sequencing metrics, QC results, and key findings for research use",
    format: "PDF (.pdf) or TSV (.tsv)",
  },
};

export function generateDeliverables(ctx: SectionContext): SOWSection {
  const del = ctx.config.deliverables;

  if (!del) {
    return {
      id: "deliverables",
      title: "Deliverables & Data Transfer",
      content: "*[INPUT NEEDED — Deliverables not configured]*",
      tier: 1,
      conditional: false,
      included: true,
    };
  }

  const included: DeliverableItem[] = [];
  if (del.fastq) included.push(DELIVERABLE_DETAILS.fastq);
  if (del.bam_cram) included.push(DELIVERABLE_DETAILS.bam_cram);
  if (del.vcf) included.push(DELIVERABLE_DETAILS.vcf);
  if (del.clinical_report)
    included.push(DELIVERABLE_DETAILS.clinical_report);
  if (del.interpretation)
    included.push(DELIVERABLE_DETAILS.interpretation);
  if (del.research_summary)
    included.push(DELIVERABLE_DETAILS.research_summary);

  const rows = included
    .map((d) => `| ${d.name} | ${d.description} | ${d.format} |`)
    .join("\n");

  const content = `## Deliverables & Data Transfer

### Deliverables

| Deliverable | Description | Format |
|---|---|---|
${rows}

### Data Transfer

- All data files will be delivered via Provider's secure file transfer system
- Client will receive notification upon data availability
- Data will be retained on Provider's servers for [INPUT NEEDED — Confirm data retention period] following delivery
- Client is responsible for downloading data within the retention period
- [INPUT NEEDED — Confirm data transfer method: SFTP, cloud storage, or BaseSpace]`;

  return {
    id: "deliverables",
    title: "Deliverables & Data Transfer",
    content,
    tier: 1,
    conditional: false,
    included: true,
  };
}
