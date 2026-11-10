"""gitbook-docs-validator: deterministic checks for the three-book documentation template.

Each validator lives in gbv/checks/<name>.py and reads shared state from gbv.context.Context.
"""
from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable, List, Optional

from .checks import ALWAYS, CHECKS, NAMES
from .context import Context
from .core import Report, find_page, load_template, md_files, required_keywords

WORKLIST_PICKS = {"user": ["quick-start"], "operator": ["configuration"], "tester": ["running"]}


def build_worklist(ctx: Context) -> List[str]:
    """The fixed set of files the qualitative pass reads: landing page, each README, one page per role."""
    root, tpl = ctx.root, ctx.tpl
    wl = []
    landing = root / tpl.get("landing_page", "index.html")
    if landing.exists():
        wl.append(landing.name)
    for role, folder in ctx.books.items():
        if (root / folder / "README.md").exists():
            wl.append(f"{folder}/README.md")
    for role, folder in ctx.books.items():
        spec = ctx.spec(role)
        for req_id in WORKLIST_PICKS.get(role, []):
            page = find_page({p: t for p, t in ctx.listed(role).items() if p != "README.md"},
                             required_keywords(spec, req_id))
            if page and (root / folder / page).is_file():
                wl.append(f"{folder}/{page}")
    return wl


def run(docs_root: Path, repo_root: Optional[Path], tpl_path: Path,
        selected: Optional[Iterable[str]] = None) -> Report:
    """Run the selected validators (all when None). The repo validator runs only with a repo root."""
    want = list(NAMES) if selected is None else [n for n in NAMES if n in set(selected) or n in ALWAYS]
    rep = Report(str(docs_root), str(repo_root) if repo_root else None)
    rep.full = len(want) == len(NAMES)
    if not docs_root.is_dir():
        rep.error("root", f"{docs_root} is not a directory")
        return rep
    ctx = Context(docs_root, repo_root, load_template(tpl_path, docs_root), rep)
    ran: List[str] = []

    for name in want:
        scope, mod = CHECKS[name]
        if scope == "root":
            mod.run(ctx)
            ran.append(name)
    book_checks = [n for n in want if CHECKS[n][0] == "book"]
    for role in ctx.books:
        for name in book_checks:
            CHECKS[name][1].run(ctx, role)
        rep.generated += [p.relative_to(docs_root).as_posix() for p in md_files(ctx.book(role)) if ctx.is_generated(p)]
    ran += book_checks
    rep.worklist = build_worklist(ctx)
    if "repo" in want and repo_root:
        CHECKS["repo"][1].run(ctx)
        ran.append("repo")
    rep.checks_run = ran
    return rep


def describe() -> Dict[str, str]:
    return {name: mod.DESCRIPTION for name, (_, mod) in CHECKS.items()}
