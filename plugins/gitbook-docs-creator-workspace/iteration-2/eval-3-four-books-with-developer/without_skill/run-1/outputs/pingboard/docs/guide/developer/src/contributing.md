# Contributing a change

Contributions are welcome: fixes, tests, documentation and features that fit the scope of the project.

## Scope

pingboard checks URLs and shows which ones are up. It aims to stay small, free of dependencies and easy to read. A feature fits when it serves that purpose without a new dependency and without a new kind of state. Notifications, user accounts and a database are examples that do not fit; they belong to the monitoring system around pingboard.

If you are not sure, ask in an issue before you write code.

## The steps

### 1. Find or open an issue

* For a defect, describe how to reproduce it. The tester guide has a template.
* For a feature, describe the problem it solves before the solution.
* For a small fix, such as a typing mistake or an obviously wrong line, skip the issue and open the pull request directly.

Say in the issue that you work on it, so that nobody duplicates the effort. [Known limitations and ideas](limitations.md) lists good first contributions.

### 2. Create a branch

Update your fork and branch from `main`:

```
git fetch upstream
git switch -c fix-remove-message upstream/main
```

### 3. Make the change

* Follow the [coding conventions](conventions.md).
* Use the checklists in [How to make common changes](recipes.md).
* Add or update tests.
* Update the documentation under `docs/guide/` in the same pull request when behaviour changes. See [Working on the documentation](documentation.md).

### 4. Check locally

```
make lint test
```

For a change to `check.py`, `cli.py` or `server.py`, also run the affected sections of the manual test plan in the tester guide. Large parts of these modules have no automated tests yet.

### 5. Open the pull request

Push the branch to your fork and open a pull request against `main` of `example/pingboard`. In the description, say:

* **what** changes for a user or an operator, in one or two sentences;
* **why**, with a link to the issue (`Fixes #123`);
* **how you tested** it: new tests, and manual steps if any;
* **whether it breaks** an existing interface: command line, output format, environment variables, HTTP routes, metrics or the data file.

Keep a pull request to one topic. Two small pull requests are reviewed faster than one large one.

### 6. Review

Continuous integration runs the lint and the tests on Python 3.9 and 3.12; both runs must be green. A maintainer then reviews the change. Answer review comments with further commits on the same branch, without rewriting the commits that were already reviewed, so that the reviewer can see what changed.

## Checklist for a pull request

* [ ] One topic, linked to an issue if there is one
* [ ] `make lint` and `make test` pass
* [ ] New behaviour has tests; a fix has a test that fails without it
* [ ] Runs on Python 3.9
* [ ] No new runtime dependency
* [ ] Documentation updated: user, operator, tester and developer guide as far as they are affected
* [ ] Breaking changes are named in the description

## What counts as a breaking change

Users script against pingboard, and operators build alerts on it. These are the interfaces to keep stable:

| Interface | Examples of a breaking change |
| --- | --- |
| Command line | Renaming a command or an option; changing an exit status |
| Text output of `check` | Changing the columns or their order |
| JSON of `check --json` and `/api/status` | Renaming or removing a field; changing a type |
| Environment variables | Renaming a variable; changing a default; stricter validation |
| HTTP routes | Changing a path, a status or a content type |
| Metrics | Renaming a metric or a label |
| Data file | Any change that an older version cannot read |

A breaking change is possible when the reason is good, but it must be deliberate and announced. Adding a field, an option, a route or a metric is not breaking.

The Python modules are not a public interface. Refactor them freely, as long as the tests pass.

## Licence

pingboard is published under the MIT licence. By contributing you agree that your contribution is published under the same licence.

## Conduct

Be kind and factual in issues and reviews. Criticise code, not people, and assume that the other person wants to improve the project as much as you do.
