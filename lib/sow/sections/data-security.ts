/**
 * SOW Section 11: Data Security & Compliance
 * Tier 2 — Conditional (included when regulatoryLevel is clia or clia_cap)
 */

import type { SOWSection, SectionContext } from "../types";

export function generateDataSecurity(ctx: SectionContext): SOWSection {
  const level = ctx.config.regulatoryLevel;
  const included = level === "clia" || level === "clia_cap";

  if (!included) {
    return {
      id: "data-security",
      title: "Data Security & Compliance",
      content: "",
      tier: 2,
      conditional: true,
      included: false,
    };
  }

  const content = `## Data Security & Compliance

### Data Protection

Provider maintains the following data security controls for all protected health information (PHI) and genomic data:

- **Encryption at rest:** [INPUT NEEDED — Confirm encryption standard]
- **Encryption in transit:** [INPUT NEEDED — Confirm TLS/transport security standard]
- **Access controls:** [INPUT NEEDED — Confirm access control policy (RBAC, MFA, etc.)]
- **Audit logging:** [INPUT NEEDED — Confirm audit log retention period]
- **Backup:** [INPUT NEEDED — Confirm backup frequency and retention policy]

### HIPAA Compliance

- [INPUT NEEDED — Confirm HIPAA status: covered entity, business associate, or N/A]
- A Business Associate Agreement (BAA) will be executed between Provider and Client prior to the exchange of any PHI
- [INPUT NEEDED — Confirm BAA status and template]

### Data Retention & Destruction

| Data Type | Retention Period | Destruction Method |
|---|---|---|
| Raw sequencing data (FASTQ) | [INPUT NEEDED — Confirm retention period] | Secure deletion |
| Aligned data (BAM/CRAM) | [INPUT NEEDED — Confirm retention period] | Secure deletion |
| Clinical reports | [INPUT NEEDED — Confirm retention period per CLIA requirements] | Per regulatory requirements |
| Sample metadata | [INPUT NEEDED — Confirm retention period per CLIA requirements] | Per regulatory requirements |

Data retention periods may be extended by mutual agreement. Client may request
early deletion of non-required data with [INPUT NEEDED — notice period] written notice.

### Incident Response

In the event of a data breach or security incident affecting Client data, Provider will:
1. Notify Client within [INPUT NEEDED — breach notification timeline]
2. Provide a preliminary incident report within [INPUT NEEDED — incident report timeline]
3. Cooperate fully with Client's incident response procedures`;

  return {
    id: "data-security",
    title: "Data Security & Compliance",
    content,
    tier: 2,
    conditional: true,
    included: true,
  };
}
