# Install

This chapter shows how to put csvjoin on a machine, check that it works, upgrade it and
remove it. csvjoin is a single file, so every step is a file copy.

The repository has no package manifest, installer, container image or release
configuration. The supported way to install is to take `csvjoin.py` from the
[source repository](https://github.com/example/csvjoin).

## Before you start

- Python 3 on the machine, started as `python3`. The repository does not declare a minimum
  version; the script uses f-strings, which need Python 3.6 or later.
- No other packages. The script imports only `argparse`, `csv`, `os` and `sys` from the
  standard library.

## Install from the repository

1. Clone the repository.

   ```bash
   git clone https://github.com/example/csvjoin
   cd csvjoin
   ```

2. Check that the script starts.

   ```bash
   python3 csvjoin.py --help
   ```

   You should see a usage text that begins with `usage: csvjoin [-h] --on ON`.

## Install as a command on the PATH

Do this when people should type `csvjoin` instead of `python3 csvjoin.py`. The script starts
with the line `#!/usr/bin/env python3`, so it can run directly once it is executable.

1. Copy the script to a directory on the `PATH` under the name `csvjoin` and make it
   executable. `/usr/local/bin` is an example; use the directory your site prefers.

   ```bash
   install -m 0755 csvjoin.py /usr/local/bin/csvjoin
   ```

2. Check that the command is found.

   ```bash
   csvjoin --help
   ```

## Verify the installation

Join two small files and compare the result. This checks Python, the script and file access
together.

```bash
printf 'id,name\n1,Ada\n2,Grace\n' > left.csv
printf 'id,city\n1,London\n' > right.csv
python3 csvjoin.py left.csv right.csv --on id
```

The output should be exactly:

```text
id,name,city
1,Ada,London
```

## Upgrade

Replace the file with the new one: run `git pull` in the clone, then repeat the copy if you
installed the script on the `PATH`. There is no data to migrate, because csvjoin keeps no
state.

## Uninstall

Delete the clone, and the copy on the `PATH` if you made one.

```bash
rm /usr/local/bin/csvjoin
```

csvjoin leaves nothing else behind: no configuration, cache or log files.
