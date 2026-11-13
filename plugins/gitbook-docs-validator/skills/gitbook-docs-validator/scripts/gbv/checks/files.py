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
        _home_button(ctx, role, book, bt, txt)


def _home_button(ctx: Context, role: str, book, bt, txt: str) -> None:
    """mdBook twin: a Home icon in the menu bar (additional-js) links back to the landing page."""
    rep = ctx.rep
    m = re.search(r"^additional-js\s*=\s*\[(.*?)\]", txt, re.M | re.S)
    scripts = re.findall(r"[\"']([^\"']+\.js)[\"']", m.group(1)) if m else []
    if not scripts:
        rep.warn("book-files", f"{role} book.toml has no additional-js home button (a Home icon linking to the landing page)", bt)
        return
    for name in scripts:
        f = book / name
        if f.exists() and re.search(r"\bHome\b", f.read_text(encoding="utf-8", errors="replace")):
            return
    rep.warn("book-files", f"{role} book.toml additional-js lists no existing script that adds a 'Home' link to the landing page", bt)
