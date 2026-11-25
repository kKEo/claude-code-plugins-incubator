# Install

This page shows how to install pingboard from a checkout of the repository, how to run it, and how to upgrade and remove it.

Installing from a checkout is the only method the repository supports. It ships no container image, no service unit and no release package.

## Before you start

- Python 3.9 or newer, with `pip`.
- `git`, to fetch the repository.

pingboard needs no other package: it uses only the Python standard library.

## Install from a checkout

1. Fetch the source.

   ```bash
   git clone https://github.com/example/pingboard.git
   cd pingboard
   ```

2. Create a virtual environment and activate it. This step is optional, but it keeps the `pingboard` command apart from other Python software.

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   ```

3. Install.

   ```bash
   pip install -e .
   ```

4. Verify the result.

   ```bash
   pingboard --help
   ```

   The command prints its usage line and the five subcommands `add`, `remove`, `list`, `check` and `serve`.

The `-e` flag makes the installation use the checkout directly, so the checkout has to stay where it is.

## Run

Add at least one target, then start the server.

```bash
pingboard add https://example.org
pingboard serve
```

`serve` logs `listening on http://127.0.0.1:8080` and runs until it is stopped. From the checkout, `make run` starts the same server.

To verify that it is up:

```bash
curl http://127.0.0.1:8080/healthz
# ok
```

What a process supervisor needs to know:

- `pingboard serve` stays in the foreground and does not turn itself into a daemon.
- It writes its log to standard error. It writes no log file.
- It reads its settings from the environment; see [Environment variables and settings](../config/environment.md).
- Stopping it loses nothing on disk: the targets file is written only by `add` and `remove`.

## Make the dashboard reachable from other machines

By default the server listens on `127.0.0.1` only. To listen on every interface:

```bash
PINGBOARD_BIND=0.0.0.0 pingboard serve
```

> **Warning.** The server has no authentication and no TLS. Anyone who can reach the port can read the list of targets and their status. Put it behind a reverse proxy or a firewall before you bind it to a public address.

## Upgrade

Because the installation uses the checkout, updating the checkout updates pingboard.

```bash
git pull
pip install -e .
```

Then restart `pingboard serve`. The targets file is kept.

## Uninstall

```bash
pip uninstall pingboard
```

This leaves the targets file in place. Delete `~/.pingboard`, or the file `PINGBOARD_DATA` points to, to remove the list as well.
