# Troubleshooting

Start with three commands:

```
systemctl status pingboard
journalctl -u pingboard -n 50
curl -s http://127.0.0.1:8080/metrics
```

## The service does not start

| Log shows | Cause | Fix |
| --- | --- | --- |
| `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds` | Interval too low | Raise `PINGBOARD_INTERVAL` |
| `ValueError: invalid literal for int()` or `could not convert string to float` | A numeric setting is not a number | Check `PINGBOARD_PORT`, `PINGBOARD_INTERVAL`, `PINGBOARD_TIMEOUT` |
| `ValueError: Unknown level` | Wrong `PINGBOARD_LOG_LEVEL` | Use `debug`, `info`, `warning`, `error` or `critical` |
| `OSError: ... Address already in use` | The port is taken | Find the owner with `ss -ltnp`, or change the port |
| `PermissionError: [Errno 13]` at start | Port below 1024 without privileges | Use a port above 1023 |

## The dashboard is unreachable from other machines

The service listens on `127.0.0.1` by default. Either put a reverse proxy in front or set `PINGBOARD_BIND`; see [Security](security.md) first. In a container, `PINGBOARD_BIND=0.0.0.0` is required.

## Results are stale and `pingboard_checks_total` does not grow

The check loop has stopped. The log contains a traceback that starts with `Exception in thread`. The usual causes:

| Traceback ends with | Cause |
| --- | --- |
| `json.decoder.JSONDecodeError` | The data file is not valid JSON |
| `KeyError: 'targets'` | The data file is valid JSON but has no `targets` key |
| `PermissionError` | The service account cannot read the data file |

Repair the file or its permissions, then restart the service. The loop does not recover without a restart.

If there is no traceback, the list may simply be empty: with no targets no checks are done.

## The dashboard is empty

* The service has just started and the first round is not finished.
* The service reads another data file than the one you edited. Compare `PINGBOARD_DATA` of the service (`systemctl show pingboard -p Environment`) with the one in your shell.

## A new target does not appear

A new target appears after the round that follows the change. With many slow targets a round takes long; see the capacity section of [Deployment](deployment.md). If the target never appears, the cause is the data file mismatch described above.

## A removed target is still shown

Results of removed targets stay in memory until the next restart. Restart the service.

## `pingboard add` fails with `PermissionError`

The account that runs the command cannot write to the directory of the data file. pingboard needs to create a temporary file in that directory. Run the command as the service account, as shown on the [deployment page](deployment.md).

## All targets are down

The cause is nearly always on the pingboard host: no outbound network, a broken resolver, a missing proxy setting or an outdated certificate store. Run a check as the service account and read the `error` fields:

```
sudo -u pingboard env PINGBOARD_DATA=/var/lib/pingboard/targets.json \
  /opt/pingboard/venv/bin/pingboard check --json
```

## One target is down here but up elsewhere

Read the `error` field in `/api/status`.

| Error mentions | Cause |
| --- | --- |
| `timed out` | The target is slower than `PINGBOARD_TIMEOUT` from this host |
| `CERTIFICATE_VERIFY_FAILED` | The certificate chain is not trusted by the Python installation of the host |
| `HTTP Error 403` or `429` | The target blocks or limits the `pingboard` user agent or the address of the host |
| `HTTP Error 401` | The target needs credentials, which pingboard cannot send |

## Checks of a target are too far apart

See the capacity section of [Deployment](deployment.md): lower the timeout, lower the interval or split the targets over two instances.
