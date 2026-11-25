# The book-per-reader documentation template

This is the layout the validator checks against: one landing page and one book per kind of
reader. It was extracted from a working project (memors-mcp, `docs/guide/`) and generalised.
Every rule below says *why* it exists; when a project deviates for a good reason, say so in
the report instead of insisting. Earlier versions called it the three-book template.

Contents: 1 Shape · 2 Landing page · 3 Book anatomy · 4 SUMMARY.md · 5 Book README ·
6 Pages · 7 Role requirements · 8 Repository integration · 9 Known false positives

The script enforces §1–§4 and §8 mechanically. The qualitative pass needs only §5 (README),
§6 (pages and tone) and §7 (role requirements); §9 is for findings that look wrong.

## 1. Shape

```
<docs-root>/                 (usually docs/guide/)
├── index.html               landing page: one card per book that exists
├── <user-book>/             entry-level getting started         (role: user, required)
├── <operator-book>/         deployment and operations           (role: operator, required)
├── <tester-book>/           quality assurance                   (role: tester, optional)
└── <developer-book>/        changing the code                   (role: developer, optional)
```

One landing page and one book per role, at most one book for each role. The audiences read
differently: a newcomer wants a story and a ten-minute win, an operator wants a reference
they can grep, a tester wants to know what blocks a merge, a developer wants to find the
code that does a thing and the rules for changing it. Mixing them into one book makes every
page too long for most of its readers.

**Required and optional.** Every project has someone who uses it and someone who installs
and runs it, so the user and operator books are required. The tester and developer books
are optional, because not every project has those readers: a small tool may have no test
suite worth a book, and an internal service may take no outside contributions. An optional
book that is absent is not a finding. An optional book that exists is checked exactly like
a required one. Do not write an optional book to satisfy the template; write it when the
reader exists.

**Operator and developer.** An earlier version of this template had no developer book: the
operator book carried the internals, and a separate book was rejected because it would
repeat the "how it works" part. That left people who change the code without a home, and
operator books grew chapters such as "Build from source" and "Release engineering". The
rule that removes the overlap: the operator book keeps the **runtime view** (processes,
storage, what talks to what, what an operator can observe), and the developer book carries
the **code view** (packages, extension points, conventions, how to build and release). When
there is no developer book, a short build-from-source chapter may stay in the operator book.

**Tests without a tester book.** When there is a developer book and no tester book, how to
run the tests and which tests a change needs belong in the developer book's contributing
part. When there is neither, nothing about tests is required.

Folder names are free; the validator maps them to roles through the aliases in
`assets/template.json` (`user`, `getting-started`, … / `operator`, `internals`, `deploy`, … /
`tester`, `qa`, `testing`, … / `developer`, `dev`, `contributing`, …). When a name contains
aliases of two roles, the stronger match wins: the whole name, then the leading word, then
the trailing word. So `operator-guide` is the operator book, although `guide` on its own is
a user alias.

A project can change which books are required in `<docs-root>/.docs-template.json`:
`{"roles": {"tester": {"optional": false}}}` makes the tester book mandatory again, and
`{"roles": {"operator": {"aliases": ["operator", "developer"]}, "developer": {"aliases": []}}}`
keeps a book in a folder named `developer/` in the operator role, as older trees had it.

## 2. Landing page (`index.html`)

A single static HTML file, no framework, served at the site root above the books.

- `<title>` and `<meta name="description">` so the page is indexable and the browser tab is named.
- A one-line product claim (the "lede"), then **one card per book**, each with:
  an audience tag ("For everyone", "For operators", "For testers", "For developers"), the book title,
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
| `home-button.js` | Menu-bar **Home** icon linking back to the landing page, loaded from `book.toml` with `additional-js = ["home-button.js"]`; the same file in every book | expected in every book that has a `book.toml` whenever the site has a landing page; see "The Home button" below |
| `images/*.svg` | Diagrams, one folder per book | referenced from pages with long alt text |

Each book's `README.md` stays in the book root. The entry-level (user) book may be **flat**
(all pages at the root). The operator, tester and developer books are organised in **Parts**: one
directory per part, each with its own `README.md` that names the part and lists its chapters
in one line each. Parts give the reader a table of contents at the right altitude and give the
author a place to put "read these four chapters first".

Advanced books end with an **Appendix** (glossary plus further reading, or "words and
commands"). Glossaries are per book because the audiences use different words.

### The Home button

Whenever the site has a landing page, every mdBook book shows a **Home** icon at the top of
each page, in the menu bar next to the sidebar toggle. It links to the landing page. Without
it a reader who arrives deep inside one book, from a search result or a shared link, has no
way to reach the front door or the other books. GitBook has its own site header, so this is
for the mdBook build only.

To add it to a book:

1. Put `home-button.js` in the book folder, next to `book.toml`. The file is the same in
   every book (`gitbook-docs-creator` ships it as `assets/home-button.js`):

   ```js
   // Adds a "Home" icon to the menu bar that links to the landing page.
   (function () {
     // The menu bar is #menu-bar up to mdBook 0.4 and #mdbook-menu-bar from 0.5.
     var bar = document.querySelector('#menu-bar .left-buttons, #mdbook-menu-bar .left-buttons');
     if (!bar) return;
     var a = document.createElement('a');
     a.className = 'icon-button';
     a.href = (typeof path_to_root === 'string' ? path_to_root : '') + '../';
     a.title = 'Home';
     a.setAttribute('aria-label', 'Home');
     a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';
     bar.appendChild(a);
   })();
   ```

2. Load it from the book's `book.toml`, under `[output.html]`:

   ```toml
   [output.html]
   additional-js = ["home-button.js"]
   ```

   If the book already lists other scripts, add `"home-button.js"` to the same array.

3. Build the site and open any page of the book: the icon is in the top bar and leads to the
   landing page from every depth.

How it finds the landing page: mdBook defines `path_to_root` on every page (`""` at the book
root, `"../"` one level down, and so on). The landing page sits one level above the book, so
the link is `path_to_root + "../"`. The script looks for the menu bar under both of its ids,
`#menu-bar` (mdBook up to 0.4) and `#mdbook-menu-bar` (0.5 and later); a script that knows only
the first one adds no button on a current mdBook and reports no error. This holds when the built site keeps the layout
`site/index.html` plus `site/<book>/`, which is what `make docs-site` produces. Preview with
`make docs-site`, not `mdbook serve`: a single served book has no landing page above it.

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
   books with `../<book>/`. The books are one site; each must send the wrong reader
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
is precise and quotes defaults; the tester book names files and commands on every page; the
developer book names packages, files and functions and says why the code is shaped as it is.

## 7. Role requirements

Minimum pages per role (matched by SUMMARY title keywords, configurable in `template.json`):

| Role | Book | Must have (error) | Should have (warn) |
|---|---|---|---|
| user | required | quick start, FAQ/troubleshooting, glossary | everyday use, trust/privacy, use cases |
| operator | required | how it works (runtime view), install/deploy, configuration reference, monitoring, operations | commands, glossary |
| tester | optional | running the tests, gates/CI, adding tests (+ PR checklist) | what is tested where, exploratory, glossary/appendix |
| developer | optional | architecture or code layout, development setup, contributing and conventions | extending, release, glossary |

The page requirements of an optional role apply only when its book exists.

## 8. Repository integration

Outside the docs root, a template-following project has:

- Root `README.md` linking **every** book that exists (not "both guides" once a third exists).
- A docs index (`docs/README.md`) listing each book, the landing page and the design documents.
- `Makefile` targets `docs` (check + build all books), `docs-check`, `docs-serve BOOK=…`
  (one book, live reload) and `docs-site` (build every book, copy the landing page to the
  site root, then serve the whole site locally). Why `docs-site`: the landing page and the
  links between books only work when the site is served from its root, so this is the one
  way to see locally what readers get. A typical recipe ends in
  `python3 -m http.server --directory site`.
- A Pages workflow that builds all books with a pinned, checksum-verified mdBook and copies
  `index.html` to the site root.
- A `docs-check` script that keeps references honest against the code (env vars, commands,
  metrics appear in the operator book) and checks relative links.

## 9. Known false positives

- `# comment` lines inside fenced code blocks are not headings. Strip fences before counting H1s.
- Generated pages may legitimately contain several `##` sections with the same name.
- Anchors like `#gap-15` may point at generated HTML ids; verify against the heading slug
  (lowercase, spaces → `-`, punctuation dropped) before reporting.
