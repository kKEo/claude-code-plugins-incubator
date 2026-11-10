"""repo: root README, docs index, Makefile targets, docs workflow and docs-check script (needs --repo-root)."""
from __future__ import annotations

import re

from ..context import Context
from ..core import rel_to

DESCRIPTION = "repository integration: root README, docs index, Makefile, workflow, docs-check (needs --repo-root)"


def run(ctx: Context) -> None:
    rep, repo, root, books = ctx.rep, ctx.repo, ctx.root, ctx.books
    rel_root = rel_to(root, repo)
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
    # Only look for a docs index inside the repository; never above --repo-root.
    if docs_index.exists() and rel_to(docs_index, repo) and docs_index.resolve() != readme.resolve():
        txt = docs_index.read_text(encoding="utf-8", errors="replace")
        shown = rel_to(docs_index, repo)
        for role, folder in books.items():
            if folder not in txt:
                rep.warn("repo", f"docs index {shown} does not list the {role} book", docs_index)
        if "index.html" not in txt:
            rep.info("repo", f"docs index {shown} does not mention the landing page", docs_index)
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
