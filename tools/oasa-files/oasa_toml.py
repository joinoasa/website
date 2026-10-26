#!/usr/bin/env python3
# Copyright OASA contributors
# SPDX-License-Identifier: Apache-2.0
#
# oasa_toml.py: validate and run the checks in an OASA repo manifest (oasa.toml, format "files/0").
# Spec: https://joinoasa.org/docs/oasa-files/
# Python 3.11+, standard library only.
"""Validate oasa.toml, show its setup and checks, and run the checks."""

from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import subprocess
import sys
import time
import tomllib
import urllib.request
from pathlib import Path

__version__ = "0.1.0"
FORMAT = "files/0"
SECURITY = ("critical", "standard", "light")
NODE_RE = re.compile(r"^[A-Z]{1,3}-[A-Z]*[0-9]+$")

KNOWN = {
    "": {"oasa", "project", "review", "setup", "check", "lab", "hardware"},
    "project": {"name", "summary", "repo", "license", "nodes", "standards", "docs"},
    "review": {"security", "leads"},
    "setup": {"container", "tools", "steps"},
    "check": {"name", "run", "required", "needs", "env"},
    "lab": {"suite", "hardware"},
    "hardware": {"needed", "optional"},
}


def load(path: Path) -> dict:
    with open(path, "rb") as f:
        return tomllib.load(f)


def _is_str_list(v) -> bool:
    return isinstance(v, list) and all(isinstance(x, str) for x in v)


def validate(data: dict, root: Path, tree_ids: set[str] | None = None) -> tuple[list[str], list[str]]:
    """Return (errors, warnings)."""
    errors: list[str] = []
    warnings: list[str] = []

    def err(msg):
        errors.append(msg)

    def unknown(table: dict, section: str, prefix: str):
        for k in table:
            if k not in KNOWN[section]:
                warnings.append(f"{prefix}{k}: unknown key")

    def need_str(table, key, prefix, required=True):
        v = table.get(key)
        if v is None:
            if required:
                err(f"{prefix}{key}: required")
            return None
        if not isinstance(v, str) or not v.strip():
            err(f"{prefix}{key}: must be a non-empty string")
            return None
        return v

    def opt_list(table, key, prefix):
        if key in table and not _is_str_list(table[key]):
            err(f"{prefix}{key}: must be a list of strings")
            return None
        return table.get(key)

    unknown(data, "", "")
    if data.get("oasa") != FORMAT:
        err(f'oasa: must be "{FORMAT}"')

    # [project]
    proj = data.get("project")
    if not isinstance(proj, dict):
        err("project: required table")
    else:
        unknown(proj, "project", "project.")
        for k in ("name", "summary", "repo", "license"):
            need_str(proj, k, "project.")
        nodes = proj.get("nodes")
        if nodes is None:
            err("project.nodes: required (may be empty)")
        elif not _is_str_list(nodes):
            err("project.nodes: must be a list of strings")
        else:
            for i, n in enumerate(nodes):
                if not NODE_RE.match(n):
                    err(f"project.nodes[{i}]: {n!r} is not a node ID (like R-SEC1)")
                elif tree_ids is not None and n not in tree_ids:
                    err(f"project.nodes[{i}]: {n} is not in the tech tree")
        opt_list(proj, "standards", "project.")
        docs = opt_list(proj, "docs", "project.")
        for i, d in enumerate(docs or []):
            if not (root / d).is_file():
                err(f"project.docs[{i}]: file not found: {d}")

    # [review]
    rev = data.get("review")
    if not isinstance(rev, dict):
        err("review: required table")
    else:
        unknown(rev, "review", "review.")
        sec = rev.get("security")
        if sec is None:
            err("review.security: required")
        elif sec not in SECURITY:
            err(f"review.security: must be one of {', '.join(SECURITY)}")
        opt_list(rev, "leads", "review.")

    # [setup]
    setup = data.get("setup", {})
    if not isinstance(setup, dict):
        err("setup: must be a table")
    else:
        unknown(setup, "setup", "setup.")
        c = setup.get("container")
        if c is not None:
            if not isinstance(c, str) or not c.strip():
                err("setup.container: must be a non-empty string")
            elif not (root / c).is_file():
                err(f"setup.container: file not found: {c}")
        opt_list(setup, "tools", "setup.")
        steps = opt_list(setup, "steps", "setup.")
        for i, s in enumerate(steps or []):
            if not s.strip():
                err(f"setup.steps[{i}]: must be a non-empty string")

    # [[check]]
    checks = data.get("check")
    if not isinstance(checks, list) or not checks:
        err("check: at least one [[check]] is required")
    else:
        names: set[str] = set()
        for i, ch in enumerate(checks):
            p = f"check[{i}]."
            if not isinstance(ch, dict):
                err(f"check[{i}]: must be a table")
                continue
            unknown(ch, "check", p)
            name = need_str(ch, "name", p)
            if name is not None:
                if name in names:
                    err(f"{p}name: duplicate {name!r}")
                names.add(name)
            need_str(ch, "run", p)
            if "required" in ch and not isinstance(ch["required"], bool):
                err(f"{p}required: must be true or false")
            opt_list(ch, "needs", p)
            env = ch.get("env")
            if env is not None and not (isinstance(env, dict) and all(isinstance(v, str) for v in env.values())):
                err(f"{p}env: must be a table of strings")

    # [[lab]]
    labs = data.get("lab", [])
    if not isinstance(labs, list):
        err("lab: must be an array of tables ([[lab]])")
    else:
        for i, lb in enumerate(labs):
            p = f"lab[{i}]."
            if not isinstance(lb, dict):
                err(f"lab[{i}]: must be a table")
                continue
            unknown(lb, "lab", p)
            need_str(lb, "suite", p)
            if "hardware" in lb and not isinstance(lb["hardware"], bool):
                err(f"{p}hardware: must be true or false")

    # [hardware]
    hw = data.get("hardware")
    if hw is not None:
        if not isinstance(hw, dict):
            err("hardware: must be a table")
        else:
            unknown(hw, "hardware", "hardware.")
            if "needed" in hw and not isinstance(hw["needed"], bool):
                err("hardware.needed: must be true or false")
            opt_list(hw, "optional", "hardware.")

    return errors, warnings


def load_tree_ids(src: str) -> set[str]:
    if re.match(r"^https?://", src):
        req = urllib.request.Request(src, headers={"User-Agent": "oasa-toml"})
        with urllib.request.urlopen(req, timeout=15) as r:
            tree = json.load(r)
    else:
        with open(src, encoding="utf-8") as f:
            tree = json.load(f)
    ids: set[str] = set()
    for key in ("nodes", "moonshots", "starshots"):
        for item in tree.get(key, []) or []:
            if isinstance(item, dict) and isinstance(item.get("id"), str):
                ids.add(item["id"])
    return ids


# ---- commands ---------------------------------------------------------------------------------


def _read(args) -> tuple[Path, dict] | None:
    path = Path(args.file)
    try:
        return path, load(path)
    except FileNotFoundError:
        print(f"error: {path} not found", file=sys.stderr)
    except tomllib.TOMLDecodeError as e:
        print(f"error: {path}: {e}", file=sys.stderr)
    return None


def cmd_check(args) -> int:
    got = _read(args)
    if not got:
        return 1
    path, data = got
    tree_ids = None
    if args.tree:
        try:
            tree_ids = load_tree_ids(args.tree)
        except (OSError, ValueError) as e:
            print(f"error: cannot read tree {args.tree}: {e}", file=sys.stderr)
            return 1
    errors, warnings = validate(data, path.resolve().parent, tree_ids)
    if args.strict:
        errors += warnings
        warnings = []
    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"error: {e}")
    if errors:
        print(f"{path}: {len(errors)} error(s)")
        return 1
    print(f"{path}: ok ({len(warnings)} warning(s))")
    return 0


def _summary(data: dict) -> dict:
    checks = [
        {
            "name": c["name"],
            "run": c["run"],
            "required": c.get("required", True),
            "needs": c.get("needs", []),
            "env": c.get("env", {}),
        }
        for c in data.get("check", [])
    ]
    return {
        "name": data.get("project", {}).get("name"),
        "security": data.get("review", {}).get("security"),
        "setup": data.get("setup", {}).get("steps", []),
        "checks": checks,
    }


def cmd_show(args) -> int:
    got = _read(args)
    if not got:
        return 1
    s = _summary(got[1])
    if args.json:
        print(json.dumps(s, indent=2))
        return 0
    print(f"{s['name']} (review: {s['security']})")
    print("\nSetup:")
    for st in s["setup"] or ["(none)"]:
        print(f"  {st}")
    print("\nChecks:")
    for c in s["checks"]:
        opt = "" if c["required"] else " (optional)"
        print(f"  {c['name']}{opt}: {c['run']}")
        if c["needs"]:
            print(f"    needs: {', '.join(c['needs'])}")
        for k, v in c["env"].items():
            print(f"    env: {k}={v}")
    return 0


def _git_commit(root: Path) -> str | None:
    try:
        r = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=root, capture_output=True, text=True, timeout=10)
        return r.stdout.strip() or None if r.returncode == 0 else None
    except (OSError, subprocess.SubprocessError):
        return None


def _exec(cmd: str, root: Path, env_extra: dict, timeout: float | None) -> int:
    env = {**os.environ, **env_extra}
    try:
        p = subprocess.run(cmd, shell=True, cwd=root, env=env, timeout=timeout)
        return p.returncode
    except subprocess.TimeoutExpired:
        print(f"timed out after {timeout}s: {cmd}", file=sys.stderr)
        return 124


def cmd_run(args) -> int:
    got = _read(args)
    if not got:
        return 1
    path, data = got
    root = path.resolve().parent
    errors, _ = validate(data, root)
    if errors:
        for e in errors:
            print(f"error: {e}", file=sys.stderr)
        print("fix oasa.toml first (python3 oasa_toml.py check)", file=sys.stderr)
        return 1

    if args.setup:
        for step in data.get("setup", {}).get("steps", []):
            print(f"\n== setup: {step}", flush=True)
            code = _exec(step, root, {}, args.timeout)
            if code != 0:
                print(f"setup step failed (exit {code}): {step}", file=sys.stderr)
                return 1

    checks = data["check"]
    if args.only:
        known = {c["name"] for c in checks}
        missing = [n for n in args.only if n not in known]
        if missing:
            print(f"error: no such check: {', '.join(missing)}", file=sys.stderr)
            return 1
        checks = [c for c in checks if c["name"] in args.only]
    elif not args.all:
        checks = [c for c in checks if c.get("required", True)]

    results = []
    for c in checks:
        print(f"\n== check: {c['name']}: {c['run']}", flush=True)
        t0 = time.monotonic()
        code = _exec(c["run"], root, c.get("env", {}), args.timeout)
        secs = round(time.monotonic() - t0, 1)
        results.append(
            {"name": c["name"], "command": c["run"], "exitCode": code, "seconds": secs, "required": c.get("required", True)}
        )
        print(f"-- {c['name']}: {'pass' if code == 0 else 'FAIL'} ({secs}s)", flush=True)

    failed = [r for r in results if r["exitCode"] != 0 and r["required"]]
    stamp = datetime.date.today().isoformat()
    commit = _git_commit(root)
    report = {
        "tool": f"oasa_toml.py {__version__}",
        "date": stamp,
        "commit": commit,
        "passed": not failed,
        "results": results,
    }
    out = Path(args.out)
    if not out.is_absolute():
        out = root / out
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    if args.markdown:
        print("\n| Check | Command | Result | Time |\n|---|---|---|---|")
        for r in results:
            if r["exitCode"] == 0:
                res = "pass"
            else:
                res = f"fail ({r['exitCode']})" + ("" if r["required"] else ", optional")
            cmd = r["command"].replace("|", "\\|").replace("`", "'")
            print(f"| {r['name']} | `{cmd}` | {res} | {r['seconds']}s |")
        print(f"\n{stamp} · commit {commit or 'unknown'} · oasa_toml.py {__version__}")
    return 1 if failed else 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="oasa_toml.py", description=__doc__)
    ap.add_argument("--version", action="version", version=f"oasa_toml.py {__version__}")
    ap.add_argument("--file", default="oasa.toml", help="path to oasa.toml (default: ./oasa.toml)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("check", help="validate oasa.toml")
    c.add_argument("--strict", action="store_true", help="treat unknown keys as errors")
    c.add_argument("--tree", metavar="PATH_OR_URL", help="techtree.json to check node IDs against")
    c.set_defaults(fn=cmd_check)

    s = sub.add_parser("show", help="print setup steps and checks")
    s.add_argument("--json", action="store_true")
    s.set_defaults(fn=cmd_show)

    r = sub.add_parser("run", help="run the checks")
    r.add_argument("--all", action="store_true", help="include optional checks")
    r.add_argument("--setup", action="store_true", help="run setup steps first")
    r.add_argument("--only", nargs="+", metavar="NAME", help="run only these checks")
    r.add_argument("--markdown", action="store_true", help="print a table for the pull request")
    r.add_argument("--out", default="oasa-checks.json", help="result file (default: oasa-checks.json)")
    r.add_argument("--timeout", type=float, default=None, metavar="SECS", help="per-command timeout")
    r.set_defaults(fn=cmd_run)

    for sp in (c, s, r):  # also accept --file after the command
        sp.add_argument("--file", default=argparse.SUPPRESS, help=argparse.SUPPRESS)

    args = ap.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
