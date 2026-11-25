"""roles: each role's required pages exist; the user quick start says how long it takes."""
from __future__ import annotations

import re

from ..context import Context
from ..core import find_page, read_lines, required_keywords, strip_fences

DESCRIPTION = "required pages per role; the quick start states its duration"

# Chapters that serve people who change the code; in a tree with a developer book they belong there.
DEVELOPER_TOPICS = ("build from source", "building from source", "local development", "development setup",
                    "development environment", "contributing", "code layout", "release engineering")

TIME_RE = re.compile(r"\b(\d+|one|two|three|five|ten|fifteen|twenty|thirty)[\s-]*(minutes?|mins?|seconds?|hours?)\b", re.I)


def run(ctx: Context, role: str) -> None:
    rep, book, spec = ctx.rep, ctx.book(role), ctx.spec(role)
    listed = ctx.listed(role)
    if role == "user":
        qs = find_page(listed, required_keywords(spec, "quick-start"))
        if qs and (book / qs).is_file():
            text = "\n".join(t for _, t in strip_fences(read_lines(book / qs)))
            if not TIME_RE.search(text):
                rep.warn("role", "quick start does not say how long it takes ('about five minutes')", book / qs)
    if role == "operator" and "developer" in ctx.books:
        for page, title in listed.items():
            hit = next((k for k in DEVELOPER_TOPICS if k in f"{title} {page}".lower().replace("-", " ")), None)
            if hit:
                rep.info("role", f"'{title}' ({hit}) is in the operator book although a developer book exists "
                         f"({ctx.books['developer']}/); the operator book keeps the runtime view", book / page)
    titles = " | ".join(f"{t} {p}".lower() for p, t in listed.items())
    for req in spec.get("required_pages", []):
        if not any(k.lower() in titles for k in req["any_of"]):
            msg = f"{role} book has no page for '{req['id']}' (looked for: {', '.join(req['any_of'][:3])}…). {req.get('why', '')}".strip()
            (rep.error if req.get("severity", "warn") == "error" else rep.warn)("role", msg, book / "SUMMARY.md")
