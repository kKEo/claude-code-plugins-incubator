# Installation

## Requirements

* Python 3.9 or later
* `pip` and `git`

pingboard uses only the Python standard library, so it installs no other packages.

## Install from the source repository

pingboard is installed from its source repository.

```
git clone https://github.com/example/pingboard.git
cd pingboard
python -m venv .venv
. .venv/bin/activate
pip install -e .
```

The virtual environment (`.venv`) keeps pingboard separate from other Python software on your machine. On Windows, activate it with `.venv\Scripts\activate` instead.

`pip install -e .` installs pingboard in editable mode: the command runs the code in the cloned folder, so `git pull` is all you need to update. If you prefer a normal copy, run `pip install .` and repeat it after each update.

## Check the installation

```
pingboard --help
```

You should see the five commands: `add`, `remove`, `list`, `check` and `serve`.

If the shell reports that the command is not found, the virtual environment is not active. Activate it again and retry.

## Next step

Continue with the [quick start](quick-start.md).
