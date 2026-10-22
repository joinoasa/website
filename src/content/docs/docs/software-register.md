---
title: Software register
description: Every outside project OASA uses or is evaluating, with its license, status and reason.
lastUpdated: 2026-10-22
---

**Status:** Living list · **Owner:** founder (Technical council later) · **Last reviewed:** 2026-10-22

How entries are chosen: [Adopting software](../adopting-software/). Statuses: **Adopted**, **Trial**, **Prototype only**, **Watch**, **Rejected**. *(verify)* means a detail still needs checking before the entry moves to Adopted.

---

## Security and identity (R-SEC1, R-COM2)

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [Noise Protocol Framework](https://noiseprotocol.org) | Handshake design (spec) | Public domain spec | **Adopted** | Pairing and link handshakes | Used by WireGuard, Lightning, WhatsApp |
| [MAVLink 2 signing](https://mavlink.io/en/guide/message_signing.html) | Message authentication | MIT (MAVLink) | **Adopted**, inside encryption only | Second layer on drone links | Authentication only; messages stay readable. Spec says keys go only over a secure link |
| [PX4 signing](https://docs.px4.io/main/en/mavlink/message_signing.html) | Signing in PX4 | BSD-3 | **Adopted**, inside encryption only | PX4 drones | First key is accepted unsigned on any link; key file on the SD card |
| [ArduPilot signing](https://ardupilot.org/dev/docs/common-MAVLink2-signing.html) | Signing in ArduPilot | GPL-3.0 | **Adopted**, inside encryption only | ArduPilot drones | USB stays unsigned; Mission Planner makes keys from a passphrase |
| [libsodium](https://libsodium.org) | Crypto library | ISC | **Trial** | Linux companion computers and ground tools | Widely used and maintained |
| [Monocypher](https://monocypher.org) | Small crypto library in C | CC0 or BSD-2 | **Trial** | Small boards where Rust isn't ready | Under 2000 lines, under 50KB |
| [Noise-C](https://github.com/rweather/noise-c) | Noise in C | MIT | **Trial** | C fallback; ESP32 port exists | Reference implementation |
| [snow](https://github.com/mcginty/snow) | Noise in Rust | Apache-2.0 or MIT | **Trial** | R-SEC1 prototype; Rust firmware and companion code | Independent audit by Trail of Bits, funded by 1Password *(verify report and fixes)* |
| [noiseprotocol](https://pypi.org/project/noiseprotocol/) | Noise in Python | MIT | **Watch** | Not used; the prototype is in Rust | Author says not for production yet; last release 2020 |
| [dissononce](https://pypi.org/project/dissononce/) | Noise in Python | MIT | **Watch** | Not used; the prototype is in Rust | Written as a readable reference |
| [pymavlink](https://mavlink.io/en/mavgen_python/) | MAVLink in Python | LGPL-3.0 (generated code is MIT) | **Trial** | Prototype and ground tools | Has built-in signing setup; use as a library, don't copy code in |

## Firmware and boards

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [Embassy](https://embassy.dev) | Rust framework for microcontrollers | Apache-2.0 or MIT | **Trial** | OASA firmware | STM32, nRF, RP2040, ESP32; fail-safe bootloader |
| [ATECC608](https://www.microchip.com/en-us/product/atecc608b) | Secure element chip | Hardware | **Watch** | Key storage on boards | Uses P-256; we're X25519-only for now |

## Networks (later nodes)

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [Meshtastic](https://meshtastic.org) | LoRa mesh | GPL-3.0 | **Watch** | T-NET5 bridge | Had a 9.5 CVSS key-reuse CVE; lesson: devices make their own keys |
| [Reticulum](https://reticulum.network) | Encrypted mesh stack | Reticulum License *(verify terms)* | **Watch** | T-NET1 candidate | Still beta; license needs review before use |

## Development tools

| Project | What it does | License | Status | Used for | Notes |
|---|---|---|---|---|---|
| [OpenSSF Scorecard](https://scorecard.dev) | Rates a project's security habits | Apache-2.0 | **Adopted** | Checking dependencies and our own repos | GitHub Action available |
| GitHub Dependabot | Security updates | GitHub service | **Adopted** | All repos | Already on for website and techtree |
| [GitHub artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations) | Signed build records (Sigstore) | GitHub service | **Adopted** | Releases | Gives SLSA Build Level 2; free for public repos |

## Rejected

| Project | Reason |
|---|---|
| [MAVSec](https://github.com/aniskoubaa/mavsec) | Research code; includes RC4, which is broken |
| MAVShield and other new ciphers from papers | New, unreviewed ciphers; OASA uses proven building blocks only |
