# Appendix: words and commands

> Draft.

This page defines the testing words this book uses and lists every command a tester runs. The test commands are missing, because the repository has none; the table has the one command that exists.

## Words

**Exploratory testing.** Testing by hand without a script, to find problems that no automated check looks for. See [Exploring by hand](explore/by-hand.md).

**Gate.** A check that has to pass before a change is merged. See [Continuous integration](gates/ci.md).

**Sandbox.** A copy of the product and its data that you can break without touching real entries.

## Commands

| Command | What it runs | Implemented in |
|---|---|---|
| `make docs` | Builds the user book in `handbook/getting-started` with mdBook. Runs no tests. | `Makefile` |
