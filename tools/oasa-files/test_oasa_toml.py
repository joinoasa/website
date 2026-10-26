# Copyright OASA contributors
# SPDX-License-Identifier: Apache-2.0
"""Tests for oasa_toml.py. Run: python3 -m unittest discover -s tools/oasa-files"""

import contextlib
import io
import json
import re
import tempfile
import unittest
from pathlib import Path

import oasa_toml as t

DOC = Path(__file__).resolve().parents[2] / "src/content/docs/docs/oasa-files.md"

VALID = """
oasa = "files/0"

[project]
name = "demo"
summary = "A demo"
repo = "https://github.com/joinoasa/demo"
license = "Apache-2.0"
nodes = ["R-SEC1", "T-DOCK2"]

[review]
security = "light"

[[check]]
name = "ok"
run = "true"
"""


def cli(*argv):
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        code = t.main(list(argv))
    return code, out.getvalue(), err.getvalue()


class Base(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.dir = Path(self._tmp.name)

    def write(self, text, name="oasa.toml"):
        p = self.dir / name
        p.write_text(text, encoding="utf-8")
        return str(p)

    def errors(self, text, tree=None):
        import tomllib

        return t.validate(tomllib.loads(text), self.dir, tree)


class ValidateTests(Base):
    def test_valid(self):
        self.assertEqual(self.errors(VALID), ([], []))

    def test_doc_example_validates(self):
        md = DOC.read_text(encoding="utf-8")
        toml = re.search(r"```toml\n(.*?)```", md, re.S).group(1)
        (self.dir / ".devcontainer").mkdir()
        (self.dir / ".devcontainer/devcontainer.json").write_text("{}")
        (self.dir / "docs").mkdir()
        for f in ("README.md", "AGENTS.md", "docs/oasa-sec-v0-link.md"):
            (self.dir / f).write_text("x")
        self.assertEqual(self.errors(toml), ([], []))

    def has(self, text, needle):
        errs, _ = self.errors(text)
        self.assertTrue(any(needle in e for e in errs), f"{needle!r} not in {errs}")

    def test_wrong_version(self):
        self.has(VALID.replace("files/0", "files/1"), 'oasa: must be "files/0"')

    def test_missing_project_field(self):
        self.has(VALID.replace('summary = "A demo"\n', ""), "project.summary: required")

    def test_nodes_required_and_type(self):
        self.has(VALID.replace('nodes = ["R-SEC1", "T-DOCK2"]\n', ""), "project.nodes: required")
        self.has(VALID.replace('["R-SEC1", "T-DOCK2"]', "[1]"), "project.nodes: must be a list of strings")

    def test_empty_nodes_ok(self):
        self.assertEqual(self.errors(VALID.replace('["R-SEC1", "T-DOCK2"]', "[]")), ([], []))

    def test_bad_node_id(self):
        self.has(VALID.replace("R-SEC1", "r-sec1"), "project.nodes[0]")

    def test_bad_security(self):
        self.has(VALID.replace('"light"', '"high"'), "review.security: must be one of")

    def test_docs_must_exist(self):
        self.has(VALID.replace('nodes = [', 'docs = ["nope.md"]\nnodes = ['), "project.docs[0]: file not found")

    def test_container_must_exist(self):
        self.has(VALID + '\n[setup]\ncontainer = "x.json"\n', "setup.container: file not found")

    def test_no_checks(self):
        self.has(VALID.split("[[check]]")[0], "check: at least one")

    def test_check_run_empty(self):
        self.has(VALID + '\n[[check]]\nname = "b"\nrun = ""\n', "check[1].run: must be a non-empty string")

    def test_check_name_missing_and_duplicate(self):
        self.has(VALID + '\n[[check]]\nrun = "x"\n', "check[1].name: required")
        self.has(VALID + '\n[[check]]\nname = "ok"\nrun = "x"\n', "check[1].name: duplicate")

    def test_check_required_type(self):
        self.has(VALID + '\n[[check]]\nname = "b"\nrun = "x"\nrequired = "no"\n', "check[1].required")

    def test_check_env(self):
        self.has(VALID + '\n[[check]]\nname = "b"\nrun = "x"\nenv = { A = 1 }\n', "check[1].env")

    def test_lab(self):
        self.has(VALID + "\n[[lab]]\nhardware = true\n", "lab[0].suite: required")
        self.has(VALID + '\n[[lab]]\nsuite = "s"\nhardware = "y"\n', "lab[0].hardware")

    def test_hardware(self):
        self.has(VALID + '\n[hardware]\nneeded = "yes"\n', "hardware.needed")

    def test_unknown_key_is_warning(self):
        errs, warns = self.errors(VALID + '\n[extra]\nx = 1\n')
        self.assertEqual(errs, [])
        self.assertIn("extra: unknown key", warns)

    def test_check_dir(self):
        self.has(VALID + '\n[[check]]\nname = "b"\nrun = "x"\ndir = "nope"\n', "check[1].dir: directory not found")
        (self.dir / "sub").mkdir()
        errs, _ = self.errors(VALID + '\n[[check]]\nname = "b"\nrun = "x"\ndir = "sub"\n')
        self.assertEqual(errs, [])

    def test_check_repos(self):
        self.has(VALID + '\n[[check]]\nname = "b"\nrun = "x"\nrepos = "oasa-sec"\n', "check[1].repos: must be a list")
        self.has(VALID + '\n[[check]]\nname = "b"\nrun = "x"\nrepos = ["../x"]\n', "check[1].repos[0]")

    def test_tree(self):
        errs, _ = self.errors(VALID, tree={"R-SEC1"})
        self.assertEqual(errs, ["project.nodes[1]: T-DOCK2 is not in the tech tree"])


class CheckCommandTests(Base):
    def test_ok(self):
        code, out, _ = cli("--file", self.write(VALID), "check")
        self.assertEqual(code, 0)
        self.assertIn("ok", out)

    def test_error_exit(self):
        code, out, _ = cli("--file", self.write(VALID.replace("files/0", "x")), "check")
        self.assertEqual(code, 1)
        self.assertIn("error: oasa:", out)

    def test_file_after_command(self):
        self.assertEqual(cli("check", "--file", self.write(VALID))[0], 0)

    def test_missing_file(self):
        code, _, err = cli("--file", str(self.dir / "none.toml"), "check")
        self.assertEqual(code, 1)
        self.assertIn("not found", err)

    def test_bad_toml(self):
        code, _, err = cli("--file", self.write("a = ["), "check")
        self.assertEqual(code, 1)

    def test_strict(self):
        f = self.write("foo = 1\n" + VALID)
        code, out, _ = cli("--file", f, "check")
        self.assertEqual(code, 0)
        self.assertIn("warning: foo: unknown key", out)
        code, out, _ = cli("--file", f, "check", "--strict")
        self.assertEqual(code, 1)
        self.assertIn("error: foo: unknown key", out)

    def test_tree_file(self):
        tree = self.dir / "tree.json"
        tree.write_text(json.dumps({"nodes": [{"id": "R-SEC1"}], "moonshots": [{"id": "MS-1"}]}))
        f = self.write(VALID)
        code, out, _ = cli("--file", f, "check", "--tree", str(tree))
        self.assertEqual(code, 1)
        self.assertIn("T-DOCK2 is not in the tech tree", out)
        tree.write_text(json.dumps({"nodes": [{"id": "R-SEC1"}, {"id": "T-DOCK2"}]}))
        self.assertEqual(cli("--file", f, "check", "--tree", str(tree))[0], 0)

    def test_tree_unreadable(self):
        code, _, err = cli("--file", self.write(VALID), "check", "--tree", str(self.dir / "nope.json"))
        self.assertEqual(code, 1)
        self.assertIn("cannot read tree", err)


class ShowTests(Base):
    def test_show(self):
        f = self.write(VALID + '\n[setup]\nsteps = ["echo hi"]\n')
        code, out, _ = cli("--file", f, "show")
        self.assertEqual(code, 0)
        self.assertIn("echo hi", out)
        self.assertIn("ok: true", out)

    def test_show_json(self):
        f = self.write(VALID + '\n[setup]\nsteps = ["echo hi"]\n')
        code, out, _ = cli("--file", f, "show", "--json")
        d = json.loads(out)
        self.assertEqual(d["setup"], ["echo hi"])
        self.assertEqual(d["checks"][0]["name"], "ok")
        self.assertTrue(d["checks"][0]["required"])


def manifest(checks="", setup=""):
    return VALID.split("[[check]]")[0] + setup + checks


def chk(name, run, **kw):
    extra = "".join(f"{k} = {v}\n" for k, v in kw.items())
    return f'\n[[check]]\nname = "{name}"\nrun = "{run}"\n{extra}'


class RunTests(Base):
    def run_cli(self, text, *args):
        f = self.write(text)
        return cli("--file", f, "run", *args)

    def report(self):
        return json.loads((self.dir / "oasa-checks.json").read_text())

    def test_pass_and_fail_keep_going(self):
        text = manifest(chk("good", "true") + chk("bad", "exit 3") + chk("after", "true"))
        code, out, _ = self.run_cli(text)
        self.assertEqual(code, 1)
        r = self.report()
        self.assertFalse(r["passed"])
        self.assertEqual([(x["name"], x["exitCode"]) for x in r["results"]], [("good", 0), ("bad", 3), ("after", 0)])
        self.assertIn("seconds", r["results"][0])
        self.assertIn("command", r["results"][0])

    def test_all_pass(self):
        code, _, _ = self.run_cli(manifest(chk("a", "true")))
        self.assertEqual(code, 0)
        self.assertTrue(self.report()["passed"])

    def test_optional_skipped_unless_all(self):
        text = manifest(chk("a", "true") + chk("opt", "false", required="false"))
        self.assertEqual(self.run_cli(text)[0], 0)
        self.assertEqual([x["name"] for x in self.report()["results"]], ["a"])
        self.assertEqual(self.run_cli(text, "--all")[0], 0)  # optional failure doesn't fail the run
        r = self.report()
        self.assertEqual([x["name"] for x in r["results"]], ["a", "opt"])
        self.assertFalse(r["results"][1]["required"])

    def test_env(self):
        text = manifest(chk("env", 'test \\"$FOO\\" = bar', env='{ FOO = "bar" }'))
        self.assertEqual(self.run_cli(text)[0], 0)

    def test_runs_from_repo_root(self):
        (self.dir / "marker").write_text("x")
        self.assertEqual(self.run_cli(manifest(chk("cwd", "test -f marker")))[0], 0)

    def test_only(self):
        text = manifest(chk("a", "true") + chk("b", "false"))
        self.assertEqual(self.run_cli(text, "--only", "a")[0], 0)
        only = json.loads((self.dir / "oasa-checks.only.json").read_text())
        self.assertEqual([x["name"] for x in only["results"]], ["a"])
        code, _, err = self.run_cli(text, "--only", "zzz")
        self.assertEqual(code, 1)
        self.assertIn("no such check", err)

    def test_markdown(self):
        text = manifest(chk("good", "true") + chk("bad", "exit 3"))
        _, out, _ = self.run_cli(text, "--markdown")
        self.assertIn("| Check | Command | Result | Time |", out)
        self.assertRegex(out, r"\| good \| `true` \| pass \| [\d.]+s \|")
        self.assertRegex(out, r"\| bad \| `exit 3` \| fail \(3\) \| [\d.]+s \|")
        self.assertRegex(out, r"\d{4}-\d{2}-\d{2} · commit \S+ · oasa_toml.py " + re.escape(t.__version__))

    def test_out_path(self):
        self.run_cli(manifest(chk("a", "true")), "--out", "custom.json")
        self.assertTrue((self.dir / "custom.json").is_file())

    def test_setup_runs_first(self):
        text = manifest(chk("c", "test -f made"), setup='\n[setup]\nsteps = ["touch made"]\n')
        self.assertEqual(self.run_cli(text)[0], 1)  # no setup: file missing
        self.assertEqual(self.run_cli(text, "--setup")[0], 0)

    def test_setup_failure_stops(self):
        text = manifest(chk("c", "true"), setup='\n[setup]\nsteps = ["exit 2", "touch later"]\n')
        code, _, err = self.run_cli(text, "--setup")
        self.assertEqual(code, 1)
        self.assertIn("setup step failed", err)
        self.assertFalse((self.dir / "later").exists())
        self.assertFalse((self.dir / "oasa-checks.json").exists())

    def test_dir_is_cwd(self):
        (self.dir / "sub").mkdir()
        (self.dir / "sub/here").write_text("x")
        self.assertEqual(self.run_cli(manifest(chk("d", "test -f here", dir='"sub"')))[0], 0)

    def sibling_root(self):
        repo = self.dir / "me"
        repo.mkdir()
        return repo

    def test_repos_missing_required_fails_without_running(self):
        repo = self.sibling_root()
        (repo / "oasa.toml").write_text(manifest(chk("c", "touch ran", repos='["oasa-sec"]')))
        code, out, err = cli("--file", str(repo / "oasa.toml"), "run", "--markdown")
        self.assertEqual(code, 1)
        self.assertFalse((repo / "ran").exists())
        self.assertIn("needs ../oasa-sec", err)
        self.assertIn("fail (needs ../oasa-sec)", out)

    def test_repos_missing_optional_skipped(self):
        repo = self.sibling_root()
        text = manifest(chk("c", "touch ran", required="false", repos='["oasa-sec"]'))
        (repo / "oasa.toml").write_text(text)
        code, out, _ = cli("--file", str(repo / "oasa.toml"), "run", "--all", "--markdown")
        self.assertEqual(code, 0)
        self.assertFalse((repo / "ran").exists())
        self.assertIn("skipped (needs ../oasa-sec)", out)

    def test_repos_present_sets_env(self):
        repo = self.sibling_root()
        (self.dir / "oasa-sec").mkdir()
        cmd = 'test \\"$OASA_ROOT_OASA_SEC\\" = \\"' + str((self.dir / "oasa-sec").resolve()) + '\\"'
        (repo / "oasa.toml").write_text(manifest(chk("c", cmd, repos='["oasa-sec"]')))
        self.assertEqual(cli("--file", str(repo / "oasa.toml"), "run")[0], 0)

    def test_only_default_out(self):
        text = manifest(chk("a", "true"))
        self.run_cli(text, "--only", "a")
        self.assertTrue((self.dir / "oasa-checks.only.json").is_file())
        self.assertFalse((self.dir / "oasa-checks.json").exists())
        self.run_cli(text, "--only", "a", "--out", "x.json")
        self.assertTrue((self.dir / "x.json").is_file())

    def test_timeout(self):
        code, _, _ = self.run_cli(manifest(chk("slow", "sleep 5")), "--timeout", "0.3")
        self.assertEqual(code, 1)
        self.assertEqual(self.report()["results"][0]["exitCode"], 124)

    def test_invalid_manifest_refuses(self):
        code, _, err = self.run_cli(VALID.replace("files/0", "x"))
        self.assertEqual(code, 1)
        self.assertIn("error: oasa:", err)


class MiscTests(unittest.TestCase):
    def test_version(self):
        with self.assertRaises(SystemExit) as cm, contextlib.redirect_stdout(io.StringIO()) as out:
            t.main(["--version"])
        self.assertEqual(cm.exception.code, 0)


if __name__ == "__main__":
    unittest.main()
