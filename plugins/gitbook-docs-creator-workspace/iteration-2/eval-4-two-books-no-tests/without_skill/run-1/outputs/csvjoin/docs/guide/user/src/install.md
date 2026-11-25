# Install

csvjoin is one Python file with no dependencies beyond Python itself.

## What you need

* Python 3.6 or newer. Check with `python3 --version`.

## Get the file

Clone the repository and run the tool from it:

```sh
git clone https://github.com/example/csvjoin.git
cd csvjoin
python3 csvjoin.py --help
```

The last command prints the usage summary. If you see it, the tool works.

You can also copy `csvjoin.py` on its own to any folder. It needs no other file from the repository.

## Run it as `csvjoin`

The examples in this guide use `python3 csvjoin.py`. On Linux and macOS you can shorten that by putting the file on your `PATH`:

```sh
chmod +x csvjoin.py
cp csvjoin.py ~/.local/bin/csvjoin
csvjoin --help
```

`~/.local/bin` must be in your `PATH` for this to work.
