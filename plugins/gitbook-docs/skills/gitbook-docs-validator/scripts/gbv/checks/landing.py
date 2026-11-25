"""landing: the static index.html links one card per book and is well formed."""
from __future__ import annotations

import re

from ..context import Context
from ..core import HTML_HREF_RE

DESCRIPTION = "landing page: title, description, one link per book, links resolve"


def run(ctx: Context) -> None:
    rep, root = ctx.rep, ctx.root
    landing = root / ctx.tpl.get("landing_page", "index.html")
    if not landing.exists():
        rep.error("landing", f"no landing page {landing.name} at the docs root (one card per book is the site's front door)")
        return
    html = landing.read_text(encoding="utf-8", errors="replace")
    if not re.search(r"<title>\s*\S", html, re.I):
        rep.error("landing", "landing page has no <title>", landing)
    if not re.search(r"<meta\s+name=\"description\"", html, re.I):
        rep.warn("landing", "landing page has no <meta name=\"description\">", landing)
    hrefs = HTML_HREF_RE.findall(html)
    for role, folder in ctx.books.items():
        if not any(h.rstrip("/") == folder for h in hrefs):
            rep.error("landing", f"landing page has no link href=\"{folder}/\" to the {role} book", landing)
    for h in hrefs:
        if h.startswith(("http://", "https://", "mailto:", "#")):
            continue
        target = (root / h.rstrip("/")).resolve()
        if not target.exists():
            rep.error("landing", f"landing page link {h} does not resolve", landing)
    if "prefers-color-scheme" not in html:
        rep.info("landing", "landing page has no dark-mode colours (prefers-color-scheme)", landing)
    if "<footer" not in html.lower():
        rep.info("landing", "landing page has no footer (source link, licence)", landing)
