---
title: Building with AI agents
description: How members point an AI coding agent at OASA work, and the rules every agent follows.
lastUpdated: 2026-10-26
---

Members can build OASA with AI coding agents (Claude Code, Codex, Cursor and others). Every repo is set up the same way, so an agent can find work, set up, test and open a pull request without someone walking it through. **A person always reviews and merges.**

Not a member? Your agent can still read everything, help you [brainstorm an idea](/docs/brainstorm/) and post it to the [ideas inbox](/ideas/). Claiming work and opening pull requests is for [members](/join/).

## The loop

1. **Find a task.** Open [agent-ready tasks](https://github.com/search?q=org%3Ajoinoasa+label%3Aagent-ready+state%3Aopen&type=issues), or the [machine-readable list](/data/tasks.json). Each one is a **task card**: an issue with a fixed set of sections (below).
2. **Read three things:** the task card, the repo's `AGENTS.md`, and the repo's [`oasa.toml`](/docs/oasa-files/) (what the repo is, how to set it up, which checks must pass).
3. **Claim it.** Comment on the task that you're taking it. A lead assigns you. For a whole tech tree node, comment `/claim` on its [node issue](/docs/claim-a-node/).
4. **Set up.** Open the repo in its dev container, or run `python3 .oasa/oasa_toml.py setup`.
5. **Build on a branch.** Stay inside the card's scope.
6. **Run the checks:** `python3 .oasa/oasa_toml.py run --markdown` runs every required check in `oasa.toml` and prints a table for the pull request ([get the tool](/docs/oasa-files/#the-tool)).
7. **Open a pull request** with the repo's template filled in: the task it closes, what changed, the checks table, and links to evidence. List optional or skipped checks under "Not run".
8. **A person reviews and merges.** Agents never merge, and never push to `main`.

## Rules every agent follows

These hold in every OASA repo. A repo's own `AGENTS.md` adds to them and never loosens them.

1. **Encrypted, always.** Anything that communicates runs inside OASA-SEC. Signing alone is never the link.
2. **No new crypto math.** Use the libraries the [software standard](/docs/software-standard/) names.
3. **One topic per pull request.** Say what changed and what you checked.
4. **Evidence, not claims.** Only report a result you can point to: a check you ran, a lab bundle, a test file. Say plainly what you didn't run.
5. **Tests come with every change,** including hostile input for anything that communicates.
6. **Security code gets an independent review.** In repos with `security = "critical"` in `oasa.toml`, a reviewer who didn't write the code (an agent or a person) reviews it before the pull request, and a person reviews it before merge.
7. **No secrets anywhere:** not in code, logs, test results, issues or pull requests.
8. **New outside software** follows the [adoption standard](/docs/adopting-software/) and goes in the [register](/docs/software-register/). Permissive licenses only, unless an owner decision says otherwise.
9. **Say it was AI-assisted.** Tick the box in the pull request template. Commit with your GitHub no-reply email.
10. **Stay in scope.** If the card is wrong or the task is bigger than it looks, say so on the issue before building something else.
11. **Writing style:** short, clear, not wordy.

## Task cards

A task card is an issue made with the **Task** form in each code repo. Its sections:

| Section | What it says |
|---|---|
| Node | The tech tree node it serves |
| Goal | One or two sentences |
| Done when | Checks that prove it's finished, ideally runnable. Names exact fields and formats where a choice matters |
| Start here | Files, docs and commands to read first |
| Evidence | What the pull request must show (checks table, lab suite, numbers) |
| Out of scope | What not to touch |
| Size | Small (hours), medium (a day or two), large (split it first) |
| Needs | Hardware, access or decisions it waits on, including other OASA repos it needs built next to this one |

### Labels

| Label | Meaning |
|---|---|
| `agent-ready` | Scoped well enough for an agent to finish with no help beyond the card |
| `needs-hardware` | Needs real radios or vehicles; parts may still be done in simulation |
| `security-review` | Touches keys, the link or anything that communicates: independent review plus a person |
| `node:ID` | The tech tree node it serves (for example `node:R-COM2`) |

## For repo maintainers

Every code repo has: an `AGENTS.md`, an [`oasa.toml`](/docs/oasa-files/), a `.devcontainer/`, a pull request template, the Task form, and a CI job that validates `oasa.toml`. Start a new repo by copying them from [oasa-radio](https://github.com/joinoasa/oasa-radio).
