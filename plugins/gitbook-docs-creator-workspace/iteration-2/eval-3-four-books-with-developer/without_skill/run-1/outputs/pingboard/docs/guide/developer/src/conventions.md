# Coding conventions

## Compatibility

* The code runs on **Python 3.9** and later. Continuous integration tests 3.9 and 3.12.
* Do not use syntax or library features that are newer than 3.9. Common traps: `match` statements, `X | Y` in annotations that are evaluated at run time, `tomllib`, and parenthesised context managers.
* For type hints of collections, write `list[str]`, which Python 3.9 supports. `store.py` still uses `typing.List`, which recent ruff versions report.

## Dependencies

pingboard has **no runtime dependencies**, and this is a feature that users rely on. A pull request that adds one needs an issue with a strong reason first. Development tools (pytest, ruff) are not a problem.

## Style

* `make lint` must pass. The linter is ruff with its default rules; the repository has no ruff configuration and does not pin the ruff version. Ruff 0.16.0 and later report six findings on the code of version 0.6.0 (see [Known limitations and ideas](limitations.md)); a change must not add to them. Do not silence a finding with a `noqa` comment unless you explain why in the same line.
* No formatter is enforced. Match the code around your change: four spaces, double quotes, and lines that stay readable.
* Each module starts with a one-line docstring that says what the module is for. Keep it true when you change the module.
* Comment the reason, not the mechanics. The comment `# DNS failure, refused connection, timeout` in `check.py` is a good model: it says which cases a broad `except` is meant for.
* Prefer small, plain functions and data classes. The project has no class hierarchy and no framework, and should not grow one.

## Structure

* `config`, `store` and `check` do not import other pingboard modules. Pass what they need as arguments.
* Read the environment only in `config.py`. A new setting becomes a field of `Config`.
* Touch the file system only in `store.py`.
* Do the network request only in `check.py`.
* In `server.py`, use the shared state only inside `with lock:` and never do slow work there. See [Architecture](architecture.md).

## Messages and output

* Error messages for the user start with `pingboard: `, are written in lower case without a full stop, and say what must be true: `pingboard: a target must start with http:// or https://`.
* Exit with `sys.exit("pingboard: ...")` for an error that the user can correct.
* Log lines use `key=value` pairs for data, as in `target down url=%s status=%s error=%s`, and pass the values as arguments of the logging call instead of formatting the string first.
* The output of `pingboard check`, `/api/status` and `/metrics` is read by scripts. Treat a change to it as a breaking change: mention it in the pull request and update the user guide and the operator guide.

## Names

| Thing | Convention | Example |
| --- | --- | --- |
| Environment variable | `PINGBOARD_` and upper case | `PINGBOARD_TIMEOUT` |
| Metric | `pingboard_` and lower case; unit as suffix; counters end in `_total` | `pingboard_check_duration_ms` |
| Command and option | Lower case, words joined by hyphens | `--fail-fast` |
| Test | `test_` and the behaviour | `test_interval_floor` |

## Tests

Every change of behaviour comes with a test, and every fix comes with a test that fails without the fix. The tester guide describes the conventions and has ready patterns for each module.

## Commits

* One logical change per commit.
* A short subject line in the imperative mood: `Add a --timeout option to check`.
* Do not mix a refactoring with a change of behaviour in one commit.
