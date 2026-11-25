# Testing

Run everything with `./run-tests.sh`. It needs pytest. The tests use a temporary database, so
they never touch your notes.

- `tests/test_api.py`: defaults and the schema.
- `tests/test_cli.py`: command line errors.

Pull requests run the same script in GitHub Actions and cannot be merged when it fails.
New behaviour needs a test in one of the two files.
