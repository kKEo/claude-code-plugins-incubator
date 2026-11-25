The csvjoin documentation is set up under `docs/guide` in the standard layout and fully written: two books, no draft pages left. The validator passes with 0 errors and 0 warnings, `scripts/docs-check.sh` reports ok, and both books build with mdBook.

## Books

- **User guide** (`docs/guide/user/`, 7 pages): welcome, a five-minute quick start, everyday use, trust and privacy, use cases, questions and troubleshooting, glossary.
- **Operator guide** (`docs/guide/operator/`, 13 pages in five parts plus an appendix): system overview, install, environment variables, commands and flags, metrics and logs, troubleshooting runbook, glossary.
- **Tester guide: left out.** The repository has no tests and no CI checks, so there is nothing to describe.
- **Developer guide: left out.** The code is one 60-line file with no build, packaging, contribution rules or release process.

The landing page `docs/guide/index.html` has one card per book, rewritten to name what each book contains.

(Excerpt of the run's final message, saved for grading; the sections on tool behaviour, repository files and open points are omitted.)
