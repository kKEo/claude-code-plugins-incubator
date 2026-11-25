# Upgrading

## Find the installed version

```
/opt/pingboard/venv/bin/pip show pingboard
```

pingboard has no `--version` option. This guide describes version 0.6.0.

## Before you upgrade

1. Read the commit history between your version and the new one at <https://github.com/example/pingboard/commits/main>. The project keeps no changelog file yet.
2. Copy the data file. See [The data file](data.md).
3. Note the current commit, for a rollback: `git -C /opt/pingboard/src rev-parse HEAD`.

## Upgrade

```
sudo git -C /opt/pingboard/src pull
sudo /opt/pingboard/venv/bin/pip install /opt/pingboard/src
sudo systemctl restart pingboard
```

The restart takes about a second. During it the dashboard is unreachable, and afterwards the results are empty until the first round has finished. Counters in `/metrics` start again at zero.

## Verify

```
curl -fsS http://127.0.0.1:8080/healthz
sleep 30
curl -s http://127.0.0.1:8080/metrics | head -n 1
```

`/healthz` must print `ok`, and `pingboard_checks_total` must be greater than zero. Then open the dashboard and compare the number of rows with `pingboard list`.

## Roll back

```
sudo git -C /opt/pingboard/src checkout <commit noted before>
sudo /opt/pingboard/venv/bin/pip install /opt/pingboard/src
sudo systemctl restart pingboard
```

If the data file was changed by the newer version in a way the older one cannot read, restore your copy as well.
