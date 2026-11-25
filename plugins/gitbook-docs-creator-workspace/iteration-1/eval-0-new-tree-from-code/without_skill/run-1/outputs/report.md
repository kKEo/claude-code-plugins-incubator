# pingboard documentation: report

The documentation for pingboard is written and lives under `docs/guide`: a landing page plus a user guide, an operator guide and a tester guide. All three books build cleanly with mdBook 0.5.4; I did not publish them to GitBook, so that side is untested.

I had no description of your standard layout to work from, so the folder structure below is my best reading of it. Please check it against an existing service before merging.

## Layout

| Path | Content |
| --- | --- |
| `docs/guide/index.html` | Static landing page linking to the three books |
| `docs/guide/user/` | User guide, 8 pages: installation, quick start, targets, one-off check, dashboard, command reference, troubleshooting |
| `docs/guide/operator/` | Operator guide, 10 pages: architecture, development, deployment, configuration, HTTP endpoints, monitoring, data and backup, security, troubleshooting |
| `docs/guide/tester/` | Tester guide, 8 pages: test environment, automated tests, coverage, manual test cases, CI, release checklist, defect reporting |
| `docs/guide/README.md` | How the tree is organised, how to build it and the writing rules |
| `docs/guide/Makefile` | `make -C docs/guide build` writes the landing page and the books to `docs/guide/_build/` |

Each book folder holds `.gitbook.yaml`, `book.toml`, `SUMMARY.md`, `README.md` and its pages directly, with no `src/` subfolder. For GitBook, each book is meant to be its own space with the project directory set to the book folder.

## Decisions to confirm

- **Plain Markdown only.** No GitBook blocks such as hints or tabs, because mdBook would show them as raw text.
- **No links between books.** Other books are referred to by name, since GitBook publishes them as separate spaces.
- **Edit links assume `main`.** `book.toml` points at `https://github.com/example/pingboard` with edit links on the `main` branch, taken from the CI workflow.
- **The systemd unit is an example.** The repository ships no deployment artefacts, so the Deployment page says the unit is something to adapt.
- **The root `README.md` gained one line** pointing to `docs/guide`. Nothing else outside `docs/guide` changed.
- **CI does not build the docs.** I left the workflow alone; adding a docs build step is a small follow-up if you want it.

## Behaviour found in the code that the guides now document

The content comes from reading the code, and I ran the command line to confirm output formats, exit codes and error messages. The dashboard and its endpoints were documented from the code without running the server. These points are worth knowing because they are weaknesses rather than features:

- **The check loop can die silently.** An invalid or unreadable targets file ends the background thread, while the HTTP server and `/healthz` keep answering `ok`. The Monitoring page recommends alerting on `pingboard_checks_total` not growing.
- **Removed targets never disappear.** Their last result stays on the dashboard and in `/metrics` until a restart.
- **No authentication, no TLS, no escaping.** Target URLs go unescaped into the dashboard HTML and the metric labels.
- **Bad numeric settings give a traceback.** A non-numeric port, interval or timeout fails every command with a `ValueError`, not a clear message.
- **Test coverage is thin.** Five tests cover `config`, `store` and one `add` error path; `check.py`, `server.py` and most of the command line have none. The tester guide fills the gap with 24 manual test cases and says where to add automated tests first.

## Wording feedback on the request

The request was clear. Two small points: "Our service pingboard" reads more naturally as "Our pingboard service", and "write it" is clearer as "write the content".
