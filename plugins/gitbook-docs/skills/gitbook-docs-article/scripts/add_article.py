#!/usr/bin/env python3
"""Add a dated article to a GitBook/mdBook documentation tree and index it on the landing page.

Usage:
    add_article.py <docs-root> --title "TITLE" [--date YYYY-MM-DD] [--slug SLUG] [--summary TEXT]
                   [--name NAME] [--repo-root DIR] [--repo-url URL] [--latest N] [--dry-run]
    add_article.py <docs-root> --sync [--latest N] [--dry-run]

Articles live in one extra book, <docs-root>/articles/, one file per article named
YYYY-MM-DD-<slug>.md. The date in the file name is the article's date and the only place it is
stored: it orders the article in every index.

With --title the script creates the articles book when it is missing (README.md, SUMMARY.md,
.gitbook.yaml, book.toml, home-button.js) and writes the article as a stub marked "> Draft.".
It never overwrites an article. Then, and on every --sync, it rebuilds the three indexes from
the article files, newest first:

  articles/SUMMARY.md   rewritten in full: every article (a draft too, so that it can be previewed)
  articles/README.md    the list between <!-- articles:start --> and <!-- articles:end -->
  index.html            the "Articles" section between the same two markers: the newest --latest
                        published articles (date, title, summary) and a link to all of them

The title of an index entry is the article's H1, the summary is its first paragraph, and an
article counts as published once its "> Draft." line is gone. So after writing or editing an
article, run --sync. On the landing page the script touches only the marked section; the first
time, it inserts the section above the footer and adds a few style rules to the page's <style>.

Exit status: 0 on success, 2 on bad arguments. Python 3.8+, standard library only.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import os
import re
import sys
import unicodedata
from pathlib import Path
from typing import List, NamedTuple, Optional

HERE = Path(__file__).resolve().parent
CREATOR = HERE.parent.parent / "gitbook-docs-creator"
VALIDATOR = HERE.parent.parent / "gitbook-docs-validator"
sys.dont_write_bytecode = True  # keep the plugin directory free of __pycache__
sys.path.insert(0, str(VALIDATOR / "scripts"))
sys.path.insert(0, str(CREATOR / "scripts"))

try:
    from gbv.core import ARTICLE_RE, HEADING_RE, articles_folder, load_template, read_lines, strip_fences  # noqa: E402
    from scaffold_docs import asset, fill, git, https_url, is_git_top, toml_str  # noqa: E402
except ImportError:
    sys.exit("add_article.py: cannot find the validator and creator skills next to this skill; "
             "all three ship in the gitbook-docs plugin")

START, END = "<!-- articles:start -->", "<!-- articles:end -->"
BLOCK_RE = re.compile(r"<!-- articles:start\b.*?-->.*?<!-- articles:end -->", re.S)
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
          "October", "November", "December"]
CSS_MARK = "/* articles index */"
CSS = f"""  {CSS_MARK}
  .articles {{ margin-top: 44px; }}
  .articles h2 {{ font-size: 1.3rem; margin: 0 0 12px; }}
  .articles ul {{ list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line, #ddd); }}
  .articles li {{ display: grid; grid-template-columns: 7.5em 1fr; gap: 2px 16px; padding: 12px 0; border-bottom: 1px solid var(--line, #ddd); }}
  .articles time {{ color: var(--muted, #666); font-size: .9rem; font-variant-numeric: tabular-nums; padding-top: 2px; }}
  .articles a {{ color: var(--accent, #2f5d8a); }}
  .articles li a {{ font-weight: 600; text-decoration: none; }}
  .articles li a:hover, .articles li a:focus-visible {{ text-decoration: underline; }}
  .articles li p {{ grid-column: 2; margin: 0; color: var(--muted, #666); font-size: .95rem; }}
  .articles .more {{ margin: 12px 0 0; font-size: .95rem; }}
  @media (max-width: 520px) {{ .articles li {{ grid-template-columns: 1fr; }} .articles li p {{ grid-column: 1; }} }}
"""


class Article(NamedTuple):
    file: str
    date: dt.date
    title: str
    summary: str
    draft: bool


def long_date(d: dt.date) -> str:
    return f"{d.day} {MONTHS[d.month - 1]} {d.year}"


def slugify(title: str) -> str:
    text = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower().replace("'", "")).strip("-")
    if len(slug) > 60:
        slug = slug[:60].rsplit("-", 1)[0]
    return slug


def plain(text: str) -> str:
    """Markdown inline text as plain words."""
    text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[`*_]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def read_article(path: Path, day: dt.date, draft_marker: str) -> Article:
    lines = read_lines(path)
    draft = any(line.rstrip("\n") == draft_marker for line in lines)
    text = re.sub(r"<!--.*?-->", "", "\n".join(t for _, t in strip_fences(lines)), flags=re.S)
    title, para = "", []
    for raw in text.split("\n"):
        s = raw.strip()
        m = HEADING_RE.match(s)
        if m and not title:
            if len(m.group(1)) == 1:
                title = plain(m.group(2))
            continue
        if not title:
            continue
        if not s:
            if para:
                break
            continue
        # The lead paragraph is the first plain one: not the date line, a callout, a heading, a list or a table.
        if not para and (m or s.startswith((">", "|", "- ", "* ", "<")) or re.match(r"^[*_]?Published\b", s)):
            continue
        if m:
            break
        para.append(s)
    summary = plain(" ".join(para))
    if len(summary) > 220:
        summary = summary[:220].rsplit(" ", 1)[0].rstrip(",;:") + "…"
    return Article(path.name, day, title or path.stem, summary, draft)


def load_articles(book: Path, draft_marker: str, notes: List[str]) -> List[Article]:
    out = []
    for p in sorted(book.glob("*.md")) if book.is_dir() else []:
        if p.name in ("README.md", "SUMMARY.md"):
            continue
        m = ARTICLE_RE.match(p.name)
        try:
            day = dt.date.fromisoformat(m.group(1)) if m else None
        except ValueError:
            day = None
        if not day:
            notes.append(f"{book.name}/{p.name} is not named YYYY-MM-DD-<slug>.md, so it is in no index; rename it")
            continue
        out.append(read_article(p, day, draft_marker))
    return sorted(out, key=lambda a: a.file, reverse=True)


# --- the three indexes -----------------------------------------------------------------------

def summary_md(articles: List[Article]) -> str:
    lines = ["# Summary", "", "[Articles](README.md)", ""]
    lines += [f"- [{a.title}]({a.file})" for a in articles]
    return "\n".join(lines).rstrip("\n") + "\n"


def readme_block(articles: List[Article]) -> str:
    rows = []
    for a in articles:
        tail = " (draft)" if a.draft else (f": {a.summary}" if a.summary else "")
        rows.append(f"- **{a.date.isoformat()}** [{a.title}]({a.file}){tail}")
    return "\n".join([START, *(rows or ["No articles yet."]), END])


def readme_md(name: str, articles: List[Article]) -> str:
    return (f"# Articles\n\nDated articles about {name}: announcements, explanations and write-ups, newest first. "
            "Each one describes things as they were on its date; the guides say what is true now.\n\n"
            f"{readme_block(articles)}\n")


def landing_block(folder: str, articles: List[Article], latest: int) -> str:
    published = [a for a in articles if not a.draft]
    if not published:
        return f"{START}\n  {END}"
    items = []
    for a in published[:latest]:
        d = a.date
        summary = f"<p>{html.escape(a.summary)}</p>" if a.summary else ""
        items.append(f'      <li><time datetime="{d.isoformat()}">{d.day} {MONTHS[d.month - 1][:3]} {d.year}</time> '
                     f'<a href="{folder}/{a.file[:-3]}.html">{html.escape(a.title)}</a>{summary}</li>')
    count = "All articles" if len(published) <= latest else f"All {len(published)} articles"
    return "\n".join([
        START,
        "  <!-- Generated from the article files by add_article.py. Do not edit: change an article, then run it with --sync. -->",
        '  <section class="articles" aria-labelledby="articles-title">',
        '    <h2 id="articles-title">Articles</h2>',
        "    <ul>", *items, "    </ul>",
        f'    <p class="more"><a href="{folder}/">{count}</a></p>',
        "  </section>",
        f"  {END}"])


def with_block(text: str, block: str, anchors: List[str]) -> Optional[str]:
    """`text` with the marked block replaced, or inserted before the first anchor found; None when it has no place."""
    if BLOCK_RE.search(text):
        return BLOCK_RE.sub(lambda _: block, text, count=1)
    for anchor in anchors:
        m = re.search(rf"^[ \t]*{re.escape(anchor)}", text, re.M | re.I)
        if m:
            return text[:m.start()] + "  " + block + "\n" + text[m.start():]
    return None


def with_css(text: str) -> str:
    if CSS_MARK in text or 'class="articles"' not in text:
        return text
    if "</style>" in text:
        return text.replace("</style>", CSS + "</style>", 1)
    if "</head>" in text:
        return text.replace("</head>", f"<style>\n{CSS}</style>\n</head>", 1)
    return text


class Out:
    def __init__(self, base: Path, dry: bool):
        self.base, self.dry = base, dry
        self.created: List[str] = []
        self.updated: List[str] = []
        self.todo: List[str] = []

    def rel(self, path: Path) -> str:
        return os.path.relpath(path, self.base)

    def put(self, path: Path, text: str) -> None:
        """Write `text` unless the file already holds it."""
        if path.exists():
            if path.read_text(encoding="utf-8", errors="replace") == text:
                return
            self.updated.append(self.rel(path))
        else:
            self.created.append(self.rel(path))
        if not self.dry:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8")

    def add(self, path: Path, text: str) -> None:
        """Write a file only when it does not exist."""
        if not path.exists():
            self.put(path, text)


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="Add a dated article and index it on the landing page.")
    ap.add_argument("docs_root", help="directory holding index.html and the book folders (usually docs/guide)")
    ap.add_argument("--title", help="title of the new article (its H1)")
    ap.add_argument("--date", help="date of the article, YYYY-MM-DD (default: today)")
    ap.add_argument("--slug", help="file name after the date (default: made from the title)")
    ap.add_argument("--summary", help="lead paragraph to start the article with; it becomes the index summary")
    ap.add_argument("--sync", action="store_true", help="only rebuild the indexes from the article files")
    ap.add_argument("--latest", type=int, default=5, help="how many articles the landing page shows (default: 5)")
    ap.add_argument("--name", help="project name as readers know it (default: the landing page's <h1>, else the repository folder name)")
    ap.add_argument("--repo-root", help="repository root (default: the git top level above the docs root, or the current directory)")
    ap.add_argument("--repo-url", help="https URL of the source repository (default: the origin remote)")
    ap.add_argument("--template", help="template.json to use instead of the validator's")
    ap.add_argument("--dry-run", action="store_true", help="print what would be written and write nothing")
    args = ap.parse_args(argv)
    if bool(args.title) == args.sync:
        ap.error("give --title to add an article, or --sync to rebuild the indexes")
    if args.sync and (args.date or args.slug or args.summary):
        ap.error("--date, --slug and --summary belong to a new article; they cannot be combined with --sync")
    if args.latest < 1:
        ap.error("--latest must be at least 1")

    docs_root = Path(args.docs_root).resolve()
    if args.repo_root:
        repo_root = Path(args.repo_root).resolve()
    else:
        anchor = next(p for p in [docs_root, *docs_root.parents] if p.is_dir())
        top = git(anchor, "rev-parse", "--show-toplevel")
        repo_root = Path(top).resolve() if top else Path.cwd().resolve()
    if repo_root != docs_root and repo_root not in docs_root.parents:
        ap.error(f"the docs root {docs_root} is not inside the repository root {repo_root}")

    tpl = load_template(Path(args.template) if args.template else VALIDATOR / "assets" / "template.json", docs_root)
    draft_marker = tpl.get("page_rules", {}).get("draft_marker", "> Draft.")
    folder = articles_folder(tpl)
    book = docs_root / folder
    landing = docs_root / tpl.get("landing_page", "index.html")
    landing_text = landing.read_text(encoding="utf-8", errors="replace") if landing.exists() else None
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", landing_text or "", re.S | re.I)
    name = args.name or (html.unescape(re.sub(r"<[^>]+>", "", h1.group(1))).strip() if h1 else "") or repo_root.name
    out = Out(repo_root, args.dry_run)
    new: Optional[Article] = None

    if args.title:
        title = " ".join(args.title.split())
        try:
            day = dt.date.fromisoformat(args.date) if args.date else dt.date.today()
        except ValueError:
            ap.error(f"--date expects YYYY-MM-DD; got '{args.date}'")
        slug = args.slug or slugify(title)
        file = f"{day.isoformat()}-{slug}.md"
        if not ARTICLE_RE.match(file):
            ap.error(f"the slug '{slug}' must be lowercase letters, digits and hyphens; pass --slug")
        if (book / file).exists():
            ap.error(f"{out.rel(book / file)} already exists; edit it, or pick another --slug or --date")

        top = repo_root if is_git_top(repo_root) else None
        repo_url = args.repo_url or (https_url(git(top, "remote", "get-url", "origin") or "") if top else "") or None
        repo_lines = ""
        if repo_url:
            repo_lines = (f'site-url = "/{repo_url.rstrip("/").rsplit("/", 1)[-1]}/{folder}/"\n'
                          f'git-repository-url = "{toml_str(repo_url)}"\n')
        out.add(book / "book.toml", fill(asset("book.toml"), TITLE=toml_str(f"{name} articles"),
                                         DESCRIPTION=toml_str(f"Dated articles about {name}, newest first."),
                                         BUILD_DIR=Path(os.path.relpath(repo_root / "site" / folder, book)).as_posix(),
                                         REPO_LINES=repo_lines))
        out.add(book / ".gitbook.yaml", asset("gitbook.yaml"))
        out.add(book / "home-button.js", asset("home-button.js"))

        lead = " ".join(args.summary.split()) if args.summary else ""
        brief = ("the article. The paragraph right under the date line is the lead: one or two sentences that say what "
                 "the article tells the reader; the indexes show it as the summary. Remove this comment and the Draft "
                 "line when the article is ready to publish, then run add_article.py --sync.")
        body = f"# {title}\n\n*Published {long_date(day)}*\n\n{draft_marker}\n\n<!-- To write: {brief} -->\n"
        if lead:
            body += f"\n{lead}\n"
        out.put(book / file, body)
        new = Article(file, day, title, lead, True)

    notes: List[str] = []
    articles = load_articles(book, draft_marker, notes)
    if new and out.dry:
        articles = sorted([*articles, new], key=lambda a: a.file, reverse=True)
    if not articles and not book.is_dir():
        ap.error(f"there is no articles book at {book}; add the first article with --title")

    out.put(book / "SUMMARY.md", summary_md(articles))
    readme = book / "README.md"
    if readme.exists():
        text = with_block(readme.read_text(encoding="utf-8", errors="replace"), readme_block(articles), [])
        if text is None:
            out.todo.append(f"{out.rel(readme)} has no {START} … {END} markers, so its article list was not updated; "
                            "add the two markers where the list belongs and run --sync")
        else:
            out.put(readme, text)
    else:
        out.put(readme, readme_md(name, articles))

    if landing_text is None:
        out.todo.append(f"there is no landing page {out.rel(landing)}; create the docs tree first (gitbook-docs-creator), then run --sync")
    else:
        text = with_block(landing_text, landing_block(folder, articles, args.latest), ["<footer", "</main>", "</body>"])
        if text is None:
            out.todo.append(f"{out.rel(landing)} has no <footer>, </main> or </body> to put the Articles section above; "
                            f"add {START} and {END} where it belongs and run --sync")
        else:
            out.put(landing, with_css(text))

    for t in (book / "book.toml",):
        if t.exists() and "home-button.js" not in t.read_text(encoding="utf-8", errors="replace"):
            out.todo.append(f'{out.rel(t)} does not load the Home button; add additional-js = ["home-button.js"] under [output.html]')
    mk = repo_root / "Makefile"
    if mk.exists():
        txt = mk.read_text(encoding="utf-8", errors="replace")
        books_line = re.search(r"^BOOKS\s*[:?]?=\s*(.*)$", txt, re.M)
        if books_line and folder not in books_line.group(1).split():
            out.todo.append(f"Makefile builds only the books in BOOKS ({books_line.group(1).strip()}); add '{folder}' to it, "
                            "or the article links on the landing page lead nowhere on the built site")
        elif not books_line and "mdbook" in txt.lower() and f"/{folder}" not in txt:
            out.todo.append(f"Makefile does not build {out.rel(book)}; add an mdbook build for it next to the other books")
    drafts = [a for a in articles if a.draft]

    for verb, files, sign in (("would create" if out.dry else "created", out.created, "+"),
                              ("would update" if out.dry else "updated", out.updated, "~")):
        if files:
            print(f"{verb} {len(files)} file(s) under {repo_root}:")
            for f in files:
                print(f"  {sign} {f}")
    if not out.created and not out.updated:
        print("the indexes are up to date; nothing written")
    for n in notes:
        out.todo.append(n)
    if out.todo:
        print("left for you:")
        for t in out.todo:
            print(f"  - {t}")
    print(f"articles: {len(articles)} ({len(articles) - len(drafts)} published, {len(drafts)} draft)"
          + (f"; newest: {articles[0].file}" if articles else ""))
    if drafts:
        print("drafts are in the book's SUMMARY.md but not on the landing page: " + ", ".join(a.file for a in drafts))
    script = Path(__file__).resolve()
    if new:
        print(f"next: write {out.rel(book / new.file)}, delete its '{draft_marker}' line, then run:")
        print(f"  python3 {script} {docs_root} --sync")
    else:
        print("next: check the tree with the validator:")
        print(f"  python3 {VALIDATOR / 'scripts' / 'validate_docs.py'} {docs_root} --repo-root {repo_root} --quiet")
    return 0


if __name__ == "__main__":
    sys.exit(main())
