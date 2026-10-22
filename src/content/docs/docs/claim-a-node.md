---
title: Claim a tech tree node
description: How a member claims a tech tree node, what happens next, and how a claim ends.
lastUpdated: 2026-10-22
---

Every [tech tree](/techtree/) node has an issue in the [techtree repository](https://github.com/joinoasa/techtree/issues). Claiming a node tells everyone you are working on it, so effort isn't duplicated.

## Who can claim

Members at Trial level and above. Not a member yet? [Apply](/join/). Membership is open to adults (18+) for now.

You also need a GitHub account, and you need to be in the OASA GitHub organization. The founder invites you when your trial starts.

## Which nodes

Only nodes marked `status:available` can be claimed. A locked node needs other nodes finished first. Its issue lists what it needs. Start with one of those instead.

## How to claim

1. Open the node's issue (the tech tree links to it from every node).
2. Comment `/claim` as the first line.

That's all. If you want to say how you plan to start, add it on the lines below.

## What happens

- A workflow assigns the issue to you and changes its label to `status:in-progress`.
- It replies with next steps.
- The founder reviews claims during the founding phase and may ask you questions.
- The tech tree on this site shows the node as in progress and lists you on the team. The site rebuilds every night, so this can take up to a day.

If a claim is refused, the reply says why: you aren't a member yet, the node is locked, or someone already has it. Someone already working on a node? Offer to help in the issue and the lead can add you to the team.

## Keep it updated

Post a short update in the issue when you hit a milestone or get blocked. A sentence is enough. Blockers can become new opportunities on the tech tree.

## Letting go

Comment `/unclaim`. The workflow removes you, and if nobody else is on the node, it becomes available again. No hard feelings, plans change.

## Stale claims

If a claim has had no update for 30 days, a lead may ask whether you are still on it. With no answer, the lead may release the claim so someone else can pick it up. Your work stays public and can be forked.

## Done

A node is done when the work meets the [release standard](/docs/projects/#release-standard): a working build, docs someone else can follow, a bill of materials for hardware, test results, a security review for anything that communicates, and a training guide. A lead sets `status:done` and closes the issue, and the node counts as finished on the tech tree.

Starting a bigger project around a node? [Register it](/docs/projects/#registering-a-project).
