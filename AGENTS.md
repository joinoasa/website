# AGENTS.md: working in the OASA website repo

Read by AI coding agents (Claude Code, Codex, Cursor and others) and useful for people too. This repo is [joinoasa.org](https://joinoasa.org): the site, the docs and the **tech tree source**.

**Start here:** [Building with AI agents](https://joinoasa.org/docs/agents/) (source: `src/content/docs/docs/agents.md`) holds the rules every OASA repo shares; this file adds to them and never loosens them. `oasa.toml` lists setup and the checks; `python3 tools/oasa-files/oasa_toml.py run --markdown` runs them. Paste the table into the pull request.

## How OASA thinks

Dream big, ship small. People first, secure always (every link encrypted), open by default, integrate before building, built to last, everything on one shared map (TAK). Read the [core values](https://github.com/joinoasa/brand/blob/main/documents/core-values/core-values.md) once. Writing style everywhere: **short, clear, not wordy.**

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install (Node 22) |
| `npm run techtree` | Build `src/data/techtree.json` (and `ideas.json`) from the tree source |
| `npm run techtree:sync -- --write` | Regenerate the Unlocks column after editing Requires |
| `npm run build` | Tree data + full site build. Run before every pull request |
| `npm run dev` | Local dev server |

`TECHTREE_GITHUB=1 npm run techtree` also pulls live node status and ideas from GitHub (Actions does this automatically). Without it, builds stay offline.

## Changing the tech tree

- **Source of truth:** `source/OASA-techtree.md`. Briefs, leads and GitHub links: `source/techtree-details.json`.
- **Edit Requires, never Unlocks.** Then run `npm run techtree:sync -- --write`. Status 🟢/🔒 is computed; set 🟡/✅ only by hand.
- **Requires syntax:** commas = all needed; `A or B` = either; `two of A/B/C` = any two; a note may follow an ID in parentheses.
- **IDs:** never renumber or reuse. A new node takes the highest number in its prefix + 1. Trunk nodes join a family (`T-DOCK3` after `T-DOCK2`).
- **Every new node** gets a one- or two-sentence brief in `techtree-details.json` (`github: null` until its issue exists).
- **Government sections** (headings containing "Government") are left off the public site. Don't move them or link to them from public pages.
- **Where ideas come from:** most tree changes start as an idea in [joinoasa/ideas](https://github.com/joinoasa/ideas). Follow its [TRIAGE.md](https://github.com/joinoasa/ideas/blob/main/TRIAGE.md), and name the idea (IDEA-0042) in the pull request.
- After a tree change merges, the daily sync in [joinoasa/techtree](https://github.com/joinoasa/techtree) creates the new node issues.

## Pull requests

- Work on a branch and open a pull request into `main`. `main` is protected: the `build` check must pass.
- One topic per pull request. Say what changed and what you checked.
- Don't commit generated files (`src/data/techtree.json`, `src/data/ideas.json`) or secrets. `.dev.vars` stays local.
- Page copy: plain words, short sentences, US English. Pages must work on phones and without JavaScript.

## Where things are

| Path | What |
|---|---|
| `src/pages/` | Pages (`techtree.astro`, `ideas.astro`, `moonshots.astro`…) and `data/*.json.ts` public data |
| `src/components/techtree/TreeMap.astro` | The interactive tree |
| `src/content/docs/docs/` | Docs pages, including `brainstorm.md` (the AI brainstorming guide) |
| `src/config/site.ts` | Links, nav, settings |
| `scripts/` | Tree build and sync, application tools, Discord setup |
| `worker/index.ts` | The only server code (`POST /api/apply`) |
| `public/llms.txt` | Pointer for AI tools |
