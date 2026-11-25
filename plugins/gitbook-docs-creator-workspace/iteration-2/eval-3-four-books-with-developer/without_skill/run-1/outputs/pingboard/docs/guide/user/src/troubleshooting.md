# Troubleshooting

## `pingboard: command not found`

The virtual environment in which you installed pingboard is not active. Activate it (`. .venv/bin/activate`) and try again. See [Installation](installation.md).

## `pingboard: a target must start with http:// or https://`

You added a URL without a scheme, for example `example.org`, or with another scheme, for example `ftp://`. Add the full URL: `pingboard add https://example.org`.

## `pingboard: <url> is not in the list`

`pingboard remove` needs the URL exactly as it is stored. Run `pingboard list` and copy the line. A trailing slash matters.

## `pingboard: PINGBOARD_INTERVAL must be at least 5 seconds`

The `PINGBOARD_INTERVAL` variable is set to a value below 5. Raise it or unset it. This message appears for every command, not only for `serve`.

## A Python error that ends with `ValueError: invalid literal for int()`

A setting that must be a number contains something else, for example `PINGBOARD_PORT=http`. Check `PINGBOARD_PORT`, `PINGBOARD_INTERVAL` and `PINGBOARD_TIMEOUT`.

## A Python error that mentions `JSONDecodeError` or `KeyError: 'targets'`

The file with the target list is damaged, most likely after an edit by hand. Open the file (`~/.pingboard/targets.json` unless you set `PINGBOARD_DATA`) and repair it so that it has the form shown in [Managing the target list](targets.md). If you cannot repair it, delete it and add the targets again.

## `OSError: [Errno 48] Address already in use` (or `Errno 98` on Linux)

Another program, possibly another `pingboard serve`, already uses the port. Stop that program or choose another port: `pingboard serve --port 9000`.

## A target is `DOWN`, but it works in my browser

Find the reason first:

```
pingboard check --json
```

Look at the `status` and `error` fields of the target. Common causes:

| What you see | Likely cause |
| --- | --- |
| `status` 0, error mentions `timed out` | The site needs more than 5 seconds. Raise `PINGBOARD_TIMEOUT` |
| `status` 0, error mentions `certificate` | The site's TLS certificate is not trusted by your Python installation |
| `status` 0, error mentions `Name or service not known` or `nodename nor servname` | The host name does not resolve from this machine |
| `status` 403 or 429 | The site blocks automated requests. pingboard identifies itself as `User-Agent: pingboard` |
| `status` 401 | The page needs a login. pingboard cannot send credentials; pick a public page of the same site |

## The dashboard is empty

* Right after the start, the first round of checks is still running. Reload after a few seconds.
* The list may be empty. Run `pingboard list`.
* `pingboard serve` may read another file than `pingboard add` wrote. Make sure `PINGBOARD_DATA` has the same value in both shells.

## The dashboard still shows a target that I removed

This is expected. The last result of a removed target stays until you restart `pingboard serve`.

## Still stuck?

Search the issues at <https://github.com/example/pingboard/issues> and open a new one if nobody has reported the problem. Include the command you ran, its full output and the output of `python --version`.
