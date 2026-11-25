"""The dashboard: a background loop that checks every target, and three HTTP routes."""
import json
import logging
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import check, store

log = logging.getLogger("pingboard")
results = {}
checks_total = 0
lock = threading.Lock()


def loop(cfg):
    global checks_total
    while True:
        for url in store.read(cfg.data_file):
            r = check.check(url, cfg.timeout)
            with lock:
                results[url] = r
                checks_total += 1
            if not r.up:
                log.warning("target down url=%s status=%s error=%s", r.url, r.status, r.error)
        time.sleep(cfg.interval)


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/healthz":
            self._send(200, "text/plain", "ok\n")
        elif self.path == "/metrics":
            with lock:
                lines = [f"pingboard_checks_total {checks_total}"]
                lines += [f'pingboard_target_up{{url="{u}"}} {int(r.up)}' for u, r in results.items()]
                lines += [f'pingboard_check_duration_ms{{url="{u}"}} {r.millis}' for u, r in results.items()]
            self._send(200, "text/plain", "\n".join(lines) + "\n")
        elif self.path == "/api/status":
            with lock:
                body = json.dumps([r.__dict__ for r in results.values()])
            self._send(200, "application/json", body)
        elif self.path == "/":
            with lock:
                rows = "".join(f"<tr><td>{r.url}</td><td>{'up' if r.up else 'DOWN'}</td><td>{r.millis} ms</td></tr>" for r in results.values())
            self._send(200, "text/html", f"<h1>pingboard</h1><table>{rows}</table>")
        else:
            self._send(404, "text/plain", "not found\n")

    def _send(self, code, ctype, body):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.end_headers()
        self.wfile.write(body.encode())

    def log_message(self, fmt, *args):
        log.debug("http " + fmt, *args)


def serve(cfg):
    logging.basicConfig(level=cfg.log_level.upper(), format="%(asctime)s %(levelname)s %(message)s")
    threading.Thread(target=loop, args=(cfg,), daemon=True).start()
    log.info("listening on http://%s:%s", cfg.bind, cfg.port)
    ThreadingHTTPServer((cfg.bind, cfg.port), Handler).serve_forever()
