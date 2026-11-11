# rigorous-review

A strict, pre-merge code review skill. It reads a diff the way a hostile Staff Engineer would: no praise, no style nitpicks, and no invented problems. Every real finding is reported with its severity, location, failure mode and a minimal fix.

## What it checks

- **Logic & edge cases:** off-by-one errors, null/undefined handling, unhandled promise rejections, empty arrays, boundaries.
- **Concurrency & state:** race conditions, deadlocks, stale closures, leaks, broken mutations.
- **Security & data integrity:** injection, missing authorization, exposed secrets, unvalidated input.
- **Performance & scale:** N+1 queries, blocking the main thread, unbounded loops, excessive allocation.
- **Architecture & over-engineering:** unnecessary abstractions, dead code, departures from existing project patterns, tight coupling, logic in the wrong layer.

## Installation

Link the plugin into your Claude Code plugins directory:

```bash
ln -s "$(pwd)/plugins/rigorous-review" ~/.claude/plugins/rigorous-review
```

Or install it from the marketplace named `km-plugin-registry`.

## Usage

```
/rigorous-review                 # review the current change (branch vs default branch, else uncommitted)
/rigorous-review 123             # review PR #123 via gh
/rigorous-review feature/login   # review a branch against the default branch
/rigorous-review src/api         # review a path
```

### Focusing the review

Add `--focus` to spend the whole review on one area, or several separated by commas:

```
/rigorous-review --focus security
/rigorous-review 123 --focus performance,concurrency
/rigorous-review src/api --focus extensibility
```

`logic`, `concurrency`, `security`, `performance` and `architecture` map to the built-in criteria. Any other name works too (`extensibility`, `accessibility`, `testability`, ...) and is reviewed as the name is commonly understood. Saying it in plain words ("review this, focus on performance") has the same effect.

A focused review reads deeper into that area and reports only findings in it, with one exception: a CRITICAL issue noticed outside the focus is still reported.

## Output format

```
- **[SEVERITY: CRITICAL / HIGH / MEDIUM]** `File:Line` — Short title of the flaw.
- **Why it breaks:** Blunt technical explanation of the failure mode.
- **Fix:** Minimal copy-pasteable snippet.
```

What gets reported: anything that can cause incorrect behaviour, a crash, data loss, a security exposure, a measurable performance problem or a real maintenance cost. Each finding names the input or state that triggers it. Style and naming preferences are left out.

- If there are no findings at all, the output is exactly `No critical issues found.`
- If there is nothing to review (empty diff, unknown PR, branch or path), it says so in one sentence.
- When the fix is not a small local change, the **Fix** line describes the change instead of giving a snippet.

## Model families

The prompt is written to behave the same on Haiku, Sonnet, Opus and Fable. It states the reporting bar concretely, because current models follow vague filters such as "don't nitpick" literally and then drop real findings. It gives exact commands for finding the base branch, because smaller models guess when given a placeholder.

## Requirements

- Claude Code with the Skill tool.
- `git` in the repository. `gh` for PR-number targets.

## Notes

- Read-only: it reports findings and never edits files.
- Findings are only as good as the context read. The skill reads the surrounding code of each hunk before judging it, but it cannot run your test suite or load-test the change.

## License

See [LICENSE](LICENSE).
