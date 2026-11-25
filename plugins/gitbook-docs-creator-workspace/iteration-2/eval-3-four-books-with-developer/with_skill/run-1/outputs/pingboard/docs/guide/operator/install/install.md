# Install

This chapter covers the one supported way to install pingboard, how to verify it, how to run the dashboard, and how to upgrade and uninstall.

The repository ships a Python package definition (`pyproject.toml`) and nothing else: no container image, no operating-system package and no service unit. Installation is therefore from a checkout of the source.

## Before you start

- Python 3.9 or newer with `pip`. Continuous integration runs the tests on Python 3.9 and 3.12.
- `git`, to fetch the source.
- Outbound HTTP and HTTPS access from the machine to the URLs you want to check.

pingboard needs no other packages: it uses only the Python standard library.

## Install from a checkout

1. Fetch the source.

   ```bash
   git clone https://github.com/example/pingboard.git
   cd pingboard
   ```

2. Create a virtual environment and install into it.

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   pip install -e .
   ```

   `pip install -e .` is an editable install: the `pingboard` command runs the code in this checkout, so the directory has to stay where it is.

3. Verify the installation.

   ```bash
   pingboard --help
   ```

   The output starts with:

   ```text
   usage: pingboard [-h] {add,remove,list,check,serve} ...
   ```

## First run

1. Add a target and check it once.

   ```bash
   pingboard add https://example.org
   pingboard check
   ```

   `check` prints one line per target, for example:

   ```text
   up   200    87 ms  https://example.org
   ```

2. Start the dashboard.

   ```bash
   pingboard serve
   ```

   It logs one line to standard error and keeps running in the foreground:

   ```text
   2026-11-25 22:41:17,284 INFO listening on http://127.0.0.1:8080
   ```

3. From a second terminal on the same machine, confirm that it answers.

   ```bash
   curl http://127.0.0.1:8080/healthz
   ```

   The answer is `ok`.

## Run it as a service

`pingboard serve` does not put itself in the background, writes no PID file and logs to standard error. Run it under the process supervisor you already use, with these facts in mind:

- The command is `pingboard serve` from the virtual environment, for example `/path/to/pingboard/.venv/bin/pingboard serve`.
- Settings come from environment variables only; see [Environment variables and settings](../config/environment.md).
- The targets file defaults to `~/.pingboard/targets.json` of the account that runs the process. Run `pingboard add` as the same account, or set `PINGBOARD_DATA` to the same path for both.
- There is nothing to flush on shutdown: stopping the process loses only the results in memory.

> **Warning.** The dashboard has no authentication and no TLS. Setting `PINGBOARD_BIND=0.0.0.0` shows the list of URLs and their state to everyone who can reach the port. Keep the default `127.0.0.1` and put a reverse proxy in front if others need access.

## Upgrade

```bash
cd pingboard
git pull
pip install -e .
```

Then restart `pingboard serve`; a running process keeps using the code it loaded at start. Copy the targets file first if you want a way back; see [Back up and restore](../operations/backup.md).

## Uninstall

```bash
pip uninstall pingboard
rm -r ~/.pingboard
```

The second command deletes the list of targets. Skip it to keep the list, and adjust the path if you set `PINGBOARD_DATA`.
