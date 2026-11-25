# notekeep documentation migration report

The README and the four files under `docs/` are now three books plus a landing page under `docs/guide`. All three books build with mdBook 0.5.4 through `docs/guide/build.sh`; I have not tested them in GitBook itself.

## Layout

```
docs/guide/
  index.html        static landing page with a card for each book
  build.sh          builds the three books and the landing page into _site/
  .gitignore        ignores _site/
  user-guide/       README, getting-started, using-notekeep, faq
  operator-guide/   README, architecture, configuration, http-api, deployment, backup-and-maintenance
  tester-guide/     README, running-the-tests, test-suite, continuous-integration
```

Each book folder has its own `.gitbook.yaml`, `SUMMARY.md` and `book.toml` (with `src = "."`), so GitBook and mdBook read the same files. In GitBook, point one space at each book folder as its project directory.

## Where the old content went

| Old | New |
|---|---|
| README "Getting started" | `user-guide/getting-started.md` (a three-line quick start stays in the README) |
| README "Configuration" | `operator-guide/configuration.md` |
| README "FAQ" | `user-guide/faq.md` |
| `docs/usage.md` | `user-guide/using-notekeep.md` |
| `docs/architecture.md` | `operator-guide/architecture.md` |
| `docs/deploy.md` | `operator-guide/deployment.md` and `operator-guide/backup-and-maintenance.md` |
| `docs/testing.md` | the three pages of `tester-guide/` |

The old `docs/*.md` files are gone, and the root `README.md` is now a short intro, a quick start and a table linking to the three books.

## Corrections made against the code

The old docs disagreed with `notekeep.py` in three places, and I made the new books follow the code:

- **Default port:** the docs said 9000, but the code and `test_default_port` say 7070. Every example now uses 7070.
- **Delete command:** the docs showed `python3 notekeep.py delete shopping`, which does not exist, and there is no delete endpoint either. The user guide now says so, and the operator guide gives the `sqlite3 ... DELETE` statement instead.
- **`NOTEKEEP_MAX_NOTE_BYTES`:** this setting (default 65536) was undocumented. It is now in the configuration page, with its 413 error in the FAQ and API page.

## Content I added

These pages go beyond the old text; everything in them is taken from the code, tests or workflow:

- **`operator-guide/http-api.md`:** endpoints, status codes and error bodies.
- **CLI note:** the CLI commands read the database file directly, not through the server.
- **`tester-guide/test-suite.md`:** a table of the three tests, how to add one, and a "Not covered yet" list (no HTTP-level tests, token check, size limit, `export`, `vacuum`).
- **`user-guide/getting-started.md`:** a short section for people whose team already runs notekeep.

## Things to check

- **Merge blocking:** "Pull requests ... cannot be merged when it fails" is carried over unchanged. The workflow does run on pull requests, but merge blocking depends on branch protection, which I could not check.
- **Cross-book links:** books refer to each other by name only, because relative links between separate GitBook spaces do not resolve. The landing page is the hub.
- **Landing page links:** `index.html` links to `user-guide/index.html` and so on, which matches the `_site/` output. If the books are published on GitBook, change those three links to the space URLs.
- **CI for docs:** I did not add a workflow that builds the docs; `build.sh` is ready for one to call.

## Wording feedback on the request

The request was clear. One slip: "three-book layout" is followed by a list of four items; "a landing page plus three books (user, operator, tester)" reads more naturally.
