# oasa-files

`oasa_toml.py` validates and runs an OASA repo's `oasa.toml`. One file, Python 3.11+, standard library only. Spec: [OASA-FILES](https://joinoasa.org/docs/oasa-files/).

```sh
python3 oasa_toml.py check [--strict] [--tree techtree.json|URL]
python3 oasa_toml.py setup
python3 oasa_toml.py show [--json]
python3 oasa_toml.py run [--all] [--setup] [--only NAME ...] [--markdown] [--out FILE] [--timeout SECS]
```

Run it from a repo root, or point at a file with `--file PATH`. `run` runs required checks in order, keeps going after a failure, writes `oasa-checks.json` and exits 1 if a required check failed.

Tests: `npm run oasa-files:test`
