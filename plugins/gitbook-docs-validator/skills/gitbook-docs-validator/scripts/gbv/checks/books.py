"""books: map book folders (directories holding SUMMARY.md) to the template's roles. Always runs."""
from __future__ import annotations

from typing import Dict

from ..context import Context
from ..core import match_role

DESCRIPTION = "map book folders to the user/operator/tester roles (always runs)"


def run(ctx: Context) -> None:
    rep, root, roles = ctx.rep, ctx.root, ctx.roles
    candidates = sorted(p.parent for p in root.glob("*/SUMMARY.md"))
    if not candidates:
        rep.error("books", f"no book (directory with SUMMARY.md) under {root}")
    books: Dict[str, str] = {}
    unmapped = []
    for b in candidates:
        hits = match_role(b.name, roles)
        if len(hits) == 1:
            if hits[0] in books:
                rep.error("books", f"two books map to role '{hits[0]}': {books[hits[0]]}/ and {b.name}/", b)
            else:
                books[hits[0]] = b.name
        elif len(hits) > 1:
            rep.error("books", f"book {b.name}/ matches several roles ({', '.join(hits)}); rename it or add .docs-template.json aliases", b)
        else:
            unmapped.append(b.name)
    for u in unmapped:
        rep.error("books", f"book {u}/ matches no role; the template has exactly three books (user, operator, tester). Rename it or add an alias in .docs-template.json", root / u)
    for role in roles:
        if role not in books:
            rep.error("books", f"no {role} book: {roles[role].get('purpose', '')}")
    ctx.books = books
    rep.books = books
