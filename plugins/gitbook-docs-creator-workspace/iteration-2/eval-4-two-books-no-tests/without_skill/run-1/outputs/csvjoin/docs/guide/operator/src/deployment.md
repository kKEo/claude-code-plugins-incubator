# Deployment

## Requirements

| Requirement | Detail |
| --- | --- |
| Runtime | Python 3.6 or newer |
| Python packages | None. Only the standard library is used. |
| Operating system | Any that runs Python 3 |
| Network | Not used |
| Privileges | Read access to both inputs, write access to the output path |

## What to deploy

One file: `csvjoin.py` from <https://github.com/example/csvjoin>. The repository has no package metadata, so there is nothing to `pip install`. Deploying means copying the file.

## System-wide install

```sh
git clone https://github.com/example/csvjoin.git
sudo install -m 0755 csvjoin/csvjoin.py /usr/local/bin/csvjoin
csvjoin --help
```

The file starts with `#!/usr/bin/env python3`, so it runs with the first `python3` on the caller's `PATH`. If that must be a specific interpreter, call it explicitly:

```sh
/usr/bin/python3 /usr/local/bin/csvjoin --help
```

## Container image

```dockerfile
FROM python:3-slim
COPY csvjoin.py /usr/local/bin/csvjoin
RUN chmod 0755 /usr/local/bin/csvjoin
ENTRYPOINT ["csvjoin"]
```

Mount the folder that holds the data and pass paths inside the container:

```sh
docker run --rm -v "$PWD:/data" csvjoin /data/left.csv /data/right.csv --on id -o /data/joined.csv
```

## Verify an installation

csvjoin has no `--version` option. Check that it starts and that it is the file you meant to deploy:

```sh
csvjoin --help
sha256sum /usr/local/bin/csvjoin
```

Compare the checksum with the one of the file in the commit you deployed. Record the commit, because the file carries no version number.

A quick functional check:

```sh
printf 'id,a\n1,x\n' > /tmp/l.csv
printf 'id,b\n1,y\n' > /tmp/r.csv
csvjoin /tmp/l.csv /tmp/r.csv --on id
```

Expected output:

```csv
id,a,b
1,x,y
```
