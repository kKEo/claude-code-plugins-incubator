---
name: gitbook-docs-validator
description: Validate a project's GitBook/mdBook documentation against the three-book template (one static landing page, an entry-level user "getting started" book, a low-level operator/development-and-deployment guide, and a tester/quality-assurance guide), and report what is missing or deviates. Use this whenever someone asks to check, review, audit, lint or verify documentation structure, asks "does our documentation follow the template", mentions SUMMARY.md, .gitbook.yaml, book.toml, mdBook, GitBook, a docs/guide folder, orphan or unpublished pages, broken relative links, or wants to know whether newly scaffolded docs for a service are complete, even if they never say "template" or "validate". Also use it when reviewing a pull request that touches a docs/ tree with several books.
---

# GitBook docs validator

You are checking a documentation tree against a template that a team already uses and trusts.
The template is one landing page plus exactly three books, each for a different reader:

| Role | Reader | Promise |
|---|---|---|
| **user** | someone new, non-technical | plain words, a timed quick start, everyday tasks, FAQ, glossary |
| **operator** | runs or develops the system | how it works inside, install/deploy, complete configuration reference, monitoring, day-two operations |
| **tester** | checks that changes are safe | how to run the tests, what blocks a merge, how to add tests, how to explore by hand |

The full template, with the reason behind each rule, is in `references/template.md`. Do not
read it end to end: open §5–§7 only when you need the reasoning to judge a deviation, and §9
when a finding looks like a false positive. The script already encodes §1–§4 and §8.

## Workflow

Speed matters here: the script takes well under a second, so the time of a run is spent on
reading and writing. Keep the reading set fixed and the report short.

1. **Find the docs root.** It is the directory that holds `index.html` and the book folders
   (each book has `SUMMARY.md`). Usually `docs/guide/`; if the user names a path, use it. If
   several candidates exist, run the script on each or ask which one the user means.

2. **Run the script once.**

   ```bash
   python3 <skill-dir>/scripts/validate_docs.py <docs-root> --repo-root <repo-root> --format md --worklist
   ```

   This prints the report skeleton (verdict, structural failures, deviations, not checked),
   with repeated findings already grouped, followed by a worklist of the files to read in step
   3. Exit status 1 means at least one ERROR. Do not run it again with `--json` or without
   flags. You already have everything. Use `--json` only when you have to post-process
   findings, for example in CI.

   The script maps folders to roles through aliases (`user`/`getting-started`/…,
   `operator`/`internals`/`deploy`/…, `tester`/`qa`/`testing`/…). If a project uses other
   names, either rename them or drop a `.docs-template.json` into the docs root with extra
   `aliases` (same shape as `assets/template.json`). Never "fix" a mismatch by editing the
   skill's own template.

   What the script covers:
   - landing page cards and links;
   - the three roles present exactly once;
   - `README.md`/`SUMMARY.md`/`.gitbook.yaml`/`book.toml` per book;
   - SUMMARY rules: it starts with README, every page is listed (orphans are unpublished
     pages), every listed file exists, `Part I..N` numbering, part directories have a README;
   - headings: one H1 per page on line one (code-fence comments are ignored), no skipped
     heading levels;
   - images exist and carry real alt text, and unused images are flagged;
   - relative links resolve and stay inside the docs root, and anchors exist;
   - stub pages (under 15 words, no `> Draft.`), grouped per book;
   - book READMEs state their audience, have a reading-map table whose rows link to
     published pages, and point to the sibling books;
   - the quick start states how long it takes;
   - each role's required pages are present;
   - with `--repo-root`: the root README, docs index, Makefile targets, docs workflow and
     docs-check script. The Makefile check includes `docs-site`: a target that builds every
     book and serves the whole site locally, starting at the landing page. It warns when the
     Makefile or the target is missing, when the target starts no web server, and when the
     landing page is missing or never copied into the built site.

   Do not re-check any of these by hand.

   **Structure-only requests.** If the user asked only for a lint, a CI check, orphan pages,
   broken links or "is the structure right", run the script with
   `--only landing,files,summary,links --format md` instead (no `--worklist`), fill in the
   verdict sentence and report the skeleton. Skip step 3. The skeleton's "Validators not
   run" line tells the reader that this was not a full check; keep it.

   **One validator.** The script is a set of validators: `books` (always runs), `landing`,
   `files`, `summary`, `pages`, `links`, `readme`, `roles`, `repo`. Use `--only a,b` or
   `--skip a,b` to run a subset (`--list-checks` describes them). The plugin also ships them
   as commands: `/gitbook-docs-validator:structure`, `:links`, `:content` and `:repo`.

3. **Do the pass the script cannot, on the worklist only.** Read the worklist files (the
   landing page, the three book READMEs, the user quick start, one operator reference page,
   one tester page) **in a single parallel batch**. Open another file only to confirm a
   specific finding. Spot-check at most one claim against the code. Judge:
   - Does each book speak to its reader? The user book should have no undefined jargon; the
     operator book should quote defaults and name files; the tester book should name commands
     and test files.
   - Does each page's lead paragraph say what the page is for?
   - Does the reading-map table on each README route the reader (one row per common need),
     or is it a copy of SUMMARY? Does it promise topics the book does not have?
   - Are the pages the worklist marks as "generated" untouched by hand edits?
   - Does anything reference the code in a way that could drift (version numbers in prose, a
     command the binary no longer has)?
   - Is the template itself the right fit here? If a project has a good reason to deviate
     (for example, a product with no operator at all), say so rather than demanding
     compliance.

4. **Finish the skeleton into the report.** Keep its shape, so reports from different
   projects compare:

   ```markdown
   # Documentation template check: <project>

   **Verdict:** PASS | PASS with deviations | FAIL — one sentence on why.
   Books found: user=<dir>/, operator=<dir>/, tester=<dir>/   (or which is missing)

   ## Structural failures (must fix)
   - <file:line> — what is wrong, and the consequence (e.g. "page is never published").

   ## Template deviations (judge)
   - <file> — the rule, how this project differs, whether the deviation is reasonable.

   ## Suggestions
   - Improvements beyond the template that this project would benefit from.

   ## Not checked
   - What this run could not verify (no repo root, no code to compare against, …).
   ```

   - Replace the `<one sentence on why>` and remove the `<!-- … -->` hints and the worklist.
   - Add a consequence to each failure only where it is not obvious.
   - Add one short judgement ("reasonable for a scaffold", "fix") to each deviation, then
     append your qualitative findings.
   - **Never list checks that passed.** "None." is enough when there are no failures.
   - Keep suggestions to the few that matter. Aim for 30–70 lines in total. Separate
     suggestions from failures: a team should be able to fix the first list mechanically
     and discuss the second.

5. **Offer, do not apply.** Unless the user asked for fixes, stop at the report. If they ask,
   fix structural failures first (they are mechanical), re-run the script, and leave template
   deviations as a conversation.

## When the project is not yet using the template

If the tree has one book, or none, the script will report missing roles. Do not pad the report
with every per-page rule; the useful answer is the shape: which roles exist, which are missing,
what the landing page should link, and which existing pages would move into which book.
`references/template.md` §1 and §7 give the target shape and the minimum pages per role.

## Files

- `scripts/validate_docs.py`: the deterministic checks (python3 3.8+, stdlib only;
  `--format text|md|json`, `--worklist`, `--quiet`, `--only`/`--skip`, `--list-checks`).
  Each validator is a module in `scripts/gbv/checks/`.
- `references/template.md`: the template with the reasoning; consult §5–§7 and §9 as needed.
- `assets/template.json`: roles, folder aliases, required pages; override per project with
  `<docs-root>/.docs-template.json`.
