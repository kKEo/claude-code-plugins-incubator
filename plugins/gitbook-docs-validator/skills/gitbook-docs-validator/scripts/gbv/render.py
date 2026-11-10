"""Text, Markdown-skeleton and JSON renderings of a Report."""
from __future__ import annotations

import json
import re
from dataclasses import asdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from .checks import NAMES
from .core import Finding, Report

GROUP_NORMALISE = [(re.compile(r"'[^']*'"), "'…'"), (re.compile(r"\S+\.(md|svg|png|jpe?g|gif|webp|html)\b\S*"), "…"),
                   (re.compile(r"\d+"), "N")]
NO_GROUP = {"stub"}  # already aggregated per book
SKIP_RE = re.compile(r"\b(skipped|no root README|no Makefile)\b", re.I)


def group_key(f: Finding) -> Tuple[str, str]:
    if f.check in NO_GROUP:
        return f.check, f"{f.file}:{f.message}"
    msg = f.message
    for rx, sub in GROUP_NORMALISE:
        msg = rx.sub(sub, msg)
    return f.check, msg


def loc(f: Finding) -> str:
    return f"`{f.file}" + (f":{f.line}" if f.line else "") + "`" if f.file else ""


def md_bullets(findings: List[Finding]) -> List[str]:
    """One bullet per finding; three or more findings of the same kind collapse into one bullet."""
    groups: Dict[Tuple[str, str], List[Finding]] = {}
    for f in findings:
        groups.setdefault(group_key(f), []).append(f)
    out = []
    for fs in groups.values():
        if len(fs) >= 3:
            eg = ", ".join(loc(f) for f in fs[:3] if f.file)
            more = f" (+{len(fs) - 3} more)" if len(fs) > 3 else ""
            out.append(f"- {len(fs)}× {fs[0].message} — e.g. {eg}{more}")
        else:
            out.extend(f"- {loc(f) + ' — ' if f.file else ''}{f.message}" for f in fs)
    return out


def scope_label(rep: Report) -> str:
    return ", ".join(n for n in rep.checks_run if n != "books") or "books"


def render_md(rep: Report, project: str, repo_root: Optional[Path], quiet: bool) -> str:
    c = rep.counts()
    errs = [f for f in rep.findings if f.severity == "ERROR"]
    warns = [f for f in rep.findings if f.severity == "WARN"]
    skips = [f for f in rep.findings if f.severity == "INFO" and SKIP_RE.search(f.message)]
    notes = [f for f in rep.findings if f.severity == "INFO" and f not in skips]
    verdict = "FAIL" if errs else ("PASS with deviations" if warns else "PASS")
    roles = ", ".join(f"{r}={rep.books[r]}/" if r in rep.books else f"{r}=MISSING" for r in ("user", "operator", "tester"))
    title = "Documentation template check" if rep.full else f"Documentation check ({scope_label(rep)})"
    lines = [f"# {title}: {project}", "",
             f"**Verdict:** {verdict} — <one sentence on why>.",
             f"Books found: {roles}",
             f"Script: {c['ERROR']} error(s), {c['WARN']} warning(s), {c['INFO']} note(s).", "",
             "## Structural failures (must fix)"]
    lines += md_bullets(errs) or ["- None."]
    lines += ["", "## Template deviations (judge)"]
    lines += md_bullets(warns) or ["- None from the script."]
    lines += ["<!-- add deviations from the qualitative pass; say whether each is reasonable -->", "", "## Suggestions"]
    if not quiet:
        lines += md_bullets(notes)
    lines += ["<!-- add improvements beyond the template -->", "", "## Not checked"]
    lines += [f"- {f.message}" for f in skips]
    if not rep.full:
        not_run = [n for n in NAMES if n not in rep.checks_run]
        lines.append(f"- Validators not run in this pass: {', '.join(not_run)}. This is not a full template check.")
    elif not repo_root:
        lines.append("- Repository integration (root README, Makefile, workflows): no --repo-root given.")
    lines.append("- Built output: the books were not built with mdBook/GitBook; this is a static check.")
    return "\n".join(lines)


def render_json(rep: Report, with_worklist: bool) -> str:
    out = {"docs_root": rep.docs_root, "books": rep.books, "checks_run": rep.checks_run,
           "counts": rep.counts(), "findings": [asdict(f) for f in rep.findings]}
    if with_worklist:
        out["worklist"] = rep.worklist
        out["generated"] = rep.generated
    return json.dumps(out, indent=2)


def render_text(rep: Report, quiet: bool) -> str:
    counts = rep.counts()
    lines = [f"docs root: {rep.docs_root}",
             "books:     " + (", ".join(f"{r}={f}/" for r, f in rep.books.items()) or "none")]
    if not rep.full:
        lines.append(f"checks:    {scope_label(rep)} (partial run)")
    lines.append("")
    order = {"ERROR": 0, "WARN": 1, "INFO": 2}
    for f in sorted(rep.findings, key=lambda f: (order[f.severity], f.check, f.file or "", f.line or 0)):
        if quiet and f.severity == "INFO":
            continue
        lines.append(f.fmt())
    lines.append("")
    lines.append(f"summary: {counts['ERROR']} error(s), {counts['WARN']} warning(s), {counts['INFO']} note(s)")
    lines.append("verdict: " + ("FAIL (fix the errors; warnings are template deviations to judge)" if counts["ERROR"]
                                else "PASS (structure follows the template; review the warnings)"))
    return "\n".join(lines)
