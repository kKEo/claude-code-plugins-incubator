# Appendix: words and commands

> Draft.

This page defines the testing words this book uses and lists every test command. The command table is waiting for a test command: the repository has none yet.

## Words

| Word | Meaning in this book |
|---|---|
| Continuous integration (CI) | A service that runs checks on every pull request without a person starting them. |
| Exploratory testing | Testing by hand without a script, to find problems the automated tests do not look for. |
| Gate | An automated check that has to pass before a change may merge. |
| Sandbox | A throwaway copy of the product and its data, where a mistake costs nothing. |
| Test suite | All the automated tests of the project, run together. |

## Commands

| Command | What it runs | Defined in |
|---|---|---|
| `make docs` | Builds the getting-started book with mdBook. It runs no tests. | [Makefile](https://github.com/example/ledgerd/blob/main/Makefile) |
