# rigorous-review

A strict, pre-merge code review skill. It reads a diff the way a hostile Staff Engineer would: no praise, no style nitpicks, and no invented problems. Every real finding is reported with its severity, location, failure mode and a minimal fix.

## What it checks

- **Logic & edge cases:** off-by-one errors, null/undefined handling, unhandled promise rejections, empty arrays, boundaries.
- **Concurrency & state:** race conditions, deadlocks, stale closures, leaks, broken mutations.
- **Security & data integrity:** injection, missing authorization, exposed secrets, unvalidated input.
- **Performance & scale:** N+1 queries, blocking the main thread, unbounded loops, excessive allocation.
- **Over-engineering:** unnecessary abstractions, dead code, departures from existing project patterns.

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

## Output format

```
- **[SEVERITY: CRITICAL / HIGH / MEDIUM]** `File:Line` — Short title of the flaw.
- **Why it breaks:** Blunt technical explanation of the failure mode.
- **Fix:** Minimal copy-pasteable snippet.
```

If nothing genuine is found, the output is exactly `No critical issues found.`

## Requirements

- Claude Code with the Skill tool.
- `git` in the repository. `gh` for PR-number targets.

## Notes

- Read-only: it reports findings and never edits files.
- Findings are only as good as the context read. The skill reads the surrounding code of each hunk before judging it, but it cannot run your test suite or load-test the change.

## License

See [LICENSE](LICENSE).
