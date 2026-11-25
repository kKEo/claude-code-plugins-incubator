# pingboard documentation

This folder holds the documentation for pingboard: one static landing page and
three books.

| Path | What it is | Audience |
| --- | --- | --- |
| `index.html` | Landing page that links to the three books | Everyone |
| `user/` | User guide | People who want to watch a list of URLs |
| `operator/` | Operator guide | People who develop, deploy and run pingboard |
| `tester/` | Tester guide | People who verify a change or a release |

## Layout of a book

Each book is a self-contained folder that both GitBook and mdBook can build:

| File | Used by | Purpose |
| --- | --- | --- |
| `.gitbook.yaml` | GitBook | Points GitBook at `README.md` and `SUMMARY.md` |
| `book.toml` | mdBook | Title, source folder and output folder |
| `SUMMARY.md` | Both | Table of contents; every page must be listed here |
| `README.md` | Both | First page of the book |
| `*.md` | Both | The other pages |

## Building with mdBook

Install [mdBook](https://rust-lang.github.io/mdBook/) and run:

    make -C docs/guide build

The result is written to `docs/guide/_build/`: the landing page as
`index.html` and the books in `user/`, `operator/` and `tester/`. Open
`_build/index.html` in a browser. To work on one book with live reload, run
`mdbook serve docs/guide/user` (or `operator`, `tester`).

## Publishing with GitBook

Create one GitBook space per book, turn on Git Sync for each space and set its
project directory to `docs/guide/user`, `docs/guide/operator` or
`docs/guide/tester`. GitBook then reads the `.gitbook.yaml` in that folder.

## Writing rules

- Use plain Markdown only. GitBook blocks such as `{% hint %}` and mdBook
  helpers such as `{{#include}}` work in one tool and show up as raw text in
  the other.
- Add every new page to the `SUMMARY.md` of its book. mdBook does not build
  pages that are missing from it.
- Link to pages in the same book with relative `.md` links. Refer to pages in
  another book by name, because the books are published as separate sites.
- When the code changes behaviour, update the pages in the same pull request.
