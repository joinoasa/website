---
title: Adopting software
description: How OASA picks outside open source software and hardware designs to use, fork or build on.
lastUpdated: 2026-10-23
---

**Version:** 1.0 · **Status:** Adopted 2026-10-23 · **Owner:** founder (Technical council later) · **Changes:** see [Changing this standard](#changing-this-standard)

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
- **Needs review:** AGPL, custom licenses, or no license at all (no license means we can't use it).
- **Not adoptable as an OASA standard:** licenses that restrict who may use it or for what (field-of-use clauses). Our designs must be usable by every member and partner, including public safety and government. Example: Reticulum's license bars use in any system able to harm people.

### Health
- Released or actively maintained in the last 12 months, or small and finished with no open security issues.
- Issues and pull requests get answers.
- More than one maintainer is a plus for anything security-critical.

### Security
- Check the **OpenSSF Scorecard** score (scorecard.dev). Note it and its date in the register. A score under 5 doesn't block adoption, but say what we do about it (pin versions, review updates, help upstream).
- Check its vulnerability history and how fast past problems were fixed.
- **Crypto and protocol code needs more:** an independent audit, or wide use plus test vectors. Fixes from any audit must be in a released version. If it has none of these, it's **prototype only**.
- **Check claims at the source.** Read the audit report itself, the license file itself, the release notes themselves. A blog post, README or summary can be out of date (snow's README still said "no formal audit" after one was published).
- **Check the defaults.** Note any default that quietly weakens security, and set it explicitly in our code (pymavlink speaks MAVLink 1, which can't be signed, unless told to use MAVLink 2).
- **Updates:** how does it update, and are its updates signed? If not, it can only be installed through a path that checks OASA's signature (see the [update standard](../update-standard/)).
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
- Dependabot, `cargo deny`, `cargo audit` and Scorecard flag problems between reviews.

## Changing this standard

v1.0 is locked. Fixes need founder approval (later the Technical council); rule changes need an OASA Proposal, as in [governance](../governance/).
