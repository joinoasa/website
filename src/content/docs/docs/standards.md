---
title: Standards
description: How OASA standards are made, versioned and certified.
lastUpdated: 2026-10-20
---

OASA adopts or extends existing standards (MAVLink, Cursor-on-Target (CoT), DroneCAN, ROS 2, Meshtastic) before writing new ones. Where no good standard exists, OASA publishes its own open spec. Standards use proven encryption methods; OASA defines how to apply them to drone links, not new encryption math.

## Stages

1. **Idea:** the Technical council accepts the proposal.
2. **Draft:** at least one working prototype.
3. **Candidate:** two independent implementations that work together.
4. **Security review:** passes red team and Security council review.
5. **Stable.**
6. **Deprecated:** a migration path is published.

## Every standard includes

Purpose and scope, the spec, a security section, an open reference implementation, a test suite, and a version and change log.

## Versioning

Major versions are breaking. Minor versions add compatible features. Old majors stay supported for a set period.

## People

A standard editor and a working group. The Technical council approves stages, and the Security council signs off before Stable. Anyone can comment on drafts. Members write them.

## Planned standards

| Standard | Covers |
|---|---|
| OASA-SEC | Encryption, pairing, keys |
| OASA-MAP | How systems appear on TAK |
| OASA-NET | Mesh networking and routing |
| OASA-PAY | Payload interface |
| OASA-LOG | Logs and black box data |
| OASA-TIME | Time sync |
| OASA-VID | On-demand video over mesh |
| OASA-DOCK | Dock, landing and charging |
| OASA-RF | Antenna and radio test procedures |
| OASA-SENSE | Low-power sensor nodes |

Build order for the first six: SEC, MAP, NET, PAY, LOG, TIME.

## Certification

- **OASA Compatible:** passes the test suite. The product may be proprietary.
- **OASA Open:** passes the test suite and is fully open.

Testing is free. Integration help from OASA is paid work through OASA Engineering.
