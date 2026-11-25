# pingboard documentation

The published documentation is a landing page plus one book per reader. The sources are in
`docs/guide/`.

| What | Where | For |
|---|---|---|
| Landing page | [docs/guide/index.html](guide/index.html) | The front door: one card per book |
| User guide | [docs/guide/user/](guide/user/README.md) | Everyone |
| Operator guide | [docs/guide/operator/](guide/operator/README.md) | Operators |
| Tester guide | [docs/guide/tester/](guide/tester/README.md) | Testers |
| Developer guide | [docs/guide/developer/](guide/developer/README.md) | Developers |

## Build and preview

| Command | What it does |
|---|---|
| `make docs` | Check the books, then build all of them into `site/` |
| `make docs-check` | Check links and reconcile the operator book with the code |
| `make docs-serve BOOK=user` | Preview one book with live reload |
| `make docs-site` | Build everything and serve the whole site from the landing page |

The books are GitBook-compatible Markdown and are built with [mdBook](https://github.com/rust-lang/mdBook).
A page is published only when its book's `SUMMARY.md` lists it.
