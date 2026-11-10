# gitbook-docs-validator

Checks a project's GitBook/mdBook documentation tree against a fixed three-book template and reports what is missing or deviates. It combines a deterministic Python script with a qualitative review pass, and always produces a report in the same shape so results from different projects compare.

## The template

One static landing page plus exactly three books, each for a different reader:

| Role | Reader | Promise |
|---|---|---|
| **user** | someone new, non-technical | plain words, a timed quick start, everyday tasks, FAQ, glossary |
| **operator** | runs or develops the system | how it works inside, install/deploy, configuration reference, monitoring, day-two operations |
| **tester** | checks that changes are safe | how to run the tests, what blocks a merge, how to add tests, how to explore by hand |

The full template with the reasoning behind each rule lives in `skills/gitbook-docs-validator/references/template.md`.

## Install

```
/plugin install gitbook-docs-validator --marketplace kKEo/claude-code-plugins-incubator
```

## Usage

Ask Claude to check, review, audit or lint the docs. Example prompts:

```
does our documentation follow the template?
check docs/guide against the three-book layout
review the docs in this PR before we publish
which pages are orphaned or unpublished?
```

The skill will:

1. Locate the docs root (the directory holding `index.html` and the book folders, usually `docs/guide/`).
2. Run `scripts/validate_docs.py` once for the mechanical checks: landing page links, the three roles present once each, `README.md`/`SUMMARY.md`/`.gitbook.yaml`/`book.toml` per book, orphan pages, missing files, heading structure, images and alt text, relative links and anchors, stub pages without a `> Draft.` marker, reading-map rows that point to unpublished pages, a timed quick start, required pages per role, and (with `--repo-root`) the root README, Makefile targets and docs CI workflow. It prints a ready report skeleton and a short worklist of files for step 3.
3. Read only the worklist (landing page, the three book READMEs, one page per role) and judge what the script cannot: audience fit, lead paragraphs, reading-map tables, drift against the code. For structure-only requests this step is skipped.
4. Finish the skeleton into a report with a verdict, structural failures, template deviations, suggestions and what was not checked.

It stops at the report unless you ask for fixes.

### Running one validator

The checks are split into validators that also run on their own:

| Command | Validators | Reads pages? |
|---|---|---|
| `/gitbook-docs-validator:structure [path]` | `landing`, `files`, `summary` | no |
| `/gitbook-docs-validator:links [path]` | `links` | no |
| `/gitbook-docs-validator:content [path]` | `pages`, `readme`, `roles` + qualitative pass | worklist only |
| `/gitbook-docs-validator:repo [path] [--repo-root DIR]` | `repo` | no |

A partial run is titled `Documentation check (<validators>)` and lists the validators it skipped, so it is never mistaken for a full template check.

### Running the script directly

```bash
python3 skills/gitbook-docs-validator/scripts/validate_docs.py docs/guide --repo-root . \
    [--only CHECKS | --skip CHECKS] [--list-checks] [--format text|md|json] [--worklist] [--quiet]
```

`--only links,summary` runs just those validators and `--skip repo` runs the rest (`books`, the role mapping, always runs). `--list-checks` describes them. `--format md` prints the report skeleton, `--worklist` lists the files for the qualitative pass, and `--quiet` hides INFO notes. Exit status 1 means at least one ERROR, 2 means invalid arguments. Python 3.8+, standard library only.

### Custom folder names

The script maps folders to roles through aliases (`user`/`getting-started`, `operator`/`internals`/`deploy`, `tester`/`qa`/`testing`, …). For other names, drop a `.docs-template.json` into the docs root with extra `aliases`, in the same shape as `skills/gitbook-docs-validator/assets/template.json`.

## Layout

```
gitbook-docs-validator/
├── .claude-plugin/plugin.json
├── commands/                        # structure, links, content, repo
└── skills/gitbook-docs-validator/
    ├── SKILL.md
    ├── scripts/validate_docs.py     # entry point: flags and output
    ├── scripts/gbv/                 # core, context, render; checks/<validator>.py
    ├── references/template.md       # the template, with reasoning
    ├── assets/template.json         # roles, aliases, required pages
    └── evals/                       # eval cases and fixtures
```

## License

MIT
