# Deployment

## Requirements

* Python 3.9 or later with the `venv` module. The project tests against Python 3.9 and 3.12.
* Outbound network access from the host to every target.
* A directory that the service account can write to, for the data file.

pingboard needs very little: a few tens of megabytes of memory and almost no CPU. Sizing depends only on the number of targets, see [Capacity](#capacity).

## Install

Install pingboard into its own virtual environment, under a dedicated account without login rights.

```
sudo useradd --system --home-dir /var/lib/pingboard --create-home --shell /usr/sbin/nologin pingboard
sudo git clone https://github.com/example/pingboard.git /opt/pingboard/src
sudo python3 -m venv /opt/pingboard/venv
sudo /opt/pingboard/venv/bin/pip install /opt/pingboard/src
```

Use `pip install` without `-e` on a server. The installed copy is then independent of the source folder, and a `git pull` cannot change the running version by accident.

Check the result:

```
/opt/pingboard/venv/bin/pingboard --help
```

## Run under systemd

pingboard does not ship a unit file. This example is a reasonable start; save it as `/etc/systemd/system/pingboard.service`.

```ini
[Unit]
Description=pingboard URL checker
After=network-online.target
Wants=network-online.target

[Service]
User=pingboard
Group=pingboard
Environment=PINGBOARD_DATA=/var/lib/pingboard/targets.json
Environment=PINGBOARD_INTERVAL=60
ExecStart=/opt/pingboard/venv/bin/pingboard serve
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/pingboard

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
sudo systemctl enable --now pingboard
curl http://127.0.0.1:8080/healthz
```

The last command must print `ok`.

Notes:

* `Restart=on-failure` covers a crash of the process. It does not cover a check loop that has stopped while the process lives. See [Monitoring and logs](monitoring.md) for how to detect that case.
* pingboard has no reload signal. Restart the service to apply a changed setting. Changes to the target list need no restart.
* pingboard stops immediately on `SIGTERM`. There is nothing to flush.

## Manage targets on the server

The `add`, `remove` and `list` commands must see the same `PINGBOARD_DATA` as the service, and must run as an account that can write to the directory of the data file:

```
sudo -u pingboard env PINGBOARD_DATA=/var/lib/pingboard/targets.json \
  /opt/pingboard/venv/bin/pingboard add https://example.org
```

The service picks up the change at the start of its next round. A shell alias or a small wrapper script saves typing and prevents the most common mistake: editing the default file in a home directory while the service reads another one.

## Run in a container

pingboard does not ship an image. A minimal `Dockerfile` looks like this:

```dockerfile
FROM python:3.12-slim
COPY . /src
RUN pip install --no-cache-dir /src && useradd --system pingboard && mkdir /data && chown pingboard /data
USER pingboard
ENV PINGBOARD_BIND=0.0.0.0 PINGBOARD_DATA=/data/targets.json
EXPOSE 8080
VOLUME /data
CMD ["pingboard", "serve"]
```

Two points are specific to containers:

* Set `PINGBOARD_BIND=0.0.0.0`. With the default `127.0.0.1` the port is unreachable from outside the container.
* Mount a volume for the directory of the data file, not for the file alone. pingboard replaces the file by renaming a temporary file next to it, which does not work across a single-file mount.

Manage targets with `docker exec <container> pingboard add <url>`.

## Put a reverse proxy in front

Keep pingboard on `127.0.0.1` and let a reverse proxy add TLS and access control. An nginx example:

```nginx
server {
    listen 443 ssl;
    server_name status.example.org;
    # ssl_certificate and ssl_certificate_key go here

    location / {
        auth_basic "pingboard";
        auth_basic_user_file /etc/nginx/pingboard.htpasswd;
        proxy_pass http://127.0.0.1:8080;
    }
}
```

pingboard matches the request path exactly and knows nothing about a path prefix. Serve it at the root of a host name, as above; if you must use a prefix such as `/pingboard/`, make the proxy strip it.

## Capacity

Targets are checked one after another. One round takes the sum of all response times, and each down target that times out costs the full timeout. The time between two checks of the same target is therefore:

```
round time + PINGBOARD_INTERVAL
```

Worst case, with every target timing out: `targets x PINGBOARD_TIMEOUT + PINGBOARD_INTERVAL`. With 100 targets, a timeout of 5 seconds and an interval of 60 seconds, that is up to 560 seconds.

If results become too stale, lower `PINGBOARD_TIMEOUT` first. Splitting the targets over two instances, each with its own data file and port, is the next step.
