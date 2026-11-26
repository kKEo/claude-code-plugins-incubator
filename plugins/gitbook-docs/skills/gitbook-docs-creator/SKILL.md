---
name: gitbook-docs-creator
description: Create GitBook/mdBook documentation that follows the book-per-reader template, formerly the three-book template (one static landing page, a user guide and an operator guide, plus an optional tester guide and an optional developer guide), by scaffolding the tree with a script and then writing the pages from the project's code. Use this whenever someone asks to create, write, scaffold, set up, bootstrap or generate documentation or a docs site for a project or service, to "document this project", to add a missing book (user guide, operator guide, tester guide, developer or contributor guide) or a missing page such as a quick start, configuration reference, runbook or glossary, to split developer content out of an operator guide, to fill in draft or stub pages, or to migrate an existing README, wiki or docs folder into the books, even if they never say "template", "GitBook" or "mdBook". Also use it after a docs check reported missing books or pages and the user wants them written. Not for checking, reviewing or linting docs that already exist: that is gitbook-docs-validator. Not for dated articles, news or blog posts on the landing page: that is gitbook-docs-article.
---

# GitBook docs creator

You are writing documentation that a team will publish: one landing page and one book per
kind of reader. Two books are required and two are optional.

| Role | Book | Reader | Promise |
|---|---|---|---|
| **user** | required | someone new, non-technical | plain words, a timed quick start, everyday tasks, FAQ, glossary |
| **operator** | required | installs and runs the system | how it works at run time, install/deploy, complete configuration reference, monitoring, day-two operations |
| **tester** | optional | checks that changes are safe | how to run the tests, what blocks a merge, how to add tests, how to explore by hand |
| **developer** | optional | changes the code | how the code is organised, development setup, conventions, extending, releasing |

Two things decide whether the result is good. The structure has to match the template, and
the script and the validator take care of that. Every statement has to be true of this
project, and only you can take care of that: a page that reads well but quotes a flag the
binary does not have is worse than a page marked as a draft.

The sibling skill `gitbook-docs-validator` owns the template. Its files are the single source
of truth and this skill reads them in place:

- `<skill-dir>/../gitbook-docs-validator/references/template.md`: the rules with their reasons.
- `<skill-dir>/../gitbook-docs-validator/assets/template.json`: roles, folder aliases, required pages.
- `<skill-dir>/../gitbook-docs-validator/scripts/validate_docs.py`: the check that ends every run.

## Workflow

1. **Look before you write.** Find out, in one parallel batch where you can:
   - the docs root (usually `docs/guide/`; use the path the user names) and the repository root;
   - what documentation exists already: README sections, a `docs/` folder, a wiki export;
   - the facts the books will state: how the product is installed and started, its commands
     and flags, the settings it reads, what it logs or measures, how the tests run and what
     CI checks. Read them from the code and the build files, not from memory or from old docs.

   Then decide which optional books this project needs. A book exists for a reader, not for
   the template, so do not write one that would be padding:
   - **tester**: add it when the project has a test suite or CI checks that someone has to
     run, read or extend. Leave it out when there are no tests to describe.
   - **developer**: add it when the project takes contributions, has extension points, or
     has enough build, convention and release material that the operator book would
     otherwise carry it. Leave it out for a small code base whose only readers install and
     run it.
   - When the user names the books they want, that settles it.

   Then pick the mode:
   - **New tree**: no book exists. Scaffold the required books and the optional ones you chose.
   - **Add**: some books or pages exist and others are missing. Scaffold only what is missing.
   - **Migrate**: documentation exists in another shape. Scaffold, then move the existing
     text into the book whose reader it serves (`references/writing.md` §7).

2. **Scaffold with the script.** Do not write the structure by hand; the script produces
   exactly what the validator checks, in under a second.

   ```bash
   python3 <skill-dir>/scripts/scaffold_docs.py <docs-root> --repo-root <repo-root> \
       --name "<project name>" --repo-url <https URL> --lede "<one sentence>" \
       --books user,operator,tester,developer --repo-files
   ```

   - `--books` names the books to scaffold. Without it the script writes the two required
     books plus any optional book that already exists, so list `tester` and `developer`
     when you decided to add them.
   - `--folders user=getting-started,tester=qa` picks folder names (they must match a role
     alias in `template.json`).
   - `--repo-files` also adds a Makefile, a docs workflow, `scripts/docs-check.sh` and a docs
     index, each only when the repository has none. Leave it out when the user asked for one
     book or one page only.
   - `--dry-run` prints the plan and writes nothing.

   The script never overwrites or edits a file. In a book that already has `SUMMARY.md` it
   adds only missing configuration files. Read its "left for you" list: those are the edits
   to existing files it would not make, and they are yours in step 5.

   Every page it writes is a stub: the title, a `> Draft.` line, and an HTML comment that says
   what the page has to contain and where its facts come from.

3. **Read `references/writing.md`, then fill the pages.** Write the operator book first: it
   forces you to establish the facts. Then the developer and tester books when they exist,
   then the user book, which says the same things in fewer and plainer words. Keep the
   operator and developer books apart: the operator book describes what runs (processes,
   storage, settings, signals), the developer book describes the code (packages, functions,
   conventions). Link between them instead of repeating. For each page:
   - follow the brief in the stub's comment, then delete the comment;
   - state only what you read in the code or ran yourself. Quote names, defaults and
     commands exactly;
   - when the page is complete, delete the `> Draft.` line. When part of it is unknown, write
     what you know, keep the `> Draft.` line exactly as it is (tools match the whole line),
     and add one sentence in the paragraph below it that names what is missing. A draft is
     honest; an invented fact is not;
   - finish the book's `README.md` and the part `README.md` files last, when you know what the
     chapters say.

   The outline is a minimum. Add pages and parts where the project has more to say, and add
   each new page to `SUMMARY.md` in the same edit: a page that is not listed is never
   published. For a large project, the books can be written in parallel by subagents,
   as long as each gets the same list of facts.

4. **Finish the landing page.** `index.html` is the front door: replace the lede with one
   sentence on what the product does for its reader, and rewrite each card's summary and
   three bullets so they name what the book now contains.

   A landing page comes with a way back to it: every book shows a **Home** icon at the top
   of each page that links to the landing page, so a reader who lands deep in one book can
   reach the others. The scaffold sets this up in every book it creates (`home-button.js`
   plus `additional-js = ["home-button.js"]` in `book.toml`). For a book that existed before,
   the script copies `home-button.js` but does not edit `book.toml`, and lists it under
   "left for you": add the line under `[output.html]` yourself (to the existing array if the
   book already loads other scripts). The same applies when you add a landing page to a tree
   that had none. The template's §3, "The Home button", has the file and the reasoning.
   Check it in the built site (`make docs-site`), not with `mdbook serve`, which serves one
   book without the landing page above it.

5. **Connect the repository.** The template expects the root README to link every book, a
   Makefile with `docs`, `docs-check`, `docs-serve` and `docs-site`, a workflow that builds
   the books, and `site/` in `.gitignore`. Work through the script's "left for you" list:
   - make additive edits only: a Documentation section in the README, missing Makefile
     targets copied from `assets/Makefile.docs`, a line in `.gitignore`;
   - if an existing target or workflow already does something else under the same name, leave
     it and report the conflict instead of rewriting it;
   - in `scripts/docs-check.sh`, add a reconciliation block for each operator reference page
     you completed (settings, commands), so the page cannot drift from the code.

   When the request was for a single book or page, skip this step and list these as
   follow-ups.

6. **Gate on the validator.**

   ```bash
   python3 <skill-dir>/../gitbook-docs-validator/scripts/validate_docs.py <docs-root> --repo-root <repo-root> --quiet
   ```

   Fix every ERROR and run it again; exit status 0 is the finish line. Then read the
   warnings: "page is marked as a draft" is expected for pages you left as drafts, and every
   other warning is either fixed or explained in your report. If `mdbook` is installed, run
   `make docs-build` once as well; it catches what a static check cannot.

7. **Report.** Short, in this order: the books and how many pages each has, and for each
   optional book one sentence on why you wrote it or left it out; which pages are
   still drafts and which fact each one is waiting for; the files you added or changed
   outside the docs root; the validator result; how to preview (`make docs-site`).

## Rules the pages must keep

These are the template rules that writing can break. The validator checks most of them, so
keeping them while you write saves a round trip.

- One H1, on the first line, close to the page's `SUMMARY.md` title. Headings never skip a level.
- A lead paragraph under the H1 says what the page is for. The user quick start says how long
  it takes ("about ten minutes").
- Plain Markdown that both GitBook and mdBook render. Callouts are blockquotes with a bold
  label (`> **Warning.** …`, `> **Tip.** …`, `> **Note.** …`). Do not use GitBook-only blocks
  such as `{% hint %}`, `{% tabs %}` or `{% stepper %}`: mdBook prints them as text. This is
  the one place where this template differs from general GitBook authoring advice.
- Commands go in fenced `bash` blocks; `#` comments stay inside the fence.
- Links inside the docs root are relative; a link to another book is `../<book>/page.md`.
  Anything else in the repository is linked with an absolute repository URL, because only
  the books are published.
- Images live in `<book>/images/`, are referenced from a page, and carry alt text that is a
  full sentence describing the picture.
- Operator, tester and developer books are organised in parts (`Part I: …`, `Part II: …`), one directory
  per part with its own `README.md`. The user book may stay flat.
- Whenever there is a landing page, every book with a `book.toml` loads `home-button.js`, so
  each page has a Home icon back to it.
- Do not put version numbers in prose; they drift on the next release.
- A page produced by a tool starts, right under the H1, with
  `<!-- Generated by <tool> from <source>. Do not edit: … -->`.

## When the template does not fit

The optional books already cover the common variations. For anything else (the project has
no operator at all, such as a browser-only tool, the tester book must be mandatory for this
team, or the folders need other names), do not force it and do not edit the validator's `template.json`.
Put a `.docs-template.json` in the docs root with the aliases or required pages that differ
(same shape as `template.json`, for example `{"roles": {"tester": {"optional": false}}}`);
both scripts read it. Say in your report what you changed
and why.

## Files

- `scripts/scaffold_docs.py`: the scaffold (python3 3.8+, standard library only).
- `assets/outline.json`: the starting outline of each book and the brief of each page.
- `assets/`: the files the scaffold copies (`index.html`, `book.toml`, `gitbook.yaml`,
  `home-button.js`, `Makefile.docs`, `docs.yml`, `docs-check.sh`, `docs-index.md`).
- `references/writing.md`: how to gather the facts and write each kind of page; read it
  before step 3.
