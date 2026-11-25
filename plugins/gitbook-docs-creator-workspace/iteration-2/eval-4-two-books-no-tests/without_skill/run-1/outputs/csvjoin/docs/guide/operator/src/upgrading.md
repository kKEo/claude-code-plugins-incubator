# Upgrading and removing

## Upgrade

csvjoin keeps no state and has no configuration file, so an upgrade is a file replacement:

```sh
cd csvjoin
git pull
sudo install -m 0755 csvjoin.py /usr/local/bin/csvjoin
```

`install` replaces the file in one step, so runs that are in progress finish with the old code and later runs use the new one.

The file carries no version number. Record the commit you deployed:

```sh
git -C csvjoin rev-parse HEAD
```

Before you roll out a new revision to scheduled jobs, run one of your real joins with the old and the new file and compare the results:

```sh
python3 csvjoin.old.py a.csv b.csv --on id -o old.csv
python3 csvjoin.py     a.csv b.csv --on id -o new.csv
cmp old.csv new.csv
```

## Roll back

Check out the previous commit and install the file again:

```sh
git -C csvjoin checkout <previous-commit> -- csvjoin.py
sudo install -m 0755 csvjoin/csvjoin.py /usr/local/bin/csvjoin
```

## Remove

```sh
sudo rm /usr/local/bin/csvjoin
```

Also remove `CSVJOIN_MAX_ROWS` from profile scripts, crontabs and job definitions where you set it. csvjoin leaves nothing else on the machine.
