# Installation

## Requirements

- Python 3.9 or newer
- `pip`
- `git`, to get the source code

pingboard uses only the Python standard library, so nothing else is installed
with it.

## Install from source

    git clone https://github.com/example/pingboard.git
    cd pingboard
    pip install -e .

We recommend installing into a virtual environment so that pingboard does not
mix with other Python software on your machine:

    python3 -m venv .venv
    . .venv/bin/activate
    pip install -e .

## Check the installation

    pingboard --help

You should see the list of commands: `add`, `remove`, `list`, `check` and
`serve`. If the shell answers `command not found`, see
[Troubleshooting](troubleshooting.md).

## Uninstall

    pip uninstall pingboard

Your list of targets is kept in `~/.pingboard/targets.json`. Delete that folder
if you no longer need it.
