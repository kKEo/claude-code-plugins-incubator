# Working on the documentation

The documentation lives in the repository, under `docs/guide/`, and changes together with the code. A pull request that changes behaviour updates the documentation in the same pull request.

## Layout

```
docs/guide/
├── index.html          static landing page with a link to each book
├── README.md           overview of this folder for readers on GitHub
├── Makefile            builds the landing page and all books into _site/
├── user/               user guide
├── operator/           operator guide
├── tester/             tester guide
└── developer/          developer guide (this book)
```

Every book has the same structure:

```
<book>/
├── .gitbook.yaml       GitBook: where the content and the table of contents are
├── book.toml           mdBook: title, source folder and repository links
└── src/
    ├── README.md       first page of the book
    ├── SUMMARY.md      table of contents
    └── <page>.md       one file per page
```

## The four books and their readers

Put new content into the book of the reader who needs it. If two readers need it, write it once and name the other book and page in a sentence.

| Book | Reader | Answers | Does not contain |
| --- | --- | --- | --- |
| User guide | Uses pingboard on their own machine | "How do I ...?" | Service setup, internals |
| Operator guide | Runs pingboard as a service | "How do I deploy, configure, watch and repair it?" | Python internals |
| Tester guide | Verifies a change or a version | "How do I know that it works?" | How to design a change |
| Developer guide | Changes the code | "How does it work, and how do I change it?" | Usage instructions |

## Two build tools, one source

The same Markdown files are published with GitBook and built with mdBook. Both read `SUMMARY.md`. To keep both working, follow these rules:

* **`SUMMARY.md` is a flat bullet list of links**, with `README.md` as the first entry. Every page must be listed; a page that is not in `SUMMARY.md` is not published. Do not use part titles or separators, which the two tools treat differently.
* **Use standard Markdown only**: headings, paragraphs, lists, tables, fenced code blocks, links, images and block quotes.
* **Do not use GitBook blocks**: hints, tabs, steppers and the other blocks that are written as tags in braces and percent signs. mdBook prints them as text.
* **Do not use mdBook features**: include directives in double braces, and hidden code lines. GitBook prints them as text.
* **For a note or a warning, use a block quote** that starts with a bold word: `> **Warning:** ...`.
* **Link to pages of the same book with a relative path** to the `.md` file: `[Architecture](architecture.md)`. Both tools rewrite such links.
* **Do not link from one book to another.** A relative link across books works in neither published form, because each book is published on its own. Name the book and the page in words instead.
* **One `#` heading per page**, as its first line. It is the title of the page.
* **Put images** into `src/images/` of the book that uses them and give each one an alternative text.

## Add a page

1. Create `<book>/src/<name>.md`. Use a short lower-case file name with hyphens.
2. Start it with a `#` heading.
3. Add a line to `<book>/src/SUMMARY.md` at the right position.
4. If the first page of the book has a table of its pages, add a row there.
5. Build the book and click through the new page and its links.

To rename or delete a page, search all books for its file name and its title, because other books refer to pages by name.

## Build and preview

Install [mdBook](https://rust-lang.github.io/mdBook/guide/installation.html), then:

| Goal | Command |
| --- | --- |
| Preview one book with live reload | `mdbook serve docs/guide/developer --open` |
| Build one book | `mdbook build docs/guide/developer` |
| Build the landing page and all books | `make -C docs/guide build` |
| Remove all build output | `make -C docs/guide clean` |

`make build` writes the complete site to `docs/guide/_site/`; open `_site/index.html`. A single `mdbook build` writes to the `book/` folder of the book. Both folders are ignored by git; never commit them.

mdBook reports a page that is listed in `SUMMARY.md` but missing on disk as an error, because `create-missing` is switched off in every `book.toml`.

## Publish with GitBook

Each book is one GitBook space. In the Git Sync settings of the space, select the repository and set the project directory to the folder of the book, for example `docs/guide/user`. GitBook reads `.gitbook.yaml` from that folder and takes the content from `src/`.

## The landing page

`index.html` is a single static file without scripts and without external resources. Its links, such as `user/index.html`, point to the books as `make build` arranges them in `_site/`. When a book is added or renamed, update `index.html`, `README.md`, the `BOOKS` list in the `Makefile` and the table on this page.

## Writing style

* Write for a reader who may not be a native speaker of English: short sentences, common words, one idea per sentence.
* Address the reader as "you" and use the present tense and the active voice.
* Use the same word for the same thing everywhere. The fixed terms are: **target** (a URL on the list), **check** (one request to one target), **round** (one pass over all targets), **up** and **down**, **dashboard** (the web page), **data file** (the file with the target list).
* Show commands and output in code blocks, and show the real output of the current version.
* Describe what the software does now. Plans belong in issues, known problems in [Known limitations and ideas](limitations.md).
* Use British spelling, as the README does ("licence").

## Keep it true

Wrong documentation is worse than none. When you review a pull request, check each changed behaviour against the pages that describe it. [How to make common changes](recipes.md) names the pages for each kind of change.
