# Release checklist

Work through this list on the commit that is to be released.

## Automated checks

- [ ] CI is green on `main` for Python 3.9 and 3.12.
- [ ] `make lint` and `make test` pass locally in a fresh virtual environment.

## Installation

- [ ] `pip install -e .` succeeds in a fresh virtual environment.
- [ ] `pingboard --help` lists `add`, `remove`, `list`, `check` and `serve`.
- [ ] The `version` in `pyproject.toml` is the version to be released.

## Manual test cases

- [ ] Targets: T-1 to T-5
- [ ] One-off check: K-1 to K-6
- [ ] Configuration: C-1 to C-4
- [ ] Dashboard and endpoints: S-1 to S-9

The cases are in [Manual test cases](manual-test-cases.md). S-7 and C-3
describe known weaknesses; they pass when the behaviour matches the
description.

## Compatibility

- [ ] A targets file written by the previous version is read without change.
- [ ] Metric names and the fields of `/api/status` and `pingboard check --json`
      are unchanged, or the change is announced.
- [ ] Names and defaults of the environment variables are unchanged, or the
      change is announced.

## Documentation

- [ ] The pages under `docs/guide/` describe the released behaviour.
- [ ] `make -C docs/guide build` succeeds.

## Result

Record the tested commit, the Python versions, the operating system and the
result of each case, as described in
[Manual test cases](manual-test-cases.md#recording-results).
