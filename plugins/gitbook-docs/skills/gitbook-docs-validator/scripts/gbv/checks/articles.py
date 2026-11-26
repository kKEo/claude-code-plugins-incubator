"""articles: the optional articles book holds dated articles and the landing page indexes them."""
from __future__ import annotations

import datetime as dt
import re

from ..context import Context
from ..core import ARTICLE_RE, HTML_HREF_RE, articles_folder, headings, listed_pages, read_lines

DESCRIPTION = "articles book (optional): dated file names, newest first in SUMMARY.md, indexed on the landing page"
SYNC = "run the gitbook-docs-article script with --sync"


def run(ctx: Context) -> None:
    rep, root = ctx.rep, ctx.root
    folder = articles_folder(ctx.tpl)
    book = root / folder
    if not book.is_dir():
        return  # no articles: nothing to check, and not a finding
    draft = ctx.rules.get("draft_marker", "> Draft.")
    pages = sorted(p for p in book.glob("*.md") if p.name not in ("README.md", "SUMMARY.md"))
    for name in ("README.md", "SUMMARY.md"):
        if not (book / name).exists():
            rep.error("articles", f"{folder}/ has no {name}", book)
    for name in (".gitbook.yaml", "book.toml"):
        if not (book / name).exists():
            rep.warn("articles", f"{folder}/ has no {name}", book)
    toml = book / "book.toml"
    if toml.exists() and "home-button.js" not in toml.read_text(encoding="utf-8", errors="replace"):
        rep.warn("articles", f"{folder}/book.toml does not load home-button.js, so articles have no Home icon back to the landing page", toml)
    for sub in sorted(p for p in book.rglob("*.md") if p.parent != book):
        rep.warn("articles", "article in a subfolder; articles live flat in the articles book so the date in the file name orders them", sub)

    dated, published = [], []
    for p in pages:
        m = ARTICLE_RE.match(p.name)
        try:
            day = dt.date.fromisoformat(m.group(1)) if m else None
        except ValueError:
            day = None
        if not day:
            rep.error("articles", "article file name is not YYYY-MM-DD-<slug>.md with a real date (lowercase letters, digits and hyphens in the slug)", p)
            continue
        lines = read_lines(p)
        h1 = [h for h in headings(lines) if h[1] == 1]
        if len(h1) != 1 or h1[0][0] != 1:
            rep.error("articles", "article does not start with exactly one H1 (the title shown in the index)", p)
        dated.append(p.name)
        if not any(line.rstrip("\n") == draft for line in lines):
            published.append(p.name)

    listed = [t for t in listed_pages(book) if t != "README.md"] if (book / "SUMMARY.md").exists() else None
    if listed is not None:
        for name in dated:
            if name not in listed:
                rep.error("articles", f"article is not listed in {folder}/SUMMARY.md, so it is never published; {SYNC}", book / name)
        in_summary = [t for t in listed if t in dated]
        if in_summary != sorted(in_summary, reverse=True):
            rep.warn("articles", f"{folder}/SUMMARY.md does not list the articles newest first; {SYNC}", book / "SUMMARY.md")

    landing = root / ctx.tpl.get("landing_page", "index.html")
    if not landing.exists() or not dated:
        return
    hrefs = {h.split("#")[0] for h in HTML_HREF_RE.findall(landing.read_text(encoding="utf-8", errors="replace"))}
    if published:
        if not any(h.rstrip("/") == folder for h in hrefs):
            rep.error("articles", f"landing page has no link href=\"{folder}/\" to the article index; {SYNC}", landing)
        newest = max(published)
        if f"{folder}/{newest[:-3]}.html" not in hrefs:
            rep.error("articles", f"landing page does not list the newest article ({folder}/{newest[:-3]}.html); {SYNC}", landing)
    linked = sorted(h for h in hrefs if re.match(rf"{re.escape(folder)}/.+\.html$", h))
    for h in linked:
        name = h[len(folder) + 1:-5] + ".md"
        if name in dated and name not in published:
            rep.warn("articles", f"landing page lists {h}, which is still a draft; {SYNC}", landing)
