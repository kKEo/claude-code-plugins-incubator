"""pages: one H1 on line one, no skipped heading levels, drafts flagged, stubs grouped per book."""
from __future__ import annotations

from typing import List

from ..context import Context
from ..core import body_words, headings, md_files, read_lines, slugify, strip_fences

DESCRIPTION = "page headings (one H1 first, no skipped levels), drafts and stub pages"


def run(ctx: Context, role: str) -> None:
    rep, book, rules = ctx.rep, ctx.book(role), ctx.rules
    listed = ctx.listed(role)
    stubs: List[str] = []
    stub_max = rules.get("stub_max_words", 15)
    pages = md_files(book)
    for p in pages:
        lines = read_lines(p)
        rel = p.relative_to(book).as_posix()
        clean = strip_fences(lines)
        hs = headings(lines)
        h1s = [h for h in hs if h[1] == 1]
        first_nonblank = next((ln for ln, t in clean if t.strip()), None)
        if not h1s:
            rep.error("page", "no H1 heading", p, 1)
        else:
            if len(h1s) > 1:
                rep.error("page", f"{len(h1s)} H1 headings (lines {', '.join(str(h[0]) for h in h1s)}); one page, one title", p, h1s[1][0])
            if first_nonblank != h1s[0][0]:
                rep.warn("page", "H1 is not the first line of the page", p, h1s[0][0])
            title = listed.get(rel)
            if title and slugify(title) != slugify(h1s[0][2]):
                t_words = set(slugify(title).split("-"))
                h_words = set(slugify(h1s[0][2]).split("-"))
                if not (t_words & h_words):
                    rep.info("page", f"H1 '{h1s[0][2]}' differs from SUMMARY title '{title}'", p, h1s[0][0])
        prev = 1
        for ln, lvl, text in hs:
            if lvl > prev + 1:
                rep.warn("page", f"heading level jumps from H{prev} to H{lvl} ('{text}')", p, ln)
            prev = lvl
        is_draft = False
        for ln, t in clean:
            if t.strip() == rules.get("draft_marker", "> Draft."):
                rep.warn("page", "page is marked as a draft", p, ln)
                is_draft = True
                break
        if not is_draft and not ctx.is_generated(p) and rel in listed and body_words(clean) < stub_max:
            stubs.append(rel)
    if stubs:
        shown = ", ".join(stubs[:5]) + (f", … (+{len(stubs) - 5} more)" if len(stubs) > 5 else "")
        rep.warn("stub", f"{len(stubs)} of {len(pages)} published pages have fewer than {stub_max} words and no "
                 f"'{rules.get('draft_marker', '> Draft.')}' marker, so they look finished in the sidebar: {shown}",
                 book / "SUMMARY.md")
