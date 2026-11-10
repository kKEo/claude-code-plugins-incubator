"""summary: SUMMARY.md starts with README, lists every page once, Part I..N numbering, part READMEs."""
from __future__ import annotations

import re

from ..context import Context
from ..core import ROMAN, md_files, parse_summary

DESCRIPTION = "SUMMARY.md: README first, orphans, missing or duplicate entries, Part numbering"


def run(ctx: Context, role: str) -> None:
    rep, book, spec, rules = ctx.rep, ctx.book(role), ctx.spec(role), ctx.rules
    summ = book / "SUMMARY.md"
    if not summ.exists():
        return
    entries = parse_summary(summ)
    if not entries:
        rep.error("summary", "SUMMARY.md lists no chapters", summ)
        return
    if entries[0][3].split("#")[0] != "README.md":
        rep.error("summary", "first SUMMARY entry must be README.md (the book's front page)", summ, entries[0][0])
    listed = ctx.listed(role)
    seen = set()
    part_no = 0
    for ln, depth, title, target in entries:
        path = target.split("#")[0]
        if depth > rules.get("max_summary_depth", 3):
            rep.warn("summary", f"'{title}' nested {depth} deep; keep part > chapter > sub-chapter", summ, ln)
        if path in seen:
            rep.error("summary", f"{path} listed twice", summ, ln)
        seen.add(path)
        if not (book / path).exists():
            rep.error("summary", f"'{title}' points to missing file {path}", summ, ln)
        m = re.match(r"^Part\s+([IVXLC]+|\d+)\s*[:.]", title)
        if m:
            part_no += 1
            want = ROMAN[part_no - 1] if part_no <= len(ROMAN) else str(part_no)
            if m.group(1) != want:
                rep.warn("summary", f"'{title}' is part #{part_no}; expected 'Part {want}:'", summ, ln)
            if not path.endswith("README.md"):
                rep.warn("summary", f"part '{title}' should link to its directory README.md, not {path}", summ, ln)
        if depth == 0 and path != "README.md" and "/" in path and not path.endswith("README.md") and not spec.get("flat_allowed"):
            rep.info("summary", f"top-level chapter {path} sits in a directory without being a part README", summ, ln)
    # orphans
    for f in md_files(book):
        rel = f.relative_to(book).as_posix()
        if rel not in listed:
            rep.error("summary", f"{rel} exists but is not in SUMMARY.md, so it is never published", f)
    # part dirs need README
    for d in sorted({p.parent for p in md_files(book) if p.parent != book}):
        if not (d / "README.md").exists():
            rep.warn("summary", f"directory {d.relative_to(book).as_posix()}/ has pages but no README.md (part landing page)", d)
    if not spec.get("flat_allowed") and part_no == 0:
        rep.warn("summary", f"{role} book has no 'Part I:' structure; advanced books are organised in parts", summ)
