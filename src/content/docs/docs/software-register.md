---
title: Software register
description: Every outside project OASA uses or is evaluating, with its license, status and reason.
lastUpdated: 2026-10-23
---

**Status:** Living list (follows [Adopting software](../adopting-software/) v1.0) · **Owner:** founder (Technical council later) · **Last reviewed:** 2026-10-23

Statuses: **Adopted**, **Trial**, **Prototype only**, **Watch**, **Rejected**. *(verify)* means a detail still needs checking at the source before the entry moves up. Scorecard is the [OpenSSF Scorecard](https://scorecard.dev) score out of 10, checked 2026-10-19.

Unlike the standards, this list changes whenever we learn something. Project leads can add Trial, Watch and Prototype-only entries; Adopted and Rejected need the founder.

---

## Security and identity (R-SEC1, R-COM2)

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [Noise Protocol Framework](https://noiseprotocol.org) | Handshake design (spec) | Public domain spec | **Adopted** | Pairing and link handshakes | Used by WireGuard, Lightning, WhatsApp |
| [snow](https://github.com/mcginty/snow) | Noise in Rust | Apache-2.0 or MIT | **Trial** | [oasa-sec](https://github.com/joinoasa/oasa-sec) pairing and the link (stateless transport, our own counter as the nonce) | Trail of Bits review (funded by 1Password): 10 findings, 1 medium, 8 resolved. Latest 0.10.0 (July 2025) fixes nonce handling, possibly the medium finding *(verify against the report)*. Doesn't wipe its session state from memory. Scorecard 3.6 |
| [curve25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek) | X25519 math | BSD-3-Clause | **Trial** | oasa-sec public keys (already inside snow) | Quarkslab audit 2019, no critical issues; nothing newer found. We use 4.1 through snow; 5.0 is out |
| fiat-crypto, r-efi | Pulled in by crypto and random-number crates | Dual-licensed; we use them under MIT or Apache-2.0 | **Trial** (indirect) | oasa-sec | `cargo deny` checks every indirect dependency's license |
| [MAVLink 2 signing](https://mavlink.io/en/guide/message_signing.html) | Message authentication | MIT (MAVLink) | **Adopted**, inside encryption only | Second layer on drone links | Authentication only; messages stay readable. Keys only over a secure link |
| [PX4 signing](https://docs.px4.io/main/en/mavlink/message_signing.html) | Signing in PX4 | BSD-3 | **Adopted**, inside encryption only | PX4 drones | First key accepted unsigned on any link; after that, unsigned key changes are refused. Tested with oasa-sec in PX4 SITL (Oct 2026) |
| [ArduPilot signing](https://ardupilot.org/dev/docs/common-MAVLink2-signing.html) | Signing in ArduPilot | GPL-3.0 | **Adopted**, inside encryption only | ArduPilot drones | **SERIAL0 (normally USB) is always trusted:** it accepts unsigned commands, and an unsigned key change there replaces the key. Connect companions on SERIAL1 or higher and protect SERIAL0 physically. Refuses signed commands for up to a minute after a reboot. Tested with oasa-sec in ArduPilot SITL (Oct 2026) |
| [WireGuard](https://www.wireguard.com/protocol/) | Encrypted tunnel (design) | GPL-2.0 (kernel code); paper public | **Adopted** (design only) | The R-COM2 link: indexes, timestamps, `mac1`, rekey and stale rules | We follow the design, not the code. Its cookie reply isn't in v0 yet |
| [rust-mavlink](https://github.com/mavlink/rust-mavlink) | MAVLink in Rust | MIT or Apache-2.0 | **Trial** | oasa-sec | 0.20.0 (Oct 2026) has a signing feature. Scorecard 4.9 |
| [pymavlink](https://github.com/ArduPilot/pymavlink) | MAVLink in Python | LGPL-3.0 (generated code MIT) | **Trial** | Tests and ground tools | **Defaults to MAVLink 1, which can't be signed:** set `MAVLINK20=1`. Use as a library only. Scorecard 5.2 |
| [libsodium](https://libsodium.org) | Crypto library | ISC | **Trial** | Linux companion computers, ground tools | Scorecard 6.9 |
| [Monocypher](https://monocypher.org) | Small crypto library in C | CC0 or BSD-2 | **Trial** | C on small boards; also inside PX4 and ArduPilot bootloaders | Under 2000 lines. Scorecard 3.5 |
| [Noise-C](https://github.com/rweather/noise-c) | Noise in C | MIT | **Trial** | C fallback; ESP32 port exists | Reference implementation. No Scorecard found |
| [noiseprotocol](https://pypi.org/project/noiseprotocol/), [dissononce](https://pypi.org/project/dissononce/) | Noise in Python | MIT | **Watch** | Not used | noiseprotocol's author says not for production; last release 2020 |

## Updates ([update standard](../update-standard/))

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [TUF](https://theupdateframework.io) | Update signing framework (spec) | Spec | **Adopted** | Trust model for all updates | Spec 1.0.37 (Oct 2026). CNCF graduated. Ed25519 supported |
| [Uptane](https://uptane.org) | TUF for vehicles (spec) | Spec | **Adopted** (design) | Primary/secondary model on vehicles | Standard 2.1.0 (June 2023), Linux Foundation JDF. Its reference implementation is obsolete |
| [tough / tuftool](https://github.com/awslabs/tough) | TUF client and signing tool in Rust | Apache-2.0 or MIT | **Trial** | Ground stations and companions; signing releases | No audit found; doesn't run on microcontrollers |
| [python-tuf](https://github.com/theupdateframework/python-tuf) | Reference TUF in Python | *(verify)* | **Watch** | Tooling | |
| [aktualizr](https://github.com/advancedtelematic/aktualizr) | Uptane client in C++ | MPL-2.0 | **Rejected** | | Archived May 2024 |
| [PX4 secure bootloader](https://docs.px4.io/main/en/advanced_config/bootloader_secure_boot.html) | Signed firmware on PX4 boards | BSD-3 | **Adopted** | PX4 flight controllers | Ed25519 via Monocypher. Ships with a **public test key that must be replaced**. Lost key = debug probe to recover |
| [ArduPilot secure firmware](https://ardupilot.org/dev/docs/secure-firmware.html) | Signed bootloader | GPL-3.0 | **Adopted** | ArduPilot flight controllers | Monocypher. Steps must be followed exactly or the board can be made unusable |
| [embassy-boot](https://embassy.dev/book/dev/bootloader.html) | Rust bootloader | Apache-2.0 or MIT *(verify)* | **Trial** | OASA Rust firmware | Ed25519 only (`ed25519-salty` recommended); power-fail-safe swap; nRF52, STM32, RP2040 |
| [MCUboot](https://github.com/mcu-tools/mcuboot) | Secure bootloader in C | Apache-2.0 | **Trial** | Boards needing hardware anti-rollback or encryption | Ed25519, test-then-confirm, hardware security counter, X25519 key wrap. Zephyr, NuttX, Mynewt |
| [RAUC](https://rauc.io) | A/B updates for embedded Linux | LGPL-2.1 | **Trial** | Linux companion computers | No server needed; local files; X.509 signing with HSM support. **Use 1.15.2 or later and verity bundles** (CVE-2026-34155) |
| [SWUpdate](https://github.com/sbabic/swupdate) | Embedded Linux updates | GPL-2.0 *(verify)* | **Watch** | | Delta updates via zchunk. CVE-2025-41259 fixed in 2026.05 |
| [Mender](https://github.com/mendersoftware/mender) | Embedded Linux updates with server | Client Apache-2.0; server partly paid | **Watch** | | Delta updates are Enterprise-only |
| [OSTree / bootc](https://ostreedev.github.io/ostree/) | Image-based Linux updates | LGPL-2.0+ | **Watch** | Container-style fleets | |
| [cargo-deny](https://github.com/EmbarkStudios/cargo-deny) | License, ban and advisory checks | Apache-2.0 or MIT | **Adopted** | CI on every Rust repo | |
| [cargo-audit / RustSec](https://github.com/RustSec/advisory-db) | Known-vulnerability checks | Apache-2.0 or MIT; database public domain | **Adopted** | CI on every Rust repo | |
| [cargo-auditable](https://github.com/rust-secure-code/cargo-auditable) | Dependency list inside binaries | Apache-2.0 or MIT | **Adopted** | Release builds | Lets anyone audit a shipped binary |
| [cargo-cyclonedx](https://github.com/CycloneDX/cyclonedx-rust-cargo) | CycloneDX SBOM | Apache-2.0 | **Trial** | Release SBOMs | *(verify maintenance)* |
| GitHub immutable releases | Locked release files and tags | GitHub service | **Adopted** | All releases | Files under 2 GiB |
| [Cloudflare R2](https://developers.cloudflare.com/r2/pricing/) | Object storage | Service | **Adopted** | Update mirror | Free tier 10 GB; no download charges |

## Firmware and boards

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [Embassy](https://embassy.dev) | Rust framework for microcontrollers | Apache-2.0 or MIT | **Trial** | OASA firmware | STM32, nRF, RP2040, ESP32. Scorecard 4.8 |
| Secure elements | Hardware key storage | Hardware | **Watch** | Key storage on boards | ATECC608 and TA100 list NIST curves only, no X25519. NXP SE050 lists Montgomery and Edwards curves *(verify X25519/Ed25519)* |

## Networks (later nodes)

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [Meshtastic](https://meshtastic.org) | LoRa mesh | GPL-3.0 | **Watch** | T-NET5 bridge | 9.5 CVSS key-reuse CVE taught us: devices make their own keys. Firmware updates aren't signed |
| [Reticulum](https://reticulum.network) | Encrypted mesh stack | Reticulum License | **Watch**: not adoptable as a standard | Ideas for T-NET1 | License bars use in any system able to harm people, and in AI training data. Still beta |

## Test lab ([oasa-lab](https://github.com/joinoasa/oasa-lab))

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [pytest](https://docs.pytest.org) | Test runner | MIT | **Adopted** | Every lab suite; JUnit output | One command for people and agents |
| [pytest-json-ctrf](https://github.com/infopulse/pytest-common-test-report-json) | CTRF results from pytest | MIT | **Trial** | `results.ctrf.json` in each evidence bundle | |
| [CTRF](https://ctrf.io) | Common test report format (spec) | MIT | **Adopted** | Test results in evidence | |
| pcap (libpcap file format) | Packet captures | Open format | **Adopted** | Captures of simulated radio traffic | Written by the lab itself (about 40 lines); opens in Wireshark |
| [labgrid](https://labgrid.readthedocs.io) | Lab hardware control | LGPL-2.1 | **Watch** | Hardware tiers (M3+) | Check the license before adopting |
| [SigMF](https://sigmf.org) | Radio recording format | CC0 spec; tools Apache-2.0 | **Watch** | Radio captures (M3+) | |
| [cosign](https://github.com/sigstore/cosign) | Signing | Apache-2.0 | **Watch** | Signing evidence with our key (M5) | |
| tc / netem | Linux network impairment | GPL-2.0 | **Rejected** for L1 | | Needs root and Linux, and isn't repeatable from a seed |

## Development tools

| Project | What it does | License | Status | Used for |
|---|---|---|---|---|
| [OpenSSF Scorecard](https://scorecard.dev) | Rates a project's security habits | Apache-2.0 | **Adopted** | Our dependencies and our own repos |
| GitHub Dependabot | Security updates | GitHub service | **Adopted** | All repos |
| [GitHub artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations) | Signed build records (Sigstore) | GitHub service | **Adopted** | Releases (SLSA Build Level 2); lab evidence bundles in CI |

## Gaps: upstream projects with unsigned updates

These are widely used and fine to use, but their updates have no signature check, so OASA installs them only through a primary that checks OASA's signature first. Adding signing upstream is open work for members.

| Project | How it updates today |
|---|---|
| [DroneCAN](https://dronecan.github.io) firmware update | File server; CRC-64 only |
| [AM32](https://github.com/am32-firmware/AM32), [Bluejay](https://github.com/bird-sanctuary/bluejay) ESC firmware | Configurator or passthrough; no signing |
| [ExpressLRS](https://www.expresslrs.org) | Passthrough, UART or Wi-Fi (shared default password); no signing |
| [Meshtastic](https://meshtastic.org) | BLE, Wi-Fi or USB; no signing |
| [MAVLink FTP](https://mavlink.io/en/services/ftp.html) | CRC32 only; not a delivery path for firmware without a signature layer |

## Rejected

| Project | Reason |
|---|---|
| [MAVSec](https://github.com/aniskoubaa/mavsec) | Research code; includes RC4, which is broken |
| MAVShield and other new ciphers from papers | New, unreviewed ciphers; OASA uses proven building blocks only |
| [aktualizr](https://github.com/advancedtelematic/aktualizr) | Archived; no longer maintained |
