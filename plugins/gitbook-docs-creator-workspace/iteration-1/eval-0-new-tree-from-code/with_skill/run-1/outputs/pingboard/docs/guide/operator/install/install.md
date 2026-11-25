# Install

This page shows how to install pingboard from source, check that it works, start the dashboard, and later upgrade or remove it. A first install takes a few minutes.

The repository supports one way to install: from a clone, with `pip`. It contains no container image definition, no service unit and no release packaging.

## Before you start

- Python 3.9 or newer (`requires-python = ">=3.9"` in `pyproject.toml`).
- `pip` and `git`.
- Outbound network access from the machine to every target you want to check.

pingboard needs no other packages at run time: it uses only the Python standard library.

## Install from source

1. Clone the repository and enter it.

   ```bash
   git clone https://github.com/example/pingboard
   cd pingboard
   ```

2. Create a virtual environment and activate it. This keeps pingboard apart from the system Python, and it gives you a `python` command, which the `Makefile` expects.

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   ```

3. Install the package in editable mode.

   ```bash
   pip install -e .
   ```

   This puts the command `pingboard` on your path (`[project.scripts]` in `pyproject.toml`).

## Verify the install

```bash
pingboard --help
```

You should see the five commands:

```text
usage: pingboard [-h] {add,remove,list,check,serve} ...

positional arguments:
  {add,remove,list,check,serve}
    add                 add a URL to the list
    remove              remove a URL from the list
    list                print the URLs, one per line
    check               check every URL once and exit
    serve               run the dashboard and check on a schedule
```

Then add a target and check it once:

```bash
pingboard add https://example.org
pingboard check
```

A line that starts with `up` and exit status 0 mean that pingboard can reach the target.

## Start the dashboard

```bash
pingboard serve
```

The process stays in the foreground, writes its log to standard error and prints one line when it is ready:

```text
2026-11-25 21:47:09,819 INFO listening on http://127.0.0.1:8080
```

Open that address in a browser on the same machine, or ask the health check:

```bash
curl http://127.0.0.1:8080/healthz
# ok
```

`make run` does the same from a clone; it runs `python -m pingboard.cli serve`.

To change the port, the address, the interval or the place of the data file, set the environment variables in [Environment variables and settings](../config/environment.md) before you start the process.

> **Warning.** The dashboard has no login and no TLS. It listens on `127.0.0.1` by default. If you set `PINGBOARD_BIND` to an address that other machines can reach, everyone who can reach the port can read the list of targets and their state.

## Run it as a service

pingboard does not put itself in the background and ships no service definition. To keep it running, start `pingboard serve` under the process supervisor you already use, with these facts in mind:

- The command to run is `pingboard serve`, from the virtual environment where you installed it.
- Settings come from environment variables only.
- The user that runs the process must be able to read the data file, and to write to its directory if the same user runs `pingboard add` and `pingboard remove`.
- The log goes to standard error.
- The health check is `GET /healthz`. Read [Metrics and logs](../monitoring/signals.md) before you rely on it: it does not prove that checks are still running.

## Upgrade

An editable install runs the code in your clone, so upgrading is updating the clone and restarting the process.

```bash
git pull
pip install -e .
```

Then stop and start `pingboard serve`. The target list is kept; the results in memory start again from empty and fill during the first cycle.

## Uninstall

```bash
pip uninstall pingboard
```

This removes the command. It does not remove the target list. Delete the data file yourself if you no longer need it; by default it is `~/.pingboard/targets.json`.
