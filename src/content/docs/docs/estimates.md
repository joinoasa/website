---
title: How estimates work
description: Rough ranges of time, cost, lab time and field testing for every tech tree node, and how moonshots add them up.
lastUpdated: 2026-10-27
---

Every [tech tree](/techtree/) node has a **rough estimate**. Estimates help plan budgets, apply for grants, ask for the right donations and decide which [Academy](/docs/academy/) courses to write first.

**They are rough.** The first pass was drafted by AI from size tiers on 2026-10-27 and hasn't been reviewed by project leads yet. Treat them as a starting point to argue with, not a quote.

## What each estimate holds

| Field | Meaning |
|---|---|
| Hours | Volunteer hours to reach **done** under the [release standard](/docs/projects/#release-standard): a working build, docs, tests and review. Shown as low–high, with the likely value |
| Parts | Cost of parts for **one** working build, low–high |
| Lab | Hours of bench or lab time inside those hours |
| Field | Days of field or flight testing |
| Equipment | What it needs to borrow or book, such as a spectrum analyzer or a flight test range |
| Skills | The disciplines it needs, taken from the node's sciences |

Equipment uses one shared list across the tree, so it adds up: equipment many nodes need is equipment worth asking donors for.

## Moonshots

A moonshot's estimate is the sum over **every node still needed to reach it**: its key nodes, everything they require, and any moonshot it builds on. Nodes marked done count as zero. If some nodes have no estimate yet, the moonshot says how many.

Adding up ranges makes wide ranges. That's honest: a big project really is uncertain, and the range narrows as nodes are finished and estimates are refined.

## Sizes used for the first pass

| Size | Hours (low / likely / high) |
|---|---|
| XS | 20 / 40 / 80 |
| S | 40 / 100 / 200 |
| M | 100 / 250 / 500 |
| L | 250 / 600 / 1,200 |
| XL | 600 / 1,500 / 3,000 |
| XXL | 1,500 / 4,000 / 8,000 |

Parts fell into similar bands, from under $100 for software to $150k+ for a lab facility. The exact bands are in the estimates file.

## Improving an estimate

Estimates live in [`source/techtree-estimates.json`](https://github.com/joinoasa/website/blob/main/source/techtree-estimates.json), one line per node. To change one:

1. Edit the node's line in a pull request. Say what you based the change on (a parts list, a similar build, actual hours).
2. Add a short `basis` field when you've checked it, for example `"basis": "Reviewed by lead, BOM in oasa-radio#9"`.
3. When a node is finished, record the actual hours in the pull request that closes it. Real numbers are how the next estimate gets better.

Leads review the estimates for their nodes. Anyone can suggest a change.
