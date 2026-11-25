# Deployment

The repository ships no container image, service unit or installer. This page
describes a plain installation on a Linux host. The service unit below is an
example to adapt, not a file from the repository.

## Requirements

- Python 3.9 or newer
- Outbound network access from the host to every target
- A writable location for the targets file
- A free TCP port (8080 by default)

Resource use is small: one process, one check at a time.

## Install

Create a dedicated user and install into a virtual environment:

    sudo useradd --system --home-dir /var/lib/pingboard --create-home pingboard
    sudo git clone https://github.com/example/pingboard.git /opt/pingboard/src
    sudo python3 -m venv /opt/pingboard/venv
    sudo /opt/pingboard/venv/bin/pip install /opt/pingboard/src

## Run as a systemd service (example)

`/etc/systemd/system/pingboard.service`:

    [Unit]
    Description=pingboard
    After=network-online.target
    Wants=network-online.target

    [Service]
    User=pingboard
    Environment=PINGBOARD_DATA=/var/lib/pingboard/targets.json
    Environment=PINGBOARD_BIND=127.0.0.1
    Environment=PINGBOARD_PORT=8080
    Environment=PINGBOARD_INTERVAL=60
    ExecStart=/opt/pingboard/venv/bin/pingboard serve
    Restart=on-failure

    [Install]
    WantedBy=multi-user.target

Then:

    sudo systemctl daemon-reload
    sudo systemctl enable --now pingboard

pingboard logs to standard error, so the log ends up in the journal:
`journalctl -u pingboard`.

## Manage targets on the host

The command-line tool must use the same targets file as the service, and the
service user must be able to read that file:

    sudo -u pingboard PINGBOARD_DATA=/var/lib/pingboard/targets.json \
        /opt/pingboard/venv/bin/pingboard add https://example.org

The service picks up the change at its next round. No restart is needed.

## Expose the dashboard

pingboard listens on `127.0.0.1` by default and offers neither TLS nor
authentication. To make the dashboard reachable for others, keep the default
bind address and put a reverse proxy in front that terminates TLS and
restricts access. Setting `PINGBOARD_BIND=0.0.0.0` exposes all four endpoints
to everyone who can reach the host. See [Security](security.md).

## Verify a deployment

    curl -s http://127.0.0.1:8080/healthz      # prints: ok
    curl -s http://127.0.0.1:8080/api/status   # JSON array, one entry per checked target
    curl -s http://127.0.0.1:8080/metrics      # pingboard_checks_total grows over time

## Start, stop, restart

- **Start-up** takes effect at once: the server listens and the first round of
  checks begins immediately.
- **Stopping** needs no care. The process has no shutdown handler and nothing
  to flush; `SIGTERM` ends it.
- **A restart** clears the results and resets `pingboard_checks_total` to 0.
  The dashboard is empty until the first round has finished.
- **Settings are read once**, so a changed environment variable needs a
  restart.

## Upgrade

    cd /opt/pingboard/src && sudo git pull
    sudo /opt/pingboard/venv/bin/pip install /opt/pingboard/src
    sudo systemctl restart pingboard

The targets file is not touched by an upgrade.

## Run several instances

Give each instance its own `PINGBOARD_PORT` and its own `PINGBOARD_DATA`.
Instances do not coordinate; two instances with the same targets file simply
check the same targets twice.
