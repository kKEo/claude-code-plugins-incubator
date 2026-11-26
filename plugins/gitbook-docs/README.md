# gitbook-docs

Three skills for GitBook/mdBook documentation that follows a fixed book-per-reader template (earlier called the three-book template):

- **`gitbook-docs-validator`** checks a documentation tree against the template and reports what is missing or deviates. It combines a deterministic Python script with a qualitative review pass, and always produces a report in the same shape so results from different projects compare.
- **`gitbook-docs-creator`** creates such a tree: a script scaffolds the landing page and the books, the skill writes the pages from the project's code, and the validator is the acceptance check at the end.
- **`gitbook-docs-article`** adds a dated article: a script creates it in the `articles/` book under a file name that starts with its date and rebuilds the indexes, newest first, including an Articles section on the landing page; the skill writes the article.

They are separate skills because they need different habits. The validator reads a fixed handful of files and stops at a report; the creator reads the code and writes dozens of pages; the article skill writes one page that is pinned to a date. They share one template, so what the creator and the article skill write is what the validator checks.

## The template

One static landing page plus one book per kind of reader. Two books are required and two are optional:

| Role | Book | Reader | Promise |
|---|---|---|---|
| **user** | required | someone new, non-technical | plain words, a timed quick start, everyday tasks, FAQ, glossary |
| **operator** | required | installs and runs the system | how it works at run time, install/deploy, configuration reference, monitoring, day-two operations |
| **tester** | optional | checks that changes are safe | how to run the tests, what blocks a merge, how to add tests, how to explore by hand |
| **developer** | optional | changes the code | how the code is organised, development setup, conventions, extending, releasing |

An optional book that is absent is not a finding; one that exists is checked like any other. The operator book keeps the runtime view (what runs, what it stores, its settings and signals) and the developer book the code view (packages, conventions, build and release), so the two do not repeat each other. A project can make an optional book mandatory, or change the folder aliases, in `<docs-root>/.docs-template.json`.

Upgrading from 0.4: a book folder named `developer/` or `dev/` used to count as the operator book and now counts as the developer book. To keep the old meaning, put `{"roles": {"operator": {"aliases": ["operator", "developer"]}, "developer": {"aliases": []}}}` into `.docs-template.json`.

Next to the books, a site can have an `articles/` book with dated articles. It is optional and has no role; see [Writing an article](#writing-an-article).

The full template with the reasoning behind each rule lives in `skills/gitbook-docs-validator/references/template.md`.

## Install

```
/plugin install gitbook-docs --marketplace kKEo/claude-code-plugins-incubator
```

### Moving from gitbook-docs-validator

Up to version 0.5.1 this plugin was named `gitbook-docs-validator`. It was renamed in 0.6.0 because it also creates documentation. An install under the old name gets no more updates; replace it:

```
/plugin uninstall gitbook-docs-validator
/plugin install gitbook-docs --marketplace kKEo/claude-code-plugins-incubator
/reload-plugins
```

The four commands moved with the plugin name: `/gitbook-docs-validator:structure`, `:links`, `:content` and `:repo` are now `/gitbook-docs:structure`, `:links`, `:content` and `:repo`. The skills keep their names, `gitbook-docs-validator` and `gitbook-docs-creator`, and the scripts keep their paths inside the plugin.

## Checking documentation

Ask Claude to check, review, audit or lint the docs. Example prompts:

```
does our documentation follow the template?
check docs/guide against the template
review the docs in this PR before we publish
which pages are orphaned or unpublished?
```

The skill will:

1. Locate the docs root (the directory holding `index.html` and the book folders, usually `docs/guide/`).
2. Run `scripts/validate_docs.py` once for the mechanical checks: landing page links, the optional articles book (dated file names, newest first, indexed on the landing page), each required role present once and each optional role at most once, `README.md`/`SUMMARY.md`/`.gitbook.yaml`/`book.toml` per book (with the Home-button script that links back to the landing page), orphan pages, missing files, heading structure, images and alt text, relative links and anchors, stub pages without a `> Draft.` marker, reading-map rows that point to unpublished pages, a timed quick start, required pages per role, and (with `--repo-root`) the root README, Makefile targets and docs CI workflow. It prints a ready report skeleton and a short worklist of files for step 3.
3. Read only the worklist (landing page, each book's README, one page per role) and judge what the script cannot: audience fit, lead paragraphs, reading-map tables, drift against the code. For structure-only requests this step is skipped.
4. Finish the skeleton into a report with a verdict, structural failures, template deviations, suggestions and what was not checked.

It stops at the report unless you ask for fixes.

### Running one validator

The checks are split into validators that also run on their own:

| Command | Validators | Reads pages? |
|---|---|---|
| `/gitbook-docs:structure [path]` | `landing`, `articles`, `files`, `summary` | no |
| `/gitbook-docs:links [path]` | `links` | no |
| `/gitbook-docs:content [path]` | `pages`, `readme`, `roles` + qualitative pass | worklist only |
| `/gitbook-docs:repo [path] [--repo-root DIR]` | `repo` | no |

A partial run is titled `Documentation check (<validators>)` and lists the validators it skipped, so it is never mistaken for a full template check.

### Running the script directly

```bash
python3 skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root . \
    [--only CHECKS | --skip CHECKS] [--list-checks] [--format text|md|json] [--worklist] [--quiet]
```

`--only links,summary` runs just those validators and `--skip repo` runs the rest (`books`, the role mapping, always runs). `--list-checks` describes them. `--format md` prints the report skeleton, `--worklist` lists the files for the qualitative pass, and `--quiet` hides INFO notes. Exit status 1 means at least one ERROR, 2 means invalid arguments. Python 3.8+, standard library only.

## Creating documentation

Ask Claude to create, scaffold, write or migrate the docs. Example prompts:

```
set up documentation for this service under docs/guide
our docs are one long README; move them into the books
we are opening the project to contributors; add a developer guide
the tester guide was never written; add it
fill in the draft pages of the operator guide
```

The skill will:

1. Look at the project: the docs root, the documentation that exists, and the facts in the code (commands, settings, logs and metrics, tests, CI). Decide which optional books the project needs: the tester book when there is a test suite or CI, the developer book when people change or extend the code.
2. Run `scripts/scaffold_docs.py`. It writes the landing page and, per book, `README.md`, `SUMMARY.md`, `.gitbook.yaml`, `book.toml`, `home-button.js` and one page per required page of the template. Each page is a stub marked `> Draft.` with a comment that says what it has to contain. The script never overwrites or edits an existing file; it lists the edits it left to the author.
3. Write the pages from the code, operator book first, then the developer and tester books when present, then the user book, following `references/writing.md`. A page keeps `> Draft.` while a fact is unknown.
4. Finish the landing page and connect the repository (README links, Makefile targets, docs workflow, `.gitignore`) with additive edits only.
5. Run `validate_docs.py` until it reports no error, then report what was written and what is still a draft.

### The Home button

Whenever the site has a landing page, every mdBook book shows a Home icon at the top of each page that links back to it. The scaffold adds it to each book it creates: a `home-button.js` file next to `book.toml`, loaded with `additional-js = ["home-button.js"]` under `[output.html]`. For a book that already exists, add that line yourself; the validator warns about any book without the button. `references/template.md` §3 of the validator skill has the script and explains how it finds the landing page.

### Running the scaffold directly

```bash
python3 skills/gitbook-docs-creator/scripts/scaffold_docs.py docs/guide --repo-root . \
    [--name NAME] [--repo-url URL] [--lede TEXT] [--books ROLES] [--folders ROLE=FOLDER,...] \
    [--repo-files] [--template FILE] [--dry-run]
```

Without `--books` the script scaffolds the two required books plus any optional book that already exists; `--books user,operator,tester,developer` names them, and `--books tester` adds one book. `--folders user=getting-started,tester=qa` picks folder names, `--repo-files` also adds a Makefile, a docs workflow, `scripts/docs-check.sh` and a docs index where the repository has none, and `--dry-run` prints the plan. Python 3.8+, standard library only.

## Writing an article

Ask Claude for an article, a news item, an announcement or a release write-up. Example prompts:

```
write an article announcing that imports read gzip files now
add a news item to the docs: the settings file moved
start a post-mortem for the outage on 3 March, don't publish it yet
the February article has a new title; refresh the landing page
```

The skill will:

1. Find the docs root and the facts the article states (the code, the commits, the issue), and settle the title and the date.
2. Run `scripts/add_article.py`. It writes `articles/<date>-<slug>.md` as a stub marked `> Draft.`. For the first article it also creates the articles book (`README.md`, `SUMMARY.md`, `.gitbook.yaml`, `book.toml`, `home-button.js`) and inserts the Articles section into the landing page, above the footer.
3. Write the article: an H1, the date line, a lead paragraph that the indexes show as the summary, then the body. Delete the `> Draft.` line when it is ready to publish.
4. Run `add_article.py --sync`, which rebuilds the three indexes from the article files, newest first: `articles/SUMMARY.md`, the list in `articles/README.md`, and the Articles section of `index.html` (the newest five published articles and a link to all of them).
5. Run `validate_docs.py` and report.

The date is stored once, in the file name, so a rename is all it takes to re-date an article. A draft is listed in the book's `SUMMARY.md` and left off the landing page. On the landing page the script changes only what is between `<!-- articles:start -->` and `<!-- articles:end -->`; move the two markers to move the section. The build has to include the new book: add `articles` to `BOOKS` in the Makefile, which the script reminds you of.

### Running the article script directly

```bash
python3 skills/gitbook-docs-article/scripts/add_article.py docs/guide --title "TITLE" \
    [--date YYYY-MM-DD] [--slug SLUG] [--summary TEXT] [--name NAME] [--repo-root DIR] \
    [--repo-url URL] [--latest N] [--template FILE] [--dry-run]
python3 skills/gitbook-docs-article/scripts/add_article.py docs/guide --sync [--latest N] [--dry-run]
```

`--date` defaults to today and `--slug` to a short form of the title. `--summary` starts the article with its lead paragraph. `--latest` sets how many articles the landing page shows (default 5). `--name` is used when the articles book is created (default: the landing page's `<h1>`). For another folder name, put `{"articles": {"folder": "news"}}` into `<docs-root>/.docs-template.json`. Python 3.8+, standard library only.

## Custom folder names

Both scripts map folders to roles through aliases (`user`/`getting-started`, `operator`/`internals`/`deploy`, `tester`/`qa`/`testing`, `developer`/`dev`/`contributing`, …). For other names, drop a `.docs-template.json` into the docs root with extra `aliases`, in the same shape as `skills/gitbook-docs-validator/assets/template.json`.

## Layout

```
gitbook-docs/
├── .claude-plugin/plugin.json
├── commands/                        # structure, links, content, repo
└── skills/gitbook-docs-validator/
    ├── SKILL.md
    ├── scripts/validate_docs.py     # entry point: flags and output
    ├── scripts/gbv/                 # core, context, render; checks/<validator>.py
    ├── references/template.md       # the template, with reasoning
    ├── assets/template.json         # roles, aliases, required pages
    └── evals/                       # eval cases and fixtures
└── skills/gitbook-docs-creator/
    ├── SKILL.md
    ├── scripts/scaffold_docs.py     # writes the tree; never overwrites
    ├── assets/                      # outline.json and the files the scaffold copies
    ├── references/writing.md        # how to gather facts and write each kind of page
    └── evals/                       # eval cases and fixtures
└── skills/gitbook-docs-article/
    ├── SKILL.md
    ├── scripts/add_article.py       # adds a dated article; rebuilds the indexes
    └── evals/                       # eval cases (fixtures are the validator's)
```

## License

MIT
