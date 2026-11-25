#!/usr/bin/env python3
"""Scaffold a GitBook/mdBook documentation tree that follows the three-book template.

Usage:
    scaffold_docs.py <docs-root> --repo-root DIR [--name NAME] [--repo-url URL] [--lede TEXT]
                     [--books user,operator,tester] [--folders role=folder,...]
                     [--repo-files] [--template FILE] [--dry-run]

The template requires the user and operator books; the tester and developer books are optional.
Without --books the script scaffolds the required books plus any optional book that already
exists; name the optional ones to add them (--books user,operator,tester,developer).

Writes the landing page, and for each book README.md, SUMMARY.md, .gitbook.yaml, book.toml,
home-button.js and one page per required page of the template. Every page it writes is a
stub marked "> Draft." that carries, in an HTML comment, what the page has to contain.

It never overwrites or edits an existing file. In a book that already has a SUMMARY.md it
adds only the missing configuration files and reports the required pages the book lacks.
With --repo-files it also adds a Makefile, a docs workflow, scripts/docs-check.sh and a docs
index, each only when the repository has none.

Exit status: 0 on success, 2 on bad arguments. Python 3.8+, standard library only.

The required pages and the folder aliases come from the validator's template.json (and the
project's <docs-root>/.docs-template.json), so what this script writes is what
validate_docs.py checks. The outline (titles, files, parts, briefs) is ../assets/outline.json.
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / "assets"
VALIDATOR = HERE.parent.parent / "gitbook-docs-validator"
sys.dont_write_bytecode = True  # keep the plugin directory free of __pycache__
sys.path.insert(0, str(VALIDATOR / "scripts"))

try:
    from gbv.core import ROMAN, listed_pages, load_template, match_role, md_files  # noqa: E402
except ImportError:
    sys.exit(f"scaffold_docs.py: cannot find the validator next to this skill ({VALIDATOR}); "
             "both skills ship in the gitbook-docs-validator plugin")

DRAFT = "> Draft."


class Out:
    """Writes files that do not exist yet and keeps the list of what happened."""

    def __init__(self, base: Path, dry: bool):
        self.base, self.dry = base, dry
        self.created: List[str] = []
        self.kept: List[str] = []
        self.todo: List[str] = []

    def rel(self, path: Path) -> str:
        return os.path.relpath(path, self.base)

    def write(self, path: Path, text: str, executable: bool = False) -> bool:
        if path.exists():
            self.kept.append(self.rel(path))
            return False
        self.created.append(self.rel(path))
        if not self.dry:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8")
            if executable:
                path.chmod(0o755)
        return True


def fill(text: str, **values: str) -> str:
    for key, val in values.items():
        text = text.replace("{{" + key + "}}", val)
    return text


def asset(name: str) -> str:
    return (ASSETS / name).read_text(encoding="utf-8")


def git(repo: Path, *args: str) -> Optional[str]:
    try:
        r = subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, timeout=10)
    except (OSError, subprocess.SubprocessError):
        return None
    return r.stdout.strip() if r.returncode == 0 and r.stdout.strip() else None


def is_git_top(repo: Path) -> bool:
    top = git(repo, "rev-parse", "--show-toplevel")
    return bool(top) and Path(top).resolve() == repo.resolve()


def https_url(remote: str) -> str:
    m = re.match(r"^(?:git@|ssh://git@)([^:/]+)[:/](.+?)(?:\.git)?$", remote)
    if m:
        return f"https://{m.group(1)}/{m.group(2)}"
    return re.sub(r"\.git$", "", remote)


def toml_str(text: str) -> str:
    return text.replace("\\", "\\\\").replace('"', '\\"')


# --- outline -------------------------------------------------------------------------------

def required_ids(spec: dict) -> List[dict]:
    return spec.get("required_pages", [])


def plan_book(role: str, spec: dict, outline: dict) -> List[dict]:
    """The chapters to write for one role: outline entries the template still requires, plus a
    plain page for every required page the outline does not cover (project overrides)."""
    wanted = {r["id"] for r in required_ids(spec)}
    chapters: List[dict] = []
    for ch in outline["chapters"]:
        if "dir" in ch:
            pages = [p for p in ch["pages"] if p.get("id") is None or p["id"] in wanted]
            if pages:
                chapters.append(dict(ch, pages=pages))
        elif ch.get("id") is None or ch["id"] in wanted:
            chapters.append(dict(ch))

    def haystack() -> str:
        items = []
        for ch in chapters:
            if "dir" in ch:
                items.append(f"{ch['title']} {ch['dir']}/README.md")
                items += [f"{p['title']} {ch['dir']}/{p['file']}" for p in ch["pages"]]
            else:
                items.append(f"{ch['title']} {ch['file']}")
        return " | ".join(items).lower()

    for req in required_ids(spec):
        if any(k.lower() in haystack() for k in req["any_of"]):
            continue
        extra = {"id": req["id"], "file": f"{req['id']}.md", "title": req["any_of"][0].capitalize(),
                 "want": req["any_of"][0].capitalize(), "when": req.get("why", ""),
                 "brief": req.get("why", "This project's template requires this page.")}
        last_part = max((i for i, c in enumerate(chapters) if "dir" in c and c.get("numbered", True)), default=-1)
        chapters.insert(last_part + 1, extra)
    return chapters


def stub(title: str, brief: str, body: str = "") -> str:
    comment = (f"<!-- To write: {brief} Remove this comment and the Draft line when the page is complete; "
               "keep the Draft line while any fact is unknown. -->")
    return f"# {title}\n\n{DRAFT}\n\n{comment}\n" + (f"\n{body.rstrip()}\n" if body else "")


def part_titles(chapters: List[dict]) -> Dict[int, Tuple[str, str]]:
    """index -> (SUMMARY title, short label for the reading map) for part chapters."""
    out, n = {}, 0
    for i, ch in enumerate(chapters):
        if "dir" not in ch:
            continue
        if ch.get("numbered", True):
            n += 1
            num = ROMAN[n - 1] if n <= len(ROMAN) else str(n)
            out[i] = (f"Part {num}: {ch['title']}", f"{num}. {ch['title']}")
        else:
            out[i] = (ch["title"], ch["title"])
    return out


def summary_md(front: str, chapters: List[dict]) -> str:
    titles = part_titles(chapters)
    lines = ["# Summary", "", f"[{front}](README.md)", ""]
    for i, ch in enumerate(chapters):
        if "dir" in ch:
            lines.append(f"- [{titles[i][0]}]({ch['dir']}/README.md)")
            lines += [f"  - [{p['title']}]({ch['dir']}/{p['file']})" for p in ch["pages"]]
        else:
            lines.append(f"- [{ch['title']}]({ch['file']})")
    return "\n".join(lines) + "\n"


def readme_md(role: str, name: str, outline: dict, chapters: List[dict], folders: Dict[str, str],
              outlines: dict) -> str:
    titles = part_titles(chapters)
    flat = not any("dir" in ch for ch in chapters)
    h1 = outline["front"] if role == "user" else f"{name} {outline['book']}"
    head = outline["map_header"]
    rows = [f"| {head[0]} | {head[1]} |", "|---|---|"]
    for i, ch in enumerate(chapters):
        if "dir" in ch:
            rows.append(f"| [{titles[i][1]}]({ch['dir']}/README.md) | {ch.get('when', '')} |")
        elif flat:
            rows.append(f"| {ch.get('want', ch['title'])} | [{ch['title']}]({ch['file']}) |")
        else:
            rows.append(f"| [{ch['title']}]({ch['file']}) | {ch.get('when', '')} |")
    others = [f"the [{outlines[r]['book']}](../{f}/) {outlines[r]['blurb']}" for r, f in folders.items() if r != role]
    body = [outline["audience"].format(name=name), "", "## How to read this guide" if flat else "## What you will find here", ""]
    body += rows
    if others:
        sentence = "; ".join(others)
        body += ["", f"> **Looking for something else?** {sentence[0].upper()}{sentence[1:]}."]
    return stub(h1, outline["readme_brief"].format(name=name), "\n".join(body))


def part_readme_md(title: str, ch: dict) -> str:
    listing = "\n".join(f"- [{p['title']}]({p['file']})" for p in ch["pages"])
    brief = ("One or two sentences on what this part is for and in which order to read it, "
             "then one line per chapter that says what the chapter answers.")
    return stub(title, brief, listing)


# --- books ---------------------------------------------------------------------------------

def scaffold_book(out: Out, role: str, folder: str, docs_root: Path, repo_root: Path, name: str,
                  repo_url: Optional[str], spec: dict, outline: dict, folders: Dict[str, str],
                  outlines: dict) -> None:
    book = docs_root / folder
    had_summary = (book / "SUMMARY.md").exists()
    existing_pages = [p.relative_to(book).as_posix() for p in md_files(book)] if book.is_dir() else []

    build_dir = Path(os.path.relpath(repo_root / "site" / folder, book)).as_posix()
    repo_lines = ""
    if repo_url:
        repo_lines = (f'site-url = "/{repo_url.rstrip("/").rsplit("/", 1)[-1]}/{folder}/"\n'
                      f'git-repository-url = "{toml_str(repo_url)}"\n')
    out.write(book / "book.toml", fill(asset("book.toml"), TITLE=toml_str(f"{name} {outline['book']}"),
                                       DESCRIPTION=toml_str(outline["description"].format(name=name)),
                                       BUILD_DIR=build_dir, REPO_LINES=repo_lines))
    out.write(book / ".gitbook.yaml", asset("gitbook.yaml"))
    out.write(book / "home-button.js", asset("home-button.js"))
    toml = book / "book.toml"
    if toml.exists() and "home-button.js" not in toml.read_text(encoding="utf-8", errors="replace"):
        out.todo.append(f'{folder}/book.toml does not load the Home button; add additional-js = ["home-button.js"] '
                        "under [output.html]")

    if had_summary:
        # An existing book: its SUMMARY.md is the author's; say what is missing, write no page.
        listed = listed_pages(book)
        titles = " | ".join(f"{t} {p}".lower() for p, t in listed.items())
        for req in required_ids(spec):
            if not any(k.lower() in titles for k in req["any_of"]):
                kind = "required" if req.get("severity") == "error" else "recommended"
                out.todo.append(f"{folder}/: no page for '{req['id']}' ({kind}); add the page and its SUMMARY.md "
                                f"entry (title or path containing one of: {', '.join(req['any_of'][:3])})")
        if not (book / "README.md").exists():
            out.todo.append(f"{folder}/: SUMMARY.md exists but README.md does not; write the book front page")
        return

    chapters = plan_book(role, spec, outline)
    titles = part_titles(chapters)
    out.write(book / "SUMMARY.md", summary_md(outline["front"], chapters))
    out.write(book / "README.md", readme_md(role, name, outline, chapters, folders, outlines))
    for i, ch in enumerate(chapters):
        if "dir" in ch:
            out.write(book / ch["dir"] / "README.md", part_readme_md(titles[i][0], ch))
            for p in ch["pages"]:
                out.write(book / ch["dir"] / p["file"], stub(p["title"], p["brief"].format(name=name)))
        else:
            out.write(book / ch["file"], stub(ch["title"], ch["brief"].format(name=name)))
    planned = set(listed_pages(book)) if not out.dry else set()
    strays = [p for p in existing_pages if p not in planned and p != "README.md"]
    if strays:
        shown = ", ".join(strays[:8]) + (f", … (+{len(strays) - 8} more)" if len(strays) > 8 else "")
        out.todo.append(f"{folder}/: {len(strays)} page(s) were already here and are not in the new SUMMARY.md "
                        f"(unpublished until listed or moved): {shown}")


def landing_html(name: str, lede: str, repo_url: Optional[str], folders: Dict[str, str], outlines: dict) -> str:
    cards = []
    for role, folder in folders.items():
        c = outlines[role]["card"]
        bullets = "".join(f"<li>{html.escape(b)}</li>" for b in c["bullets"])
        cards.append(
            f'    <a class="card" href="{folder}/">\n'
            f'      <div class="tag">{html.escape(c["tag"])}</div>\n'
            f'      <h2>{html.escape(c["title"])}</h2>\n'
            f'      <p>{html.escape(c["summary"].format(name=name))}</p>\n'
            f'      <ul>{bullets}</ul>\n'
            f'    </a>')
    guides = [outlines[r]["card"]["title"].lower() for r in folders]
    guides_text = ", ".join(guides[:-1]) + (" and " if len(guides) > 1 else "") + guides[-1]
    if repo_url:
        shown = re.sub(r"^https?://", "", repo_url)
        footer = f'Source and issues: <a href="{html.escape(repo_url)}">{html.escape(shown)}</a>'
    else:
        footer = "<!-- TODO: link the source repository and name the licence -->"
    return fill(asset("index.html"), NAME=html.escape(name), GUIDES=html.escape(guides_text),
                LEDE=html.escape(lede), CARDS="\n".join(cards), FOOTER=footer)


# --- repository files ------------------------------------------------------------------------

def repo_files(out: Out, docs_root: Path, repo_root: Path, name: str, folders: Dict[str, str], outlines: dict) -> None:
    docs = Path(os.path.relpath(docs_root, repo_root)).as_posix()
    first = next(iter(folders.values()))
    existing_check = sorted(repo_root.glob("scripts/docs-check*"))
    if existing_check:
        check_cmd = "./" + existing_check[0].relative_to(repo_root).as_posix()
        out.kept.append(existing_check[0].relative_to(repo_root).as_posix())
    else:
        check_cmd = "./scripts/docs-check.sh"
        out.write(repo_root / "scripts" / "docs-check.sh",
                  fill(asset("docs-check.sh"), DOCS=docs, OPERATOR=folders.get("operator", "operator")), executable=True)

    mk = repo_root / "Makefile"
    fragment = fill(asset("Makefile.docs"), DOCS=docs, BOOKS=" ".join(folders.values()), FIRST_BOOK=first, DOCS_CHECK=check_cmd)
    if mk.exists():
        txt = mk.read_text(encoding="utf-8", errors="replace")
        missing = [t for t in ("docs", "docs-check", "docs-build", "docs-serve", "docs-site") if not re.search(rf"^{t}:", txt, re.M)]
        out.kept.append("Makefile")
        if missing:
            out.todo.append(f"Makefile exists and was not changed; add the targets {', '.join(missing)} from "
                            f"{ASSETS / 'Makefile.docs'} (DOCS := {docs}, BOOKS := {' '.join(folders.values())}, "
                            f"docs-check runs {check_cmd})")
    else:
        out.write(mk, fragment)

    wf_dir = repo_root / ".github" / "workflows"
    builds = [w for w in wf_dir.glob("*.y*ml")
              if re.search(r"mdbook|gitbook|make docs", w.read_text(encoding="utf-8", errors="replace"), re.I)] if wf_dir.is_dir() else []
    if builds:
        out.kept.append(builds[0].relative_to(repo_root).as_posix())
    else:
        top = repo_root if is_git_top(repo_root) else None
        branch = (git(top, "symbolic-ref", "--short", "HEAD") if top else None) or "main"
        out.write(wf_dir / "docs.yml", fill(asset("docs.yml"), DOCS=docs, BRANCH=branch))
        if not top or branch == "main":
            out.todo.append(".github/workflows/docs.yml deploys from the branch 'main'; change it if the default branch differs")

    index = docs_root.parent / "README.md"
    if index.resolve() != (repo_root / "README.md").resolve() and repo_root.resolve() in index.resolve().parents:
        rows = "\n".join(
            f"| {outlines[r]['card']['title']} | [{docs}/{f}/]({docs_root.name}/{f}/README.md) | {outlines[r]['card']['tag'][4:].capitalize()} |"
            for r, f in folders.items())
        out.write(index, fill(asset("docs-index.md"), NAME=name, DOCS=docs, GUIDE_REL=docs_root.name,
                              BOOK_ROWS=rows, FIRST_BOOK=first))

    readme = repo_root / "README.md"
    if readme.exists():
        txt = readme.read_text(encoding="utf-8", errors="replace")
        unlinked = [f"{docs}/{f}" for f in folders.values() if f"{docs}/{f}" not in txt]
        if unlinked:
            out.todo.append(f"README.md does not link {', '.join(unlinked)}; add a Documentation section that links every book")
    else:
        out.todo.append("there is no root README.md; when one is written it has to link every book")
    gi = repo_root / ".gitignore"
    if not gi.exists() or not re.search(r"^/?site/?$", gi.read_text(encoding="utf-8", errors="replace"), re.M):
        out.todo.append("add 'site/' (the mdBook build output) to .gitignore")


# --- main ----------------------------------------------------------------------------------

def parse_folders(ap: argparse.ArgumentParser, raw: Optional[str], roles: List[str]) -> Dict[str, str]:
    given: Dict[str, str] = {}
    for item in (raw or "").split(","):
        if not item.strip():
            continue
        role, _, folder = item.partition("=")
        if role.strip() not in roles or not folder.strip() or "/" in folder:
            ap.error(f"--folders expects role=folder pairs with roles from {', '.join(roles)}; got '{item}'")
        given[role.strip()] = folder.strip()
    return given


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="Scaffold a documentation tree that follows the three-book template.")
    ap.add_argument("docs_root", help="directory for index.html and the book folders (usually docs/guide)")
    ap.add_argument("--repo-root", help="repository root (default: the git top level above the docs root, or the current directory)")
    ap.add_argument("--name", help="project name as readers know it (default: the repository folder name)")
    ap.add_argument("--repo-url", help="https URL of the source repository (default: the origin remote)")
    ap.add_argument("--lede", help="one sentence for the landing page that says what the project does for its reader")
    ap.add_argument("--books", help="roles to scaffold, comma separated (default: the required roles user,operator plus optional books that exist; optional: tester,developer)")
    ap.add_argument("--folders", help="folder name per role, e.g. user=getting-started,tester=qa (default: an existing book folder, else the role name)")
    ap.add_argument("--repo-files", action="store_true", help="also add Makefile, docs workflow, scripts/docs-check.sh and docs index when missing")
    ap.add_argument("--template", help="template.json to use instead of the validator's")
    ap.add_argument("--dry-run", action="store_true", help="print what would be written and write nothing")
    args = ap.parse_args(argv)

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
    outlines = json.loads(asset("outline.json"))["roles"]
    all_roles = [r for r in tpl["roles"] if r in outlines]
    for r in tpl["roles"]:
        if r not in outlines:
            print(f"note: the template defines the role '{r}', which has no outline; write that book by hand", file=sys.stderr)
    required = [r for r in all_roles if not tpl["roles"][r].get("optional")]
    optional = [r for r in all_roles if tpl["roles"][r].get("optional")]
    roles = None
    if args.books:
        roles = [b.strip() for b in args.books.split(",") if b.strip()]
        unknown = [b for b in roles if b not in all_roles]
        if unknown or not roles:
            ap.error(f"--books expects roles from {', '.join(all_roles)}; got '{args.books}'")

    # Folder per role: asked for, else an existing book that maps to the role, else the role name.
    given = parse_folders(ap, args.folders, all_roles)
    present: Dict[str, str] = {}
    if docs_root.is_dir():
        for d in sorted(p for p in docs_root.iterdir() if p.is_dir() and (p / "SUMMARY.md").exists()):
            hits = match_role(d.name, tpl["roles"])
            if len(hits) == 1 and hits[0] not in present:
                present[hits[0]] = d.name
    if roles is None:  # the required books, plus optional books that already exist
        roles = [r for r in all_roles if r in required or r in present]
    all_folders = {r: given.get(r) or present.get(r) or r for r in all_roles}
    for r, f in all_folders.items():
        if r not in roles and r not in present:
            continue
        if match_role(f, tpl["roles"]) != [r]:
            ap.error(f"the folder '{f}' does not map to the role '{r}' alone; pick another name or add it to the "
                     f"aliases of '{r}' in {docs_root / '.docs-template.json'} first")
    # Sibling links and landing cards cover the books that exist or are being written now.
    folders = {r: f for r, f in all_folders.items() if r in roles or r in present}

    top = repo_root if is_git_top(repo_root) else None
    name = args.name or repo_root.name
    repo_url = args.repo_url or (https_url(git(top, "remote", "get-url", "origin") or "") if top else "") or None
    lede = args.lede or f"TODO: one sentence that says what {name} does for its reader."

    out = Out(repo_root, args.dry_run)
    for role in roles:
        scaffold_book(out, role, folders[role], docs_root, repo_root, name, repo_url, tpl["roles"][role],
                      outlines[role], folders, outlines)
    landing = docs_root / tpl.get("landing_page", "index.html")
    if out.write(landing, landing_html(name, lede, repo_url, folders, outlines)):
        if not args.lede:
            out.todo.append(f"{out.rel(landing)}: replace the TODO lede with one sentence on what {name} does")
        out.todo.append(f"{out.rel(landing)}: rewrite each card's summary and bullets once the books have content"
                        + ("" if repo_url else "; fill in the footer (source link, licence)"))
    else:
        text = landing.read_text(encoding="utf-8", errors="replace")
        for role in roles:
            if not re.search(rf'href="{re.escape(folders[role])}/?"', text):
                out.todo.append(f"{out.rel(landing)} exists and has no card for {folders[role]}/; add one (href=\"{folders[role]}/\")")
    if args.repo_files:
        repo_files(out, docs_root, repo_root, name, folders, outlines)

    verb = "would create" if args.dry_run else "created"
    print(f"{verb} {len(out.created)} file(s) under {repo_root}:")
    for f in out.created:
        print(f"  + {f}")
    if out.kept:
        print(f"kept {len(out.kept)} existing file(s) unchanged:")
        for f in out.kept:
            print(f"  = {f}")
    if out.todo:
        print("left for you (the script edits no existing file):")
        for t in out.todo:
            print(f"  - {t}")
    books = ", ".join(f"{r}={f}/" for r, f in folders.items())
    print(f"books: {books}")
    missing = [r for r in required if r not in folders]
    if missing:
        print(f"not scaffolded: {', '.join(missing)} (required by the template)")
    left_out = [r for r in optional if r not in folders]
    if left_out:
        print(f"optional books not scaffolded: {', '.join(left_out)} (add with --books {','.join(list(folders) + left_out)})")
    print("next: fill the pages marked '> Draft.', then run the validator:")
    print(f"  python3 {VALIDATOR / 'scripts' / 'validate_docs.py'} {docs_root} --repo-root {repo_root} --format md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
