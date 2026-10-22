---
title: Adopting software
description: How OASA picks outside open source software and hardware designs to use, fork or build on.
lastUpdated: 2026-10-22
---

**Status:** Draft v0.1 · **Owner:** founder (Technical council later) · **Last reviewed:** 2026-10-22

OASA builds on great open work before reinventing it. This page is the checklist for deciding what to use. Every decision is recorded in the [Software register](../software-register/).

---

## 1. Integrate, then fork, then build

1. **Integrate:** use it as is, and send fixes upstream.
2. **Fork:** only if upstream won't take the changes we need. Keep the fork in sync and keep offering changes back.
3. **Build:** only when nothing good exists. Write down why in the register.

## 2. The checklist

Answer every question before adopting. Write the answers in the register entry.

### License
- **Allowed:** MIT, BSD (2- or 3-clause), Apache-2.0, ISC, zlib, CC0, Unlicense.
- **Allowed with care:** MPL-2.0 (changes to its files stay MPL); LGPL (link, don't copy in).
- **Upstream only:** GPL. We contribute to GPL projects (for example ArduPilot) in their own repos, but don't copy GPL code into Apache-2.0 OASA code. Apache-2.0 code can go into GPLv3 projects, but not the other way around.
- **Needs review:** AGPL, custom licenses, field-of-use restrictions, or no license at all (no license means we can't use it).

### Health
- Released or actively maintained in the last 12 months, or small and finished with no open security issues.
- Issues and pull requests get answers.
- More than one maintainer is a plus for anything security-critical.

### Security
- Check the **OpenSSF Scorecard** score (scorecard.dev). Note it in the register.
- Check its vulnerability history and how fast past problems were fixed.
- **Crypto and protocol code needs more:** an independent audit, or wide use plus test vectors. Fixes from any audit must be in a released version. If it has none of these, it's **prototype only**.
- No telemetry or "phone home" without a way to turn it off.

### Fit
- Runs on our targets (boards, companion computers, ground stations).
- Follows the standards we use (MAVLink, CoT/TAK, DroneCAN, ROS 2, Noise).
- Small enough to understand and review.

### Hardware designs and parts (also)
- Open design files we can edit.
- Parts we can actually buy, with U.S. sources noted where possible (see the Secure Domestic Supply Chain goal).

## 3. Register statuses

| Status | Meaning |
|---|---|
| **Adopted** | OASA standard. Use it for this job |
| **Trial** | Being tested in a project; may become Adopted |
| **Prototype only** | Fine for prototypes and tests, never in a release |
| **Watch** | Interesting; revisit later |
| **Rejected** | Don't use; reason recorded |

## 4. Who decides

- **Prototype only / Trial / Watch:** project lead.
- **Adopted** or **Rejected:** founder now, Technical council later. Crypto and security libraries also need a Security council sign-off once it exists.

## 5. Keeping it current

- Each register entry is reviewed at least once a year, and right away when it has a new security issue.
- Dependabot and Scorecard flag problems between reviews.
