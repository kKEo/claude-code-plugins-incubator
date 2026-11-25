#!/usr/bin/env python3
"""notekeep: a tiny notes server. One SQLite file, a JSON API, a CLI."""
import argparse
import json
import os
import sqlite3
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

DB = os.environ.get("NOTEKEEP_DB", os.path.expanduser("~/.notekeep/notes.db"))
PORT = int(os.environ.get("NOTEKEEP_PORT", "7070"))
TOKEN = os.environ.get("NOTEKEEP_TOKEN", "")
MAX_BYTES = int(os.environ.get("NOTEKEEP_MAX_NOTE_BYTES", "65536"))


def db():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    con = sqlite3.connect(DB)
    con.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT UNIQUE, body TEXT, updated TEXT DEFAULT CURRENT_TIMESTAMP)")
    return con


class Handler(BaseHTTPRequestHandler):
    def _auth(self):
        return not TOKEN or self.headers.get("Authorization") == f"Bearer {TOKEN}"

    def do_GET(self):
        if self.path == "/health":
            return self._json(200, {"ok": True})
        if not self._auth():
            return self._json(401, {"error": "missing or wrong token"})
        if self.path == "/notes":
            rows = db().execute("SELECT title, updated FROM notes ORDER BY title").fetchall()
            return self._json(200, [{"title": t, "updated": u} for t, u in rows])
        self._json(404, {"error": "not found"})

    def do_PUT(self):
        if not self._auth():
            return self._json(401, {"error": "missing or wrong token"})
        n = int(self.headers.get("Content-Length", "0"))
        if n > MAX_BYTES:
            return self._json(413, {"error": f"note larger than {MAX_BYTES} bytes"})
        title = self.path.rsplit("/", 1)[-1]
        con = db()
        con.execute("INSERT INTO notes(title, body) VALUES(?, ?) ON CONFLICT(title) DO UPDATE SET body=excluded.body, updated=CURRENT_TIMESTAMP", (title, self.rfile.read(n).decode()))
        con.commit()
        self._json(200, {"saved": title})

    def _json(self, code, obj):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(obj).encode())


def main(argv=None):
    ap = argparse.ArgumentParser(prog="notekeep")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("serve", help="start the server")
    sub.add_parser("list", help="list note titles")
    s = sub.add_parser("show", help="print one note")
    s.add_argument("title")
    e = sub.add_parser("export", help="write every note to a directory as .md files")
    e.add_argument("dir")
    sub.add_parser("vacuum", help="compact the database file")
    args = ap.parse_args(argv)
    if args.cmd == "serve":
        print(f"notekeep listening on :{PORT}, database {DB}")
        HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
    elif args.cmd == "list":
        for (t,) in db().execute("SELECT title FROM notes ORDER BY title"):
            print(t)
    elif args.cmd == "show":
        row = db().execute("SELECT body FROM notes WHERE title=?", (args.title,)).fetchone()
        if not row:
            sys.exit(f"notekeep: no note called {args.title}")
        print(row[0])
    elif args.cmd == "export":
        os.makedirs(args.dir, exist_ok=True)
        for t, b in db().execute("SELECT title, body FROM notes"):
            open(os.path.join(args.dir, t + ".md"), "w").write(b)
    elif args.cmd == "vacuum":
        db().execute("VACUUM")


if __name__ == "__main__":
    main()
