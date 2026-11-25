# Security

pingboard is a small tool with no security features of its own. Treat it as an internal component and put the protection around it.

## What is exposed

Anyone who can reach the HTTP port can read, without a login:

* every target URL, including internal host names and any credentials or tokens embedded in a URL;
* the state and response time of every target;
* error texts, which can contain resolver and TLS details.

The HTTP server is read-only. Nobody can change the target list through it.

## Network exposure

The default bind address, `127.0.0.1`, accepts connections from the same host only. Keep it, and publish the dashboard through a reverse proxy that adds TLS and authentication. The [deployment page](deployment.md) has an example.

Set `PINGBOARD_BIND=0.0.0.0` only when a firewall or a container network limits who can connect.

The server is the HTTP server of the Python standard library, which is not hardened for direct exposure to the internet. This is a second reason for the reverse proxy.

## Who may change the target list

Whoever can write to the data file controls what pingboard does:

* **Requests from inside your network.** pingboard sends a GET request to every target from the host it runs on. A person who can add targets can make that host request internal addresses and read status and timing from the dashboard. Give write access to the data directory only to people who are allowed to reach those addresses anyway.
* **Content of the dashboard.** Target URLs are written into the HTML page and the metrics output as they are, without escaping. A crafted entry in the data file can inject markup into the dashboard or break the metrics output. `pingboard add` only checks the start of the URL.

Both points have the same answer: restrict write access to the data file and its directory to trusted administrators.

## Do not put secrets in target URLs

URLs such as `https://user:password@host/` or `https://host/health?token=...` are shown on the dashboard, in `/api/status`, in `/metrics`, in the log and in the data file. Use a health endpoint that needs no secret.

## Service account

Run pingboard as a dedicated account without login rights and without privileges. It needs:

* read access to its virtual environment;
* read access to the data file (write access only if the same account manages targets);
* permission to open the listening port (choose a port above 1023);
* outbound HTTP and HTTPS.

The systemd example on the [deployment page](deployment.md) adds `NoNewPrivileges`, `ProtectSystem` and `ProtectHome`.

## Outbound requests

* TLS certificates of `https://` targets are verified with the defaults of the Python installation. A target with an untrusted certificate is reported as down. pingboard has no setting to turn verification off.
* Redirects are followed, also to other hosts.
* Requests carry `User-Agent: pingboard`, which helps the owners of the targets to recognise and allow them.
* Proxy variables of the environment, such as `HTTPS_PROXY`, are honoured, as usual for Python.

## Reporting a vulnerability

Report security problems to the maintainers through <https://github.com/example/pingboard>. Do not put details of an unfixed vulnerability into a public issue; ask for a private channel first.
