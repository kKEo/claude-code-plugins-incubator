"""books: map book folders (directories holding SUMMARY.md) to the template's roles. Always runs.

A role marked "optional" in the template may be absent; when its book exists it is checked like any other."""
from __future__ import annotations

from typing import Dict

from ..context import Context
from ..core import match_role

DESCRIPTION = "map book folders to the roles: user and operator required, tester and developer optional (always runs)"


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
    required = [r for r in roles if not roles[r].get("optional")]
    optional = [r for r in roles if roles[r].get("optional")]
    shape = f"required: {', '.join(required)}" + (f"; optional: {', '.join(optional)}" if optional else "")
    for u in unmapped:
        rep.error("books", f"book {u}/ matches no role; the template has one book per role ({shape}). Rename it or add an alias in .docs-template.json", root / u)
    for role in required:
        if role not in books:
            rep.error("books", f"no {role} book: {roles[role].get('purpose', '')}")
    if candidates and optional and not any(r in books for r in optional):
        rep.info("books", f"no optional book ({', '.join(optional)}); fine when the project has no such reader, otherwise add the book")
    rep.roles = {r: bool(roles[r].get("optional")) for r in roles}
    ctx.books = books
    rep.books = books
