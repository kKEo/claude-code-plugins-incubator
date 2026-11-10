"""files: each book has README.md, SUMMARY.md, .gitbook.yaml and an mdBook book.toml."""
from __future__ import annotations

import re

from ..context import Context

DESCRIPTION = "per-book README.md, SUMMARY.md, .gitbook.yaml and book.toml"


def run(ctx: Context, role: str) -> None:
    rep, book = ctx.rep, ctx.book(role)
    for name in ("README.md", "SUMMARY.md"):
        if not (book / name).exists():
            rep.error("book-files", f"{role} book lacks {name}", book / name)
    gb = book / ".gitbook.yaml"
    if not gb.exists():
        rep.error("book-files", f"{role} book lacks .gitbook.yaml (GitBook needs root/readme/summary)", gb)
    else:
        txt = gb.read_text(encoding="utf-8", errors="replace")
        for key in ("readme:", "summary:"):
            if key not in txt:
                rep.error("book-files", f".gitbook.yaml does not set structure.{key[:-1]}", gb)
    bt = book / "book.toml"
    if not bt.exists():
        rep.warn("book-files", f"{role} book has no book.toml (mdBook twin; needed if CI builds with mdBook)", bt)
    else:
        txt = bt.read_text(encoding="utf-8", errors="replace")
        if "create-missing = false" not in txt.replace(" ", "").replace("create-missing=false", "create-missing = false"):
            rep.warn("book-files", "book.toml should set create-missing = false so a SUMMARY typo fails the build", bt)
        if f"site/{book.name}" not in txt:
            rep.warn("book-files", f"book.toml build-dir does not end in site/{book.name}", bt)
        if not re.search(r"^title\s*=", txt, re.M):
            rep.warn("book-files", "book.toml has no title", bt)
