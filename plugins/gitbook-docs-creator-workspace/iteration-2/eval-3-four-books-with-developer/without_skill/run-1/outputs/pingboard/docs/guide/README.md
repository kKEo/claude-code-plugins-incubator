# pingboard documentation

This folder holds the pingboard documentation: one static landing page and four books.

| Book | For | Start here |
| --- | --- | --- |
| User guide | People who want to watch a list of URLs | [user/src/README.md](user/src/README.md) |
| Operator guide | People who run pingboard as a service | [operator/src/README.md](operator/src/README.md) |
| Tester guide | People who verify changes and releases | [tester/src/README.md](tester/src/README.md) |
| Developer guide | People who change the code | [developer/src/README.md](developer/src/README.md) |

## Layout

```
docs/guide/
├── index.html          static landing page that links to the four books
├── Makefile            builds everything into _site/ with mdBook
├── user/
│   ├── .gitbook.yaml   GitBook configuration (content root and table of contents)
│   ├── book.toml       mdBook configuration
│   └── src/
│       ├── README.md   first page of the book
│       ├── SUMMARY.md  table of contents, read by both GitBook and mdBook
│       └── *.md        one file per page
├── operator/           same structure
├── tester/             same structure
└── developer/          same structure
```

## Building

With [mdBook](https://rust-lang.github.io/mdBook/) installed:

```
make -C docs/guide build     # writes docs/guide/_site/
make -C docs/guide clean
```

Open `docs/guide/_site/index.html` to see the result. To work on one book with live reload, run `mdbook serve docs/guide/user` (or another book).

With GitBook, create one space per book and set its project directory to the book folder, for example `docs/guide/user`. Git Sync reads the `.gitbook.yaml` file in that folder.

The rules for writing pages are in the developer guide, on the page [Working on the documentation](developer/src/documentation.md).
