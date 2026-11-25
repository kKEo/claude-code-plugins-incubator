# pingboard

Checks a list of URLs on a schedule and shows which ones are up.

    pip install -e .
    pingboard add https://example.org
    pingboard serve

MIT licence.

## Documentation

| Guide | For |
|---|---|
| [User guide](docs/guide/user/README.md) | Anyone who uses pingboard: a quick start, everyday tasks, questions and a glossary |
| [Operator guide](docs/guide/operator/README.md) | People who install, configure and run it: how it works, settings, commands, monitoring, troubleshooting |
| [Tester guide](docs/guide/tester/README.md) | People who check changes: running the tests, what CI checks, testing by hand, adding tests |

`make docs-site` builds the three guides and serves them with their landing page; [docs/README.md](docs/README.md) has the details.
