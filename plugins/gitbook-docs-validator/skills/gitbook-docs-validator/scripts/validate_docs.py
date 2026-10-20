#!/usr/bin/env python3
"""Validate a GitBook/mdBook documentation tree against the three-book template.

Usage:
    validate_docs.py <docs-root> [--repo-root DIR] [--template FILE] [--json] [--quiet]

Exit status: 1 when any ERROR was found, 0 otherwise. Python 3.8+, standard library only.

The template is described in ../references/template.md. Role definitions (which folder names
map to which role, which pages each role needs) come from ../assets/template.json; a project
can override them with <docs-root>/.docs-template.json (same shape, merged role by role).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

HERE = Path(__file__).resolve().parent
DEFAULT_TEMPLATE = HERE.parent / "assets" / "template.json"

ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
LINK_RE = re.compile(r"(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
SUMMARY_LINK_RE = re.compile(r"^(\s*)(?:[-*]\s+)?\[([^\]]+)\]\(([^)]+)\)\s*$")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
HTML_HREF_RE = re.compile(r"href=\"([^\"]+)\"")


@dataclass
class Finding:
    severity: str  # ERROR | WARN | INFO
    check: str
    message: str
    file: Optional[str] = None
    line: Optional[int] = None

    def fmt(self) -> str:
        loc = ""
        if self.file:
            loc = f" [{self.file}" + (f":{self.line}" if self.line else "") + "]"
        return f"{self.severity:5} {self.check:<18} {self.message}{loc}"


@dataclass
class Report:
    docs_root: str
    books: Dict[str, str] = field(default_factory=dict)  # role -> folder
    findings: List[Finding] = field(default_factory=list)

    def add(self, severity: str, check: str, message: str, file: Optional[Path] = None, line: Optional[int] = None):
        rel = None
        if file is not None:
            try:
                rel = str(Path(file).resolve().relative_to(Path(self.docs_root).resolve()))
            except ValueError:
                rel = str(file)
        self.findings.append(Finding(severity, check, message, rel, line))

    def error(self, *a, **k):
        self.add("ERROR", *a, **k)

    def warn(self, *a, **k):
        self.add("WARN", *a, **k)

    def info(self, *a, **k):
        self.add("INFO", *a, **k)

    def counts(self) -> Dict[str, int]:
        c = {"ERROR": 0, "WARN": 0, "INFO": 0}
        for f in self.findings:
            c[f.severity] += 1
        return c


# ----------------------------------------------------------------------------- helpers

def load_template(path: Path, docs_root: Path) -> dict:
    with open(path, encoding="utf-8") as fh:
        tpl = json.load(fh)
    override = docs_root / ".docs-template.json"
    if override.exists():
        with open(override, encoding="utf-8") as fh:
            ov = json.load(fh)
        for key, val in ov.items():
            if key == "roles":
                for role, spec in val.items():
                    tpl["roles"].setdefault(role, {}).update(spec)
            elif key == "page_rules":
                tpl["page_rules"].update(val)
            else:
                tpl[key] = val
    return tpl


def strip_fences(lines: List[str]) -> List[Tuple[int, str]]:
    """Return (lineno, text) for lines outside fenced code blocks; fenced lines become ''."""
    out = []
    fence = None
    for i, raw in enumerate(lines, 1):
        s = raw.rstrip("\n")
        m = re.match(r"^\s*(`{3,}|~{3,})", s)
        if m:
            tok = m.group(1)[0]
            if fence is None:
                fence = tok
                out.append((i, ""))
                continue
            if fence == tok:
                fence = None
                out.append((i, ""))
                continue
        out.append((i, "" if fence else s))
    return out


def slugify(text: str) -> str:
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = text.strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s]+", "-", text).strip("-")


def read_lines(p: Path) -> List[str]:
    with open(p, encoding="utf-8", errors="replace") as fh:
        return fh.readlines()


ID_RE = re.compile(r"""(?:id|name)=["']([^"']+)["']|\{#([^}\s]+)\}""")


def anchor_ids(lines: List[str]) -> set:
    """Heading slugs plus explicit <a id="…"> / {#id} anchors on a page."""
    ids = {slugify(t) for _, _, t in headings(lines)}
    for _, t in strip_fences(lines):
        for a, b in ID_RE.findall(t):
            ids.add(a or b)
    return ids


def headings(lines: List[str]) -> List[Tuple[int, int, str]]:
    hs = []
    for ln, text in strip_fences(lines):
        m = HEADING_RE.match(text)
        if m:
            hs.append((ln, len(m.group(1)), m.group(2)))
    return hs


def md_files(book: Path) -> List[Path]:
    return sorted(p for p in book.rglob("*.md") if p.name != "SUMMARY.md")


def parse_summary(path: Path) -> List[Tuple[int, int, str, str]]:
    """(lineno, depth, title, target) for each link line in SUMMARY.md."""
    entries = []
    for ln, text in strip_fences(read_lines(path)):
        m = SUMMARY_LINK_RE.match(text)
        if not m:
            continue
        indent, title, target = m.groups()
        depth = len(indent.replace("\t", "  ")) // 2
        entries.append((ln, depth, title.strip(), target.strip()))
    return entries


def match_role(folder: str, roles: dict) -> List[str]:
    f = folder.lower()
    hits = []
    for role, spec in roles.items():
        for alias in spec.get("aliases", [role]):
            if f == alias or f.startswith(alias + "-") or f.endswith("-" + alias) or f.endswith(alias):
                hits.append(role)
                break
    return hits


# ----------------------------------------------------------------------------- checks

def check_landing(root: Path, tpl: dict, rep: Report, books: Dict[str, str]):
    landing = root / tpl.get("landing_page", "index.html")
    if not landing.exists():
        rep.error("landing", f"no landing page {landing.name} at the docs root (one card per book is the site's front door)")
        return
    html = landing.read_text(encoding="utf-8", errors="replace")
    if not re.search(r"<title>\s*\S", html, re.I):
        rep.error("landing", "landing page has no <title>", landing)
    if not re.search(r"<meta\s+name=\"description\"", html, re.I):
        rep.warn("landing", "landing page has no <meta name=\"description\">", landing)
    hrefs = HTML_HREF_RE.findall(html)
    for role, folder in books.items():
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


def check_book_files(book: Path, role: str, rep: Report):
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


def check_summary(book: Path, role: str, spec: dict, rules: dict, rep: Report) -> Dict[str, str]:
    """Returns {relative-path: title} of listed pages."""
    summ = book / "SUMMARY.md"
    listed: Dict[str, str] = {}
    if not summ.exists():
        return listed
    entries = parse_summary(summ)
    if not entries:
        rep.error("summary", "SUMMARY.md lists no chapters", summ)
        return listed
    if entries[0][3].split("#")[0] != "README.md":
        rep.error("summary", "first SUMMARY entry must be README.md (the book's front page)", summ, entries[0][0])
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
        listed[path] = title
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
    return listed


def check_pages(book: Path, root: Path, listed: Dict[str, str], rules: dict, rep: Report, sibling_books: Dict[str, str]):
    used_images = set()
    all_heading_slugs: Dict[Path, set] = {}
    pages = md_files(book)
    for p in pages:
        all_heading_slugs[p.resolve()] = anchor_ids(read_lines(p))
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
        # drafts & generated
        is_generated = False
        for ln, t in clean[:5]:
            if rules.get("generated_marker", "Generated by") in t and t.strip().startswith("<!--"):
                is_generated = True
        for ln, t in clean:
            if t.strip() == rules.get("draft_marker", "> Draft."):
                rep.warn("page", "page is marked as a draft", p, ln)
                break
        # links & images
        for ln, t in clean:
            for bang, alt, target in LINK_RE.findall(t):
                if target.startswith(("http://", "https://", "mailto:")):
                    continue
                if target.startswith("#"):
                    ids = all_heading_slugs.get(p.resolve(), set())
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
                    slugs = all_heading_slugs.get(dest)
                    if slugs is None and dest.is_file():
                        slugs = anchor_ids(read_lines(dest))
                    if slugs is not None and slugify(anchor) not in slugs and anchor not in slugs:
                        rep.warn("link", f"anchor #{anchor} not found as a heading in {path}", p, ln)
    for img in sorted(book.rglob("*")):
        if img.suffix.lower() in (".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp") and img.resolve() not in used_images:
            rep.warn("image", f"image {img.relative_to(book).as_posix()} is not referenced by any page", img)


def check_readme(book: Path, role: str, rep: Report, sibling_books: Dict[str, str], rules: dict):
    readme = book / "README.md"
    if not readme.exists():
        return
    lines = read_lines(readme)
    clean = strip_fences(lines)
    text = "\n".join(t for _, t in clean)
    low = text.lower()
    if not re.search(r"(this guide is for|who this is for|is for (the )?people|is written for|for anyone who)", low):
        rep.warn("readme", f"{role} README does not state its audience ('This guide is for …')", readme)
    table_rows = [t for _, t in clean if t.strip().startswith("|") and "](" in t]
    if len(table_rows) < rules.get("readme_table_min_links", 3):
        rep.warn("readme", f"{role} README has no reading-map table with at least {rules.get('readme_table_min_links', 3)} linked rows", readme)
    others = [f for r, f in sibling_books.items() if r != role]
    if others and not any(f"../{f}/" in text for f in others):
        rep.warn("readme", f"{role} README never points readers to a sibling book (../{others[0]}/ …)", readme)
    if re.search(r"\bv\d+\.\d+(\.\d+)?\b", text) and not any("Generated by" in t for _, t in clean[:5]):
        m = re.search(r"\bv\d+\.\d+(\.\d+)?\b", text)
        rep.info("readme", f"README quotes a version ({m.group(0)}); such text drifts on each release", readme)
    for ln, t in clean:
        for _, _, target in LINK_RE.findall(t):
            if target.startswith("../") and not target.split("#")[0].rstrip("/").split("/")[1:2] in ([f] for f in sibling_books.values()):
                if target.count("../") > 1 or target.split("/")[1] not in sibling_books.values():
                    rep.error("link", f"README link {target} leaves the docs root; link repository files with an absolute URL", readme, ln)


def check_roles(book: Path, role: str, spec: dict, listed: Dict[str, str], rep: Report):
    titles = " | ".join(f"{t} {p}".lower() for p, t in listed.items())
    for req in spec.get("required_pages", []):
        if not any(k.lower() in titles for k in req["any_of"]):
            msg = f"{role} book has no page for '{req['id']}' (looked for: {', '.join(req['any_of'][:3])}…). {req.get('why', '')}".strip()
            (rep.error if req.get("severity", "warn") == "error" else rep.warn)("role", msg, book / "SUMMARY.md")


def check_repo(repo: Path, root: Path, books: Dict[str, str], rep: Report):
    rel_root = root.resolve().relative_to(repo.resolve()).as_posix() if root.resolve().is_relative_to(repo.resolve()) else None
    readme = repo / "README.md"
    if readme.exists():
        txt = readme.read_text(encoding="utf-8", errors="replace")
        for role, folder in books.items():
            if rel_root and f"{rel_root}/{folder}" not in txt:
                rep.warn("repo", f"root README.md does not link the {role} book ({rel_root}/{folder})", readme)
        if re.search(r"\bboth guides\b", txt, re.I) and len(books) == 3:
            rep.warn("repo", "root README.md says 'both guides' but there are three books", readme)
    else:
        rep.info("repo", "no root README.md")
    docs_index = root.parent / "README.md"
    if docs_index.exists() and docs_index != readme:
        txt = docs_index.read_text(encoding="utf-8", errors="replace")
        for role, folder in books.items():
            if folder not in txt:
                rep.warn("repo", f"docs index {docs_index.relative_to(repo)} does not list the {role} book", docs_index)
        if "index.html" not in txt:
            rep.info("repo", f"docs index {docs_index.relative_to(repo)} does not mention the landing page", docs_index)
    mk = repo / "Makefile"
    if mk.exists():
        txt = mk.read_text(encoding="utf-8", errors="replace")
        for tgt in ("docs:", "docs-check:", "docs-serve:"):
            if not re.search(rf"^{re.escape(tgt)}", txt, re.M):
                rep.warn("repo", f"Makefile has no '{tgt[:-1]}' target", mk)
    else:
        rep.info("repo", "no Makefile; skipped the docs target check")
    wf_dir = repo / ".github" / "workflows"
    if wf_dir.exists():
        builds = []
        for wf in wf_dir.glob("*.y*ml"):
            t = wf.read_text(encoding="utf-8", errors="replace")
            if "mdbook" in t.lower() or "gitbook" in t.lower() or "make docs" in t:
                builds.append(wf)
        if not builds:
            rep.warn("repo", "no workflow builds the documentation (looked for mdbook/gitbook/make docs)", wf_dir)
        else:
            for wf in builds:
                t = wf.read_text(encoding="utf-8", errors="replace")
                if "mdbook" in t.lower() and not re.search(r"sha256", t, re.I):
                    rep.info("repo", "docs workflow installs mdBook without a checksum", wf)
    else:
        rep.info("repo", "no .github/workflows; skipped the docs workflow check")
    dc = list(repo.glob("scripts/docs-check*"))
    if not dc:
        rep.warn("repo", "no scripts/docs-check script that reconciles the operator reference with the code", repo / "scripts")


# ----------------------------------------------------------------------------- main

def run(docs_root: Path, repo_root: Optional[Path], tpl_path: Path) -> Report:
    rep = Report(str(docs_root))
    if not docs_root.is_dir():
        rep.error("root", f"{docs_root} is not a directory")
        return rep
    tpl = load_template(tpl_path, docs_root)
    roles = tpl["roles"]
    rules = tpl.get("page_rules", {})

    candidates = sorted(p.parent for p in docs_root.glob("*/SUMMARY.md"))
    if not candidates:
        rep.error("books", f"no book (directory with SUMMARY.md) under {docs_root}")
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
        rep.error("books", f"book {u}/ matches no role; the template has exactly three books (user, operator, tester). Rename it or add an alias in .docs-template.json", docs_root / u)
    for role in roles:
        if role not in books:
            rep.error("books", f"no {role} book: {roles[role].get('purpose', '')}")
    rep.books = books

    check_landing(docs_root, tpl, rep, books)
    for role, folder in books.items():
        book = docs_root / folder
        spec = roles[role]
        check_book_files(book, role, rep)
        listed = check_summary(book, role, spec, rules, rep)
        check_pages(book, docs_root, listed, rules, rep, books)
        check_readme(book, role, rep, books, rules)
        check_roles(book, role, spec, listed, rep)
    if repo_root:
        check_repo(repo_root, docs_root, books, rep)
    return rep


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("docs_root", help="directory holding index.html and the book folders (e.g. docs/guide)")
    ap.add_argument("--repo-root", help="repository root for integration checks (README, Makefile, workflows)")
    ap.add_argument("--template", default=str(DEFAULT_TEMPLATE), help="role/template definition JSON")
    ap.add_argument("--json", action="store_true", help="emit JSON instead of text")
    ap.add_argument("--quiet", action="store_true", help="hide INFO findings in text output")
    args = ap.parse_args(argv)

    rep = run(Path(args.docs_root), Path(args.repo_root) if args.repo_root else None, Path(args.template))
    counts = rep.counts()
    if args.json:
        print(json.dumps({"docs_root": rep.docs_root, "books": rep.books, "counts": counts,
                          "findings": [asdict(f) for f in rep.findings]}, indent=2))
    else:
        print(f"docs root: {rep.docs_root}")
        print("books:     " + (", ".join(f"{r}={f}/" for r, f in rep.books.items()) or "none"))
        print()
        order = {"ERROR": 0, "WARN": 1, "INFO": 2}
        for f in sorted(rep.findings, key=lambda f: (order[f.severity], f.check, f.file or "", f.line or 0)):
            if args.quiet and f.severity == "INFO":
                continue
            print(f.fmt())
        print()
        print(f"summary: {counts['ERROR']} error(s), {counts['WARN']} warning(s), {counts['INFO']} note(s)")
        print("verdict: " + ("FAIL (fix the errors; warnings are template deviations to judge)" if counts["ERROR"] else "PASS (structure follows the template; review the warnings)"))
    return 1 if counts["ERROR"] else 0


if __name__ == "__main__":
    sys.exit(main())
