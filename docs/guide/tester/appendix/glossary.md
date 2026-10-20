# Glossary

This page defines the testing words used in this guide.

**Assertion.** One sentence in an eval case that a grader can check against the report, such as "Report names the second H1 in tester/start/running.md".

**Benchmark.** The summary the eval harness writes after running all cases with and without the skill; see `iteration-1/benchmark.md`.

**Check tag.** The second column of a validator finding (`landing`, `summary`, `link`, …); names the group of rules that produced it.

**Deterministic check.** A command whose result does not depend on a model: `jq`, `bash -n`, `validate_docs.py`, `scripts/docs-check`.

**Eval.** A prompt plus assertions in `evals/evals.json`, run through Claude with and without the skill.

**Exploratory session.** A scripted by-hand run of a plugin with things to watch for, as in [Testing by hand](../explore/by-hand.md).

**Fixture.** A sample documentation tree with known faults, under `evals/fixtures/`.

**Gate.** A check that blocks a merge when it fails. Today only `docs.yml`.

**Reconciliation.** The part of `scripts/docs-check` that compares names in the code (flags, events, skills, agents) with the operator book.

**Seeded fault.** A deliberate mistake placed in a fixture so that a validator check has something to find.

**Smoke test.** The shortest run that shows a component works at all: one prompt, one expected effect.

**Verdict.** The first line of a validator report: PASS, PASS with deviations, or FAIL.
