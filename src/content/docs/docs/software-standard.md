---
title: Software standard
description: How OASA builds software and firmware, so every project works the same way.
lastUpdated: 2026-10-23
---

**Version:** 1.0 · **Status:** Adopted 2026-10-23 · **Owner:** founder (Technical council later) · **Changes:** see [Changing this standard](#changing-this-standard)

This is how OASA builds software and firmware. It applies to every **official** project and is recommended for personal and community projects. It follows the four practice groups of [NIST SP 800-218 (SSDF)](https://csrc.nist.gov/Projects/SSDF): prepare the organization, protect the software, produce secure software, respond to vulnerabilities.

Companion pages: [Update standard](../update-standard/), [Adopting software](../adopting-software/) and the [Software register](../software-register/).

---

## 1. Encrypted, always

- Every link is **encrypted and authenticated**. Signing or a checksum alone is never "the OASA link."
- Signing (for example MAVLink 2 signing) is allowed **inside** encryption as a second layer.
- Pairing and key exchange happen over an encrypted handshake, never in plaintext.

## 2. Crypto rules

- **No new crypto math.** Use proven, reviewed libraries listed in the register.
- **Approved building blocks (v0):** X25519 (key exchange), Ed25519 (signatures), ChaCha20-Poly1305 (encryption), BLAKE2s or SHA-256 (hashing), the Noise Protocol Framework (handshakes).
- **X25519 only for now.** Other curves (for example P-256 for secure element chips) may be added later through the standards process.
- **Every device makes its own keys** on the device, from a proper random source. Keys are never shared between devices, built into firmware images, or committed to a repo.
- Private keys never leave the device unless a standard says how (for example backup).

## 3. Languages by layer

| Layer | Language | Why |
|---|---|---|
| Microcontroller firmware (OASA's own) | **Rust** (Embassy where it fits) | Memory-safe, no garbage collector, runs on STM32, nRF, RP2040, ESP32 |
| Changes to upstream projects (PX4, ArduPilot) | **Their language** (C/C++) | Contribute upstream in the form they accept |
| OASA C code that can't be Rust yet | **C**, small and audited libraries only | Must have tests, static analysis and a plan to move to Rust |
| Companion computers, ground tools | **Rust** for anything security-critical; **Python** for tools | Python is memory-safe and fast to write |
| Security prototypes | **Rust** | The prototype grows into the real code instead of being rewritten |
| Scripts, test harnesses, quick experiments | **Python** | Fastest to write; never for crypto in a release |
| Web | **TypeScript** | Matches the website stack |

CISA and the NSA recommend memory-safe languages to remove a whole class of security bugs. New security-critical OASA code should be in a memory-safe language unless there's a written reason.

## 4. Repos

- **One repo per project that ships on its own**, not one per node. Nodes that share code share a repo.
- A project gets its own repo when it has its own releases, its own security level, or its own team.
- Contract and government work lives in a separate private organization, never in `joinoasa`.
- Every repo has: `README.md`, `LICENSE`, `SECURITY.md`, `AGENTS.md` (with `CLAUDE.md` importing it), and a short `docs/` folder.

## 5. Writing and reviewing code

- All changes go through a **pull request** with at least one review. Security code needs a reviewer who didn't write it.
- **Signed commits** on official projects.
- **CI runs on every pull request:** build, tests, lint, and secret scanning.
- **Dependabot** security updates on, and the **OpenSSF Scorecard** action on every official repo.
- **Dependency gates in CI** for Rust: `cargo deny` (licenses, banned crates, duplicate and yanked crates, known vulnerabilities) and `cargo audit` against the RustSec database. A failing gate blocks the merge.
- Lock files (`Cargo.lock`) are committed, and CI builds with `--locked`.
- "Protect main" ruleset: pull request required, CI must pass.
- Commit email: your GitHub no-reply address.

## 6. Testing

- Tests ship with the code. Crypto and protocol code also needs **known-answer test vectors** and tests for broken or hostile input.
- **Simulate before flying.** Anything that moves a vehicle is tested in SITL (PX4 or ArduPilot) first.
- Hardware tests follow the field test plan and safety checklist.

## 7. Releases and updates

Follow the [update standard](../update-standard/). In short:

- Built in CI from a tagged commit, reproducibly (`--locked`, `SOURCE_DATE_EPOCH`).
- Published as a GitHub **immutable release** with **artifact attestations** (SLSA Build Level 2 to start) and a **software bill of materials** (SBOM).
- Signed with OASA's update keys (TUF roles), and checked on every device before install.
- Version numbers: major = breaking, minor = compatible additions, patch = fixes.

## 8. Firmware on boards

- **Secure boot:** boards only run firmware signed by the project's key: embassy-boot or MCUboot for OASA firmware, and PX4's or ArduPilot's secure bootloader on flight controllers, with OASA keys replacing any test keys.
- **Safe updates:** trial boot, health check, then confirm; otherwise revert. Anti-rollback blocks downgrades to versions with known holes.
- **Key storage:** private keys stored where the board can protect them (secure storage, or a secure element once one supports OASA's curves).
- **Debug ports locked** on release builds where the hardware allows (for example nRF AP-Protect), and flash encryption on where secure boot depends on it (for example ESP32).

## 9. Vulnerabilities

- Report privately through the repo's security policy (private vulnerability reporting on).
- Security council triages; fix, release, then publish a short blameless write-up.
- A dependency with a known exploited vulnerability blocks the release until it's fixed or removed.

## 10. Using AI

Members are encouraged to use AI to write code and docs. AI-written code gets the same review, tests and security rules as any other code. The person who opens the pull request is responsible for it.

---

## Changing this standard

v1.0 is locked. Changes follow [governance](../governance/):

- **Fixes** (typos, links, clearer wording): a pull request approved by the founder (later the Technical council).
- **Rule changes:** an OASA Proposal, open for about two weeks, then decided and published with the reasons.
- **Section 1 (encrypted, always)** is a core principle: changing it follows the foundational process, and the founder keeps a veto.
