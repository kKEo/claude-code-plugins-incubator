# pingboard

Checks a list of URLs on a schedule and shows which ones are up.

    pip install -e .
    pingboard add https://example.org
    pingboard serve

## Documentation

- [User guide](docs/guide/user/README.md): what pingboard is and how to use it, in plain words.
- [Operator guide](docs/guide/operator/README.md): how it works, install, every setting, monitoring and troubleshooting.
- [Tester guide](docs/guide/tester/README.md): how to run the tests, what CI checks and how to add a test.

`make docs-site` builds all three and serves them from the [landing page](docs/guide/index.html). See [docs/README.md](docs/README.md).

MIT licence.
