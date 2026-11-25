"""links: relative links and images resolve inside the docs root, anchors exist, images have alt text."""
from __future__ import annotations

from ..context import Context
from ..core import LINK_RE, md_files, read_lines, slugify, strip_fences

DESCRIPTION = "relative links, anchors, image alt text and unused images"

IMAGE_SUFFIXES = (".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp")


def run(ctx: Context, role: str) -> None:
    rep, book, root, rules = ctx.rep, ctx.book(role), ctx.root, ctx.rules
    used_images = set()
    for p in md_files(book):
        is_generated = ctx.is_generated(p)
        for ln, t in strip_fences(read_lines(p)):
            for bang, alt, target in LINK_RE.findall(t):
                if target.startswith(("http://", "https://", "mailto:")):
                    continue
                if target.startswith("#"):
                    ids = ctx.anchors(p) or set()
                    if slugify(target[1:]) not in ids and target[1:] not in ids:
                        rep.warn("link", f"anchor {target} has no matching heading on this page", p, ln)
                    continue
                path, _, anchor = target.partition("#")
                dest = (p.parent / path).resolve()
                if not dest.exists():
                    rep.error("link", f"{'image' if bang else 'link'} target {target} does not exist", p, ln)
                    continue
                try:
                    dest.relative_to(root.resolve())
                except ValueError:
                    rep.error("link", f"link {target} leaves the docs root; use an absolute repository URL", p, ln)
                    continue
                if bang:
                    used_images.add(dest)
                    if len(alt.strip()) < rules.get("min_alt_text_chars", 12):
                        rep.error("image", f"image {path} has {'no' if not alt.strip() else 'too short'} alt text", p, ln)
                elif anchor and dest.suffix == ".md" and not is_generated:
                    slugs = ctx.anchors(dest)
                    if slugs is not None and slugify(anchor) not in slugs and anchor not in slugs:
                        rep.warn("link", f"anchor #{anchor} not found as a heading in {path}", p, ln)
    for img in sorted(book.rglob("*")):
        if img.suffix.lower() in IMAGE_SUFFIXES and img.resolve() not in used_images:
            rep.warn("image", f"image {img.relative_to(book).as_posix()} is not referenced by any page", img)
