# Security

pingboard is a small internal tool. It leaves several protections to its
environment. Know these limits before you deploy it.

## No authentication, no TLS

Every endpoint is open to everyone who can reach the port, and traffic is
plain HTTP. The endpoints reveal the list of targets, their state and the
error texts, which can include internal host names.

- Keep the default `PINGBOARD_BIND=127.0.0.1` and publish the dashboard
  through a reverse proxy that adds TLS and access control.
- If you bind to another address, restrict access with a firewall.

The HTTP interface is read-only. Targets can be changed only through the
command line or the targets file.

## Whoever can change the targets file controls outbound requests

pingboard sends a `GET` request to every URL in the list, from the host it
runs on, and publishes the status. Someone who can add targets can therefore
probe addresses that only this host can reach, such as internal services or
cloud metadata endpoints. Restrict write access to the targets file to
trusted people, and run pingboard on a host whose network access matches what
those people may see.

## Output is not escaped

Target URLs are inserted into the dashboard HTML and into the metrics labels
as they are. A URL that contains HTML markup would be interpreted by the
browser of everyone who opens the dashboard, and a URL that contains a double
quote breaks the metrics output. This is one more reason to accept targets
only from trusted people.

## Credentials in URLs

Do not put secrets into target URLs, neither as `user:password@host` nor as a
query parameter. URLs are stored in plain text and shown on the dashboard, in
`/api/status`, in `/metrics` and in the log.

## Run with few privileges

Run the service as a dedicated user without a login shell. It needs only read
access to the targets file, outbound network access and permission to listen
on its port. With a port above 1024 it needs no special privileges.

## Certificate checks

HTTPS targets are verified against the certificate store of the Python
installation. A target with an expired or self-signed certificate is reported
as down with status 0; the `error` field holds the reason. pingboard has no
option to switch verification off.
