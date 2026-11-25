# csvjoin operator guide

This guide is for the people who install, configure and run csvjoin. It assumes you are comfortable with a terminal.

csvjoin is a single Python script that joins two CSV files on a shared column and writes
the result as CSV. Each run is one short-lived process: it reads both files into memory,
writes the result to standard output or to one file, and exits. It needs Python 3 and
nothing else, keeps no state, and opens no network connection. Its only setting outside the
command line is one environment variable.

## What you will find here

| Part | Read it when you need to… |
|---|---|
| [I. How it works](intro/README.md) | Understand what one run does and what it reads, writes and keeps |
| [II. Install and deploy](install/README.md) | Install, verify, upgrade or remove csvjoin |
| [III. Configuration reference](config/README.md) | Look up the environment variable or a flag |
| [IV. Monitoring](monitoring/README.md) | Tell whether a run worked, from its exit status and messages |
| [V. Operations](operations/README.md) | Fix a failed run or an unexpected result |
| [Appendix](appendix/README.md) | Look up a term |

## Conventions

- Commands are shown as `python3 csvjoin.py …`, run from the directory that holds the
  script. If you installed the script on the `PATH`, type `csvjoin` instead.
- `left.csv` and `right.csv` stand for your own two files. The *left file* is the first one
  on the command line and the *right file* the second.
- Text in angle brackets, such as `<file>`, stands for a value that changes from run to run.
- The source is one file, [csvjoin.py](https://github.com/example/csvjoin/blob/HEAD/csvjoin.py).
  The repository has no separate design documents.

> **Looking for something else?** The [user guide](../user/) is the plain-language introduction.
