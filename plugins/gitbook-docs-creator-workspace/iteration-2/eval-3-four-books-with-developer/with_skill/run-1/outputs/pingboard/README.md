# pingboard

Checks a list of URLs on a schedule and shows which ones are up.

    pip install -e .
    pingboard add https://example.org
    pingboard serve

MIT licence.

## Documentation

The documentation is in [docs/guide](docs/guide/), one book per reader:

- [User guide](docs/guide/user/README.md): what pingboard does and how to use it, in plain words.
- [Operator guide](docs/guide/operator/README.md): install, settings, commands, monitoring and troubleshooting.
- [Tester guide](docs/guide/tester/README.md): how to run the tests, what CI checks and how to add a test.
- [Developer guide](docs/guide/developer/README.md): how the code is organised and how to contribute a change.

`make docs-site` builds all of it and serves it locally; it needs [mdBook](https://github.com/rust-lang/mdBook).
