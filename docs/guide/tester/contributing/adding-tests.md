# Adding tests

This page says which kind of test to add for each kind of change, and shows the mechanics of each.

## Which test for which change

| Change | Add |
|---|---|
| A new check in `validate_docs.py` | A seeded fault in `evals/fixtures/broken-docs/` that triggers it, and an updated expected error count in [Running the tests](../start/running.md) |
| A change to the validator skill text or template | An eval case in `evals/evals.json` with assertions on the report |
| A new plugin | A section in [Testing by hand](../explore/by-hand.md) and rows in [What is tested where](../start/map.md) |
| A new hook | A by-hand run on both a matching and a non-matching state, documented with expected output |
| A new skill trigger phrase | Nothing automated; try the phrase in a session and record it in the plugin README |
| A page in this documentation | Nothing; `scripts/docs-check` covers structure |

## Adding an eval case

`evals/evals.json` holds an array under `evals`. Each case:

```json
{
  "id": 3,
  "name": "short-kebab-name",
  "prompt": "What the user would type, including the path to a fixture inside this repository.",
  "expected_output": "One paragraph describing the right report.",
  "files": [],
  "assertions": [
    "Report has an explicit verdict line",
    "Report names <the specific fault> with a file path"
  ]
}
```

Rules learned from the first three cases:

- Point prompts at fixtures inside `evals/fixtures/` with repository-relative paths, so the case runs on any machine. Case 0 points at `/Users/krma/Work/memory-find` and case 1 and 2 at a `~/.claude/skills/...-workspace` path; they run only on the author's machine and should be migrated.
- Make assertions checkable by reading the report: a verdict line, a named file, a named fault, a structure. Avoid assertions about tone.
- Include at least one negative assertion ("does not flag …") so the skill is rewarded for not inventing errors.

Run the cases with the `skill-creator` eval harness; it writes a `benchmark.md` like the one in `plugins/gitbook-docs-validator-workspace/iteration-1/`.

## Adding a seeded fault

1. Pick the fixture: `broken-docs` for faults that should produce an ERROR, `renamed-layout` for a passing tree with warnings.
2. Introduce exactly one fault per file so the `file:line` in the report is unambiguous.
3. Run the script and confirm one new ERROR line, with the expected check tag.
4. Add the fault to the table in [Fixtures and seeded faults](fixtures.md) and bump the count in [Running the tests](../start/running.md).

## Adding a manual smoke step

Write it as: setup commands, the prompt to type, what must appear, what must not appear. Put it under the plugin's heading in [Testing by hand](../explore/by-hand.md). Keep setup to a throwaway directory so the step can be repeated.
