# Running the tests

Run everything with `./run-tests.sh` from the repository root. It needs pytest:

    pip install pytest
    ./run-tests.sh

The script runs the pytest suite in `tests/` and then checks that `notekeep.py` compiles. It
stops at the first step that fails.

The tests use a temporary database, so they never touch your notes.
