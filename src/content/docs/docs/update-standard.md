---
title: Update standard
description: How OASA signs, serves and installs software and firmware updates, and how hardware revisions are released.
lastUpdated: 2026-10-23
---

**Version:** 1.0 · **Status:** Adopted 2026-10-23 · **Owner:** founder (Technical council later) · **Changes:** see [Changing this standard](#changing-this-standard)

How every OASA project ships updates: software, firmware, and new hardware revisions. It builds on proven open work: [The Update Framework (TUF)](https://theupdateframework.io/) for signing, [Uptane](https://uptane.org/) for vehicles, and the secure bootloaders PX4, ArduPilot and MCUboot already ship.

Companion pages: [Software standard](../software-standard/), [Adopting software](../adopting-software/), [Software register](../software-register/).

---

## 1. Rules

1. **Every update is signed, and every device checks it.** No signature, no install. A checksum (CRC) is not a signature.
2. **People decide when to install.** A vehicle only installs when it is **landed and disarmed**, has enough battery, isn't on a mission, and an operator has approved it. Nothing installs in the air or underway.
3. **Never leave a device dead.** Every update can fail safely: the old version keeps running until the new one has booted and passed its checks. Otherwise it goes back automatically.
4. **No silent downgrades.** Devices refuse older versions, so an attacker can't push back a version with a known hole. Going back on purpose needs a signed rollback release.
5. **Offline first.** Updates must work with no internet: from a ground station's cache, over the mesh, or from a USB stick.
6. **Hosts are not trusted.** Signatures are checked on the device, so any server, mirror or USB stick can carry updates without being trusted.

## 2. Who signs (trust model)

OASA uses TUF's four roles, so no single stolen key can push a bad update.

| Role | Signs | Key kept | Threshold | Expires |
|---|---|---|---|---|
| **Root** | Which keys may sign for each role | **Offline**, on hardware security keys, held by different Core members | 2 of 3 | 1 year |
| **Targets** | The list of release files and their hashes. Delegates each project to its own key | Offline or in a hardware key, per project lead | 1 per project (2 for security projects) | 3 months |
| **Snapshot** | Which version of every targets file is current | CI, separate key | 1 | 1 week |
| **Timestamp** | That the snapshot is fresh | CI, online | 1 | 1 day |

- **Signatures:** Ed25519, matching OASA's crypto rules and the PX4 and ArduPilot bootloaders.
- **Root key rotation:** a new root is signed by both the old and the new root keys, as TUF requires.
- Until there are three Core members, the founder holds root keys on two hardware keys stored in different places.

## 3. On the vehicle

OASA follows Uptane's model: one capable device checks everything, then feeds the smaller ones.

- **Primary** (the companion computer, or the ground station for vehicles without one) downloads updates, runs **full TUF verification**, and checks the install rules (section 1).
- **Secondaries** (flight controller, ESCs, radios, payloads) get images only from the primary, and their own bootloader checks the signature again wherever it can.
- Every device reports what it's running, and the versions show on the shared map (TAK), so an operator can see the whole fleet's versions in one place.

| Part | Use | Notes |
|---|---|---|
| OASA Rust firmware | **embassy-boot** with Ed25519 | Power-fail-safe swap; trial boot, then confirm or revert |
| Other microcontroller firmware | **MCUboot** | Ed25519 signatures, test-then-confirm, hardware anti-rollback counter, optional encryption with X25519 key wrap |
| PX4 flight controllers | **PX4 secure bootloader** | Ed25519 (Monocypher). Replace PX4's public test key with the project's own key before flight |
| ArduPilot flight controllers | **ArduPilot secure firmware** | Signed bootloader (Monocypher). Follow ArduPilot's signing steps exactly: mistakes can make the board unusable |
| Linux companion computers | **RAUC**, verity bundles | A/B slots, signed bundles, installs from a local file; version 1.15.2 or later |
| DroneCAN nodes, ESCs (AM32, Bluejay), radios (ExpressLRS, Meshtastic) | Only through the primary | These have no signature check of their own today. The primary checks the OASA signature first. Adding signing upstream is open work |

**After every install:** the device boots the new version on trial, runs a health check (it starts, talks on its links, sensors read sane), and only then confirms. A failed check reverts on the next boot.

## 4. Building a release

1. Build in CI from a tagged commit: `cargo build --release --locked`, with `SOURCE_DATE_EPOCH` set, so anyone can rebuild and get the same file.
2. Gate the build: tests pass, `cargo deny` (licenses, banned crates, known vulnerabilities) and `cargo audit` are clean.
3. Make a software bill of materials (SBOM): `cargo auditable` embeds the dependency list in the binary, and a CycloneDX SBOM ships beside it.
4. Publish a GitHub **immutable release** (files and tag are locked once published) with **artifact attestations**.
5. The project lead signs the targets metadata; CI refreshes snapshot and timestamp.
6. Write release notes: what changed, which hardware revisions it supports, and whether it is a **security update**.

Versions follow semantic versioning (major = breaking, minor = compatible additions, patch = fixes). The anti-rollback counter only goes up on security updates, so people can still move between compatible versions.

## 5. Serving updates

| Where | Use | Limits |
|---|---|---|
| **GitHub Releases** | Main home for every release | Each file under 2 GiB; no stated bandwidth limit |
| **Cloudflare R2** | Mirror for fleets and large files | Free tier 10 GB stored; no charge for downloads |
| **Ground station cache** | Field mirror: downloads when online, serves vehicles over Wi-Fi or the mesh | A partial TUF mirror, listed in the signed mirror list |
| **USB stick** | Air-gapped sites | A signed snapshot of the repository; checked like any other mirror |

- The website's static hosting (25 MiB per file) is for metadata and small files only.
- **Low-bandwidth links (LoRa) are not for firmware.** At 1 kbps, 1 MB takes over 2 hours. Use them only for update notices and small signed config; move images over Wi-Fi, cable or USB.
- Devices carry a recent copy of the metadata and a trusted time source, so they can detect stale or frozen updates while offline.

## 6. Security updates

- Marked **security** in the release notes and metadata. The ground station highlights them and won't let them be skipped silently.
- They still follow the install rules: an operator approves, and vehicles are landed and disarmed.
- If a signing key is lost or stolen: rotate it through root (section 2), publish a security notice, and re-sign current releases. A lost PX4 bootloader key means the board needs a debug probe to recover, so keep a backup of every bootloader key in a second hardware key.

## 7. Hardware revisions

Hardware can't be pushed over the air, so a hardware "update" is a new **revision** with its own release.

- **Naming:** `<board>-<rev>` with a letter, for example `relay-node rev B`. The revision is printed on the board (silkscreen) and in its files.
- **Each revision is a release:** design files in their editable format, BOM, assembly guide, test results, and which firmware versions it supports. Old revisions stay published.
- **Change notice** for every revision (a short form in the repo):
  - what changed, and why
  - compatibility: does it fit, mount, connect and work the same as the last revision (form, fit, function)?
  - which documents, firmware and parts are affected
  - from when it applies, and who approved it
  - the modification date and summary that CERN-OHL requires
- **Hardware BOM:** a CycloneDX file listing parts (as devices) and firmware, with U.S. sources marked and end-of-life parts flagged.
- **Firmware compatibility:** every firmware release lists the hardware revisions it supports, and refuses to install on others.

## 8. Safety notices

When a design or part can hurt someone or damage property (a battery that overheats, a connector that fails):

1. Post a **safety notice** within one day of confirming the problem: announcements channel, joinoasa.org, the project repo, and the newsletter.
2. Say exactly which units are affected: board and revision, serial or date codes, and photos.
3. Say what to do now (stop using, disconnect the battery) and the fix (repair, replacement part, or new revision).
4. Keep the notice up, and flag affected revisions and firmware on the tree and in release notes.
5. If OASA or the company **sold** the product, U.S. law (Consumer Product Safety Act, section 15(b)) may require reporting to the CPSC. Talk to the attorney the same day.

---

## Changing this standard

v1.0 is locked. Changes work like the [governance](../governance/) rules:

- **Fixes** (typos, broken links, clearer wording): a pull request approved by the founder (later the Technical council).
- **Rule changes:** an OASA Proposal, open for about two weeks, then decided and published with the reasons.
- **Rules 1 and 2 in section 1** (signed always; people decide when to install) are core safety principles. Changing them follows the foundational process, and the founder keeps a veto.

The detailed metadata and message formats will be published as the **OASA-UPDATE** spec and go through the normal [standards](../standards/) stages, starting with a prototype.
