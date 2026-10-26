---
title: OASA-FILES
description: Shared file formats people and AI tools read the same way. Part 1, the repo manifest (oasa.toml).
lastUpdated: 2026-10-26
---

**Stage:** Draft · **Node:** [T-FILES1](/techtree/#T-FILES1) · From [IDEA-0110](https://github.com/joinoasa/ideas/issues/110)

Every OASA project keeps its files in the same shapes, so a person or an AI tool can read, reuse and compare any project's work without learning it first. Existing formats come first; OASA-FILES defines only the glue.

| Part | Covers | Status |
|---|---|---|
| 1. Repo manifest (`oasa.toml`) | What a repo is, how to set it up, which checks must pass | Draft (this page) |
| 2. Bill of materials | One CSV/JSON layout: part, quantity, supplier, price, alternates | Planned, starting with the reference quad |
| 3. CAD metadata | STEP alongside native files, plus a small file per part | Planned |
| 4. Test results | CTRF, as the [lab](https://github.com/joinoasa/oasa-lab) already writes | Planned |
| 5. Logs | [OASA-LOG](/techtree/#T-LOG1) | Planned |

## Part 1: the repo manifest

Every OASA repo has an `oasa.toml` at its root. It answers what an agent or a new member asks first: what is this, which tech tree nodes does it serve, how do I set it up, what must pass before a pull request, and how careful must the review be.

### Example

```toml
oasa = "files/0"

[project]
name = "oasa-sec"
summary = "Device identity, encrypted pairing and the encrypted link"
repo = "https://github.com/joinoasa/oasa-sec"
license = "Apache-2.0"
nodes = ["R-SEC1", "R-SEC2", "R-COM2"]
standards = ["OASA-SEC"]
docs = ["README.md", "AGENTS.md", "docs/oasa-sec-v0-link.md"]

[review]
security = "critical"

[setup]
container = ".devcontainer/devcontainer.json"
tools = ["rust >= 1.89", "python >= 3.11"]
steps = ["cargo build --locked --bins --examples"]

[[check]]
name = "fmt"
run = "cargo fmt --check"

[[check]]
name = "test"
run = "cargo test --locked"

[[check]]
name = "e2e"
run = "scripts/e2e.sh"
needs = ["pymavlink"]

[[lab]]
suite = "l1-oasa-link"

[hardware]
needed = false
optional = ["2× Heltec LoRa V3", "RTL-SDR V4L"]
```

### Fields

| Field | Required | Meaning |
|---|---|---|
| `oasa` | yes | Format version: `"files/0"` |
| `project.name` | yes | Repo name |
| `project.summary` | yes | One line |
| `project.repo` | yes | GitHub URL |
| `project.license` | yes | SPDX id |
| `project.nodes` | yes | Tech tree node IDs it serves (may be empty) |
| `project.standards` | no | OASA standards it implements: names from the [standards page](/docs/standards/). The tool doesn't check the list |
| `project.docs` | no | Files to read first; each must exist |
| `review.security` | yes | `critical` (keys, the link or anything that communicates: independent review plus a person), `standard` (a person reviews), or `light` (docs and simulations) |
| `review.leads` | no | GitHub logins of the leads who review |
| `setup.container` | no | Dev container file; must exist |
| `setup.tools` | no | What the setup needs, in words |
| `setup.steps` | no | Commands run once, in order, from the repo root. The dev container runs them for you |
| `check` | yes, one or more | Checks that must pass before a pull request |
| `check.name` | yes | Short, unique |
| `check.run` | yes | Shell command. Runs from the repo root, or from `check.dir` |
| `check.dir` | no | Working directory, relative to the repo root; must exist |
| `check.required` | no | Default `true`. `false` means run it if you can |
| `check.needs` | no | What it needs beyond setup, in words (a Python package, a binary from another repo) |
| `check.env` | no | Environment variables for the command |
| `check.repos` | no | Other OASA repos it needs, by name (`["oasa-sec"]`). They must sit next to this one (see below). If one is missing, the check is skipped (optional) or fails (required) without running |
| `lab` | no | [oasa-lab](https://github.com/joinoasa/oasa-lab) suites that test this repo: `suite`, and `hardware = true` if the suite needs real hardware for a full result. It may still run on the simulated bench; say so in its check's `env` (for example `OASA_LAB_SIM = "1"`) |
| `hardware.needed` | no | `true` if the repo can't be worked on without hardware |
| `hardware.optional` | no | Hardware for the hardware tests |

### Siblings and tools

**Repos sit next to each other.** Clone every OASA repo into the same parent folder (`~/oasa/oasa-sec`, `~/oasa/oasa-lab`, …). A check that lists `repos = ["oasa-sec"]` finds it at `../oasa-sec`, built as that repo's own `oasa.toml` says. The tool sets `OASA_ROOT_OASA_SEC` (name upper-cased, `-` becomes `_`) to the absolute path, so the command doesn't hardcode it.

**Python tools live in `.venv`** at the repo root, created by `setup.steps`. Checks call them by path (`.venv/bin/pytest`), because `run` uses the caller's `PATH`.

Unknown fields are warnings, so newer files still load in older tools. A new major version (`files/1`) is needed to remove or change a field.

### The tool

`oasa_toml.py` is one Python file (3.11+, standard library only):

```sh
curl -fsSLO https://raw.githubusercontent.com/joinoasa/website/main/tools/oasa-files/oasa_toml.py
python3 oasa_toml.py check            # validate oasa.toml (CI runs this)
python3 oasa_toml.py show             # print setup steps and checks
python3 oasa_toml.py run --markdown   # run every required check, print a table for the pull request
```

`run` runs the required checks in order (add `--all` for optional ones and `--setup` to run setup steps first), keeps going after a failure, writes `oasa-checks.json`, and exits 1 if any required check failed. Paste its table into the pull request. With `--only NAME`, the result goes to `oasa-checks.only.json` so it doesn't replace the full report.

## Changes

Draft changes go through pull requests on this page. Moving to Candidate needs two repos outside the founding set using it.
