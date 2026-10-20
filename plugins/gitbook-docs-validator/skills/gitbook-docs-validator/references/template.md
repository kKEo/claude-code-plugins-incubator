# The three-book documentation template

This is the layout the validator checks against. It was extracted from a working project
(memors-mcp, `docs/guide/`) and generalised. Every rule below says *why* it exists; when a
project deviates for a good reason, say so in the report instead of insisting.

Contents: 1 Shape · 2 Landing page · 3 Book anatomy · 4 SUMMARY.md · 5 Book README ·
6 Pages · 7 Role requirements · 8 Repository integration · 9 Known false positives

## 1. Shape

```
<docs-root>/                 (usually docs/guide/)
├── index.html               landing page: one card per book
├── <user-book>/             entry-level getting started      (role: user)
├── <operator-book>/         low-level development/deployment (role: operator)
└── <tester-book>/           quality assurance                (role: tester)
```

One landing page, exactly three books, one book per role. The three audiences read
differently: a newcomer wants a story and a ten-minute win, an operator wants a reference
they can grep, a tester wants to know what blocks a merge. Mixing them into one book makes
every page too long for two of the three readers. Splitting further (a fourth "developer"
book) was considered and rejected: the operator book already carries the internals
("how it works") part, and a separate book would duplicate it.

Folder names are free; the validator maps them to roles through the aliases in
`assets/template.json` (`user`, `getting-started`, … / `operator`, `internals`, `deploy`, … /
`tester`, `qa`, `testing`, …).

## 2. Landing page (`index.html`)

A single static HTML file, no framework, served at the site root above the three books.

- `<title>` and `<meta name="description">` so the page is indexable and the browser tab is named.
- A one-line product claim (the "lede"), then **one card per book**, each with:
  an audience tag ("For everyone", "For operators", "For testers"), the book title,
  a two-line summary, and about three bullets of what is inside.
- Each card links with a relative `href="<book>/"` (trailing slash: the book's own index).
- A footer with the source repository and the licence.
- Light and dark colours via `prefers-color-scheme`; no JavaScript needed.

Why static: the books are built by mdBook (CI) or GitBook; the landing page must not depend
on either, so the site still has a front door when a build tool changes.

Example card:

```html
<a class="card" href="operator/">
  <div class="tag">For operators</div>
  <h2>Operator guide</h2>
  <p>How it works inside, every setting, tuning retrieval, monitoring and day-two operations.</p>
  <ul><li>Install, upgrade and configuration reference</li><li>…</li></ul>
</a>
```

## 3. Book anatomy

Each book is a self-contained GitBook space that mdBook can also build:

| File | Purpose | Rule |
|---|---|---|
| `README.md` | Book landing page | required; see §5 |
| `SUMMARY.md` | Navigation; only listed chapters are published | required; see §4 |
| `.gitbook.yaml` | `root: ./` and `structure: {readme: README.md, summary: SUMMARY.md}` | required so GitBook finds the files |
| `book.toml` | mdBook twin: `title`, `description`, `src = "."`, `build-dir = "../../../site/<book>"`, `site-url = "/<repo>/<book>/"`, `create-missing = false` | recommended; `create-missing = false` makes a typo in SUMMARY a build failure instead of a silent empty page |
| `images/*.svg` | Diagrams, one folder per book | referenced from pages with long alt text |

Each book's `README.md` stays in the book root. The entry-level (user) book may be **flat**
(all pages at the root). The operator and tester books are organised in **Parts**: one
directory per part, each with its own `README.md` that names the part and lists its chapters
in one line each. Parts give the reader a table of contents at the right altitude and give the
author a place to put "read these four chapters first".

Advanced books end with an **Appendix** (glossary plus further reading, or "words and
commands"). Glossaries are per book because the three audiences use different words.

## 4. `SUMMARY.md`

```markdown
# Summary

[Introduction](README.md)

- [Part I: How it works](intro/README.md)
  - [System overview](intro/overview.md)
  - [Data model](intro/data-model.md)
- [Part II: Install and deploy](install/README.md)
  - …
- [Appendix](appendix/README.md)
  - [Glossary](appendix/glossary.md)
```

Rules and why:

- The first link is `README.md`. GitBook treats it as the book's front page; mdBook needs it first.
- Every chapter in the book is listed. A page not in SUMMARY is **not published** by either
  tool, so an orphan is a page nobody can reach. (Generated pages are listed by their generator.)
- Every listed file exists. mdBook with `create-missing = false` fails; GitBook shows an empty page.
- Parts are numbered `Part I`, `Part II`, … in order, with roman numerals, and each part's
  link points at that directory's `README.md`.
- Nesting stays within three levels (part → chapter → sub-chapter). Deeper trees do not fit
  the sidebar.
- No file appears twice.

## 5. Book `README.md`

The book landing page answers "is this for me and where do I go" in one screen:

1. **H1** with the book name (user book may use a welcome word).
2. **Audience paragraph**: who this is for and what they are assumed to know
   ("This guide is for … It assumes you can …"). Readers self-select here.
3. **Reading map**: a table `| If you want to… | Read |` (user book) or
   `| Part | Read it when you need to… |` (advanced books), every row a link.
4. **Conventions** (advanced books): how commands are shown, what key words mean here.
5. **Cross-book callout**: a blockquote `> **Looking for …?**` linking to the sibling
   books with `../<book>/`. The three books are one site; each must send the wrong reader
   to the right book without a search.
6. Links to design documents outside the docs root use **absolute GitHub URLs**, because only
   the books are published and a relative link would 404 on the site.

## 6. Pages

- **Exactly one H1**, on the first line, matching (or close to) the SUMMARY title. mdBook uses
  it as the page title; two H1s make two titles.
- A **lead paragraph** right under the H1 says what the page is for and, for walk-throughs,
  how long it takes ("This takes about ten minutes").
- Headings never skip a level (H2 → H4). Screen readers and the sidebar rely on the hierarchy.
- Images: `![long descriptive alt text](images/file.svg)`. The alt text is a sentence that
  carries the diagram's content, not a file name, so the page still works in text search,
  in screen readers and when the SVG fails to load.
- Commands in fenced ```bash blocks, with `#` comments inside the fence (not as headings).
- Callouts as blockquotes with a bold label: `> **Warning.** …`, `> **Tip.** …`, `> **Note.** …`.
- Relative links stay inside the docs root; anything else in the repository is linked with an
  absolute GitHub URL. Cross-book links use `../<book>/page.md`.
- A page that is not finished carries a line `> Draft.` so tooling can skip reference checks
  on it and reviewers can see it is a stub.
- **Generated pages** start with an HTML comment right after the H1:
  `<!-- Generated by <tool> from <source>. Do not edit: change the source and run <command>. -->`
  and a test fails when they are stale. Hand edits to such a page are a template violation.

Tone per book: the user book avoids jargon and names things by what they do; the operator book
is precise and quotes defaults; the tester book names files and commands on every page.

## 7. Role requirements

Minimum pages per role (matched by SUMMARY title keywords, configurable in `template.json`):

| Role | Must have (error) | Should have (warn) |
|---|---|---|
| user | quick start, FAQ/troubleshooting, glossary | everyday use, trust/privacy, use cases |
| operator | how it works, install/deploy, configuration reference, monitoring, operations | commands, glossary |
| tester | running the tests, gates/CI, adding tests (+ PR checklist) | what is tested where, exploratory, glossary/appendix |

## 8. Repository integration

Outside the docs root, a template-following project has:

- Root `README.md` linking **every** book (not "both guides" once a third exists).
- A docs index (`docs/README.md`) listing each book, the landing page and the design documents.
- `Makefile` targets `docs` (check + build all books), `docs-check`, `docs-serve BOOK=…`.
- A Pages workflow that builds all books with a pinned, checksum-verified mdBook and copies
  `index.html` to the site root.
- A `docs-check` script that keeps references honest against the code (env vars, commands,
  metrics appear in the operator book) and checks relative links.

## 9. Known false positives

- `# comment` lines inside fenced code blocks are not headings. Strip fences before counting H1s.
- Generated pages may legitimately contain several `##` sections with the same name.
- Anchors like `#gap-15` may point at generated HTML ids; verify against the heading slug
  (lowercase, spaces → `-`, punctuation dropped) before reporting.
