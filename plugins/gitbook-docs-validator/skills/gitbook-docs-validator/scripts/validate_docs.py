#!/usr/bin/env python3
"""Validate a GitBook/mdBook documentation tree against the three-book template.

Usage:
    validate_docs.py <docs-root> [--repo-root DIR] [--template FILE]
                     [--only CHECKS | --skip CHECKS] [--list-checks]
                     [--format text|md|json] [--worklist] [--quiet]

The validators (books, landing, files, summary, pages, links, readme, roles, repo) live in
gbv/checks/ and can run on their own: --only links,summary runs just those, --skip repo runs
the rest. `books` (mapping folders to roles) always runs. --list-checks prints them.

--format md prints the report skeleton (verdict, structural failures, deviations, not checked)
in the shape SKILL.md asks for; --worklist adds the short list of files to read for the
qualitative pass.

Exit status: 1 when any ERROR was found, 0 otherwise; 2 on bad arguments. Python 3.8+,
standard library only.

The template is described in ../references/template.md. Role definitions (which folder names
map to which role, which pages each role needs) come from ../assets/template.json; a project
can override them with <docs-root>/.docs-template.json (same shape, merged role by role).
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import List, Optional

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.dont_write_bytecode = True  # keep the plugin directory free of __pycache__

from gbv import describe, run  # noqa: E402
from gbv.checks import ALWAYS, NAMES  # noqa: E402
from gbv.render import render_json, render_md, render_text  # noqa: E402

DEFAULT_TEMPLATE = HERE.parent / "assets" / "template.json"


def parse_names(ap: argparse.ArgumentParser, raw: str, flag: str) -> List[str]:
    names = [n.strip() for n in raw.split(",") if n.strip()]
    unknown = [n for n in names if n not in NAMES]
    if unknown or not names:
        ap.error(f"{flag}: unknown check(s) {', '.join(unknown) or '(none given)'}; choose from {', '.join(NAMES)}")
    return names


def select(ap: argparse.ArgumentParser, args) -> Optional[List[str]]:
    """Validators to run, or None for all."""
    if args.only and args.skip:
        ap.error("--only and --skip cannot be combined")
    if args.only:
        chosen = parse_names(ap, args.only, "--only")
        if "repo" in chosen and not args.repo_root:
            ap.error("--only repo needs --repo-root")
        return chosen
    if args.skip:
        skipped = parse_names(ap, args.skip, "--skip")
        if any(n in ALWAYS for n in skipped):
            ap.error(f"--skip: {', '.join(ALWAYS)} always runs")
        return [n for n in NAMES if n not in skipped]
    return None


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("docs_root", nargs="?", help="directory holding index.html and the book folders (e.g. docs/guide)")
    ap.add_argument("--repo-root", help="repository root for integration checks (README, Makefile, workflows)")
    ap.add_argument("--template", default=str(DEFAULT_TEMPLATE), help="role/template definition JSON")
    ap.add_argument("--only", metavar="CHECKS", help="comma-separated validators to run (books always runs)")
    ap.add_argument("--skip", metavar="CHECKS", help="comma-separated validators to leave out")
    ap.add_argument("--list-checks", action="store_true", help="print the validators and exit")
    ap.add_argument("--format", choices=("text", "md", "json"), default="text",
                    help="text listing (default), md report skeleton, or json")
    ap.add_argument("--json", action="store_true", help="same as --format json")
    ap.add_argument("--worklist", action="store_true", help="also list the files to read for the qualitative pass")
    ap.add_argument("--quiet", action="store_true", help="hide INFO findings in text output")
    args = ap.parse_args(argv)

    if args.list_checks:
        for name, desc in describe().items():
            print(f"{name:<8} {desc}")
        return 0
    if not args.docs_root:
        ap.error("the following arguments are required: docs_root")
    selected = select(ap, args)
    fmt = "json" if args.json else args.format

    docs_root = Path(args.docs_root)
    repo_root = Path(args.repo_root) if args.repo_root else None
    rep = run(docs_root, repo_root, Path(args.template), selected)
    worklist_lines = []
    if args.worklist:
        worklist_lines = ["", "---- worklist for the qualitative pass (not part of the report) ----"]
        worklist_lines += [f"read: {rep.docs_root.rstrip('/')}/{w}" for w in rep.worklist]
        worklist_lines += [f"generated (check for hand edits): {rep.docs_root.rstrip('/')}/{g}" for g in rep.generated]
    if fmt == "json":
        print(render_json(rep, args.worklist))
    elif fmt == "md":
        project = (repo_root or docs_root).resolve().name
        if not repo_root and docs_root.resolve().name in ("guide", "docs", "handbook", "book", "books"):
            project = next((p.name for p in docs_root.resolve().parents if p.name not in ("guide", "docs")), project)
        print(render_md(rep, project, repo_root, args.quiet))
        print("\n".join(worklist_lines))
    else:
        print(render_text(rep, args.quiet))
        if worklist_lines:
            print("\n".join(worklist_lines))
    return 1 if rep.counts()["ERROR"] else 0


if __name__ == "__main__":
    sys.exit(main())
