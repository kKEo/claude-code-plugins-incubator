#!/usr/bin/env python3
"""Grade the gitbook-docs-creator eval runs of one iteration.

Usage: grade.py <iteration-dir>

Writes grading.json into every <iteration-dir>/eval-*/<config>/run-*/ directory. All checks
are mechanical: the validator's exit status, text searches in the written books, and a
comparison with the fixture's starting state in <iteration-dir>/baseline-state/.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILLS = HERE.parent / "gitbook-docs-validator" / "skills"
VALIDATOR = SKILLS / "gitbook-docs-validator" / "scripts" / "validate_docs.py"
EVALS = json.loads((SKILLS / "gitbook-docs-creator" / "evals" / "evals.json").read_text())["evals"]
sys.dont_write_bytecode = True
sys.path.insert(0, str(VALIDATOR.parent))
from gbv.core import load_template, match_role  # noqa: E402

TIME_RE = re.compile(r"\b(\d+|one|two|three|five|ten|fifteen|twenty|thirty)[\s-]*(minutes?|mins?|seconds?|hours?)\b", re.I)


class Run:
    def __init__(self, out: Path, ev: dict, base: Path):
        self.out, self.ev, self.base = out, ev, base
        self.repo = out / ev["repo_root"]
        self.docs = out / ev["docs_root"]
        tpl = load_template(SKILLS / "gitbook-docs-validator" / "assets" / "template.json", self.docs)
        self.books = {}
        if self.docs.is_dir():
            for d in sorted(p for p in self.docs.iterdir() if p.is_dir() and (p / "SUMMARY.md").exists()):
                hits = match_role(d.name, tpl["roles"])
                if len(hits) == 1:
                    self.books.setdefault(hits[0], d)
            # Content checks should not depend on the validator's folder aliases: a baseline run
            # may name a book 'operator-guide', which the aliases read as two roles.
            for d in sorted(p for p in self.docs.iterdir() if p.is_dir() and (p / "SUMMARY.md").exists()):
                for role, words in (("operator", ("operator", "internals")), ("tester", ("tester", "qa", "test")), ("user", ("user", "getting-started"))):
                    if role not in self.books and d not in self.books.values() and any(w in d.name.lower() for w in words):
                        self.books[role] = d

    def text(self, role=None) -> str:
        roots = [self.books[role]] if role in self.books else ([] if role else [self.docs])
        return "\n".join(p.read_text(errors="replace") for r in roots if r.is_dir() for p in sorted(r.rglob("*.md")))

    def pages(self):
        return sorted(self.docs.rglob("*.md")) if self.docs.is_dir() else []

    def validator(self):
        r = subprocess.run([sys.executable, str(VALIDATOR), str(self.docs), "--repo-root", str(self.repo), "--quiet"],
                           capture_output=True, text=True)
        errors = [ln for ln in r.stdout.splitlines() if ln.startswith("ERROR")]
        last = next((ln for ln in reversed(r.stdout.splitlines()) if ln.startswith("summary")), r.stderr.strip()[:200])
        return r.returncode == 0, f"exit {r.returncode}; {last}" + (f"; first: {errors[0][:160]}" if errors else "")

    def has_all(self, role, needles, regex=False):
        t = self.text(role)
        if role and role not in self.books:
            return False, f"no {role} book found"
        missing = [n for n in needles if not (re.search(n, t) if regex else n in t)]
        return not missing, "all found" if not missing else f"missing: {', '.join(missing)}"

    def readme_links_books(self):
        f = self.repo / "README.md"
        if not f.exists() or len(self.books) < 3:
            return False, f"README exists={f.exists()}, books mapped={sorted(self.books)}"
        t = f.read_text(errors="replace")
        rel = self.docs.relative_to(self.repo).as_posix()
        missing = [b.name for b in self.books.values() if f"{rel}/{b.name}" not in t]
        return not missing, "links every book" if not missing else f"no link to: {', '.join(missing)}"

    def no_gitbook_blocks(self):
        # A page that names such a block in backticks (to say "do not use it") does not use it.
        hits = [p.relative_to(self.docs).as_posix() for p in self.pages()
                if re.search(r"^\s*\{%", re.sub(r"`[^`\n]*`", "", p.read_text(errors="replace")), re.M)]
        return (bool(self.pages()) and not hits), "none" if not hits else f"found in: {', '.join(hits[:5])}"


def digest(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def checks(run: Run):
    eid = run.ev["id"]
    if eid == 0:
        def makefile():
            mk = run.repo / "Makefile"
            t = mk.read_text() if mk.exists() else ""
            missing = [x for x in ("docs", "docs-check", "docs-serve", "docs-site") if not re.search(rf"^{x}:", t, re.M)]
            return not missing, "all present" if not missing else f"missing targets: {', '.join(missing)}"

        def quick_start():
            book = run.books.get("user")
            qs = [p for p in (book.rglob("*.md") if book else []) if re.search(r"quick|getting-started|get-started", p.name)]
            ok = any(TIME_RE.search(p.read_text(errors="replace")) for p in qs)
            return ok, f"checked {[p.name for p in qs]}"

        return [
            run.validator,
            lambda: run.has_all("operator", [f"PINGBOARD_{x}" for x in ("PORT", "BIND", "INTERVAL", "TIMEOUT", "DATA", "LOG_LEVEL")]),
            lambda: run.has_all("operator", [r"\b8080\b", r"\b60\b", r"\b5\b", r"127\.0\.0\.1"], regex=True),
            lambda: run.has_all("operator", [r"pingboard add", r"pingboard remove", r"pingboard list", r"pingboard check", r"pingboard serve",
                                             r"--json", r"--fail-fast", r"--port"], regex=True),
            lambda: run.has_all("operator", ["pingboard_checks_total", "pingboard_target_up", "pingboard_check_duration_ms", "/healthz"]),
            lambda: run.has_all("tester", ["make test", "test_config.py", "test_store.py", "test_cli.py"]),
            quick_start,
            run.no_gitbook_blocks,
            makefile,
            run.readme_links_books,
        ]
    if eid == 1:
        def flat_gone():
            left = [n for n in ("usage.md", "architecture.md", "deploy.md", "testing.md") if (run.repo / "docs" / n).exists()]
            return not left, "all moved" if not left else f"still present: {', '.join(left)}"

        def no_9000():
            hits = [p.relative_to(run.docs).as_posix() for p in run.pages() if re.search(r"\b9000\b", p.read_text(errors="replace"))]
            return (bool(run.pages()) and not hits), "none" if not hits else f"9000 in: {', '.join(hits)}"

        def no_delete():
            bad = []
            for p in run.pages():
                for ln in p.read_text(errors="replace").splitlines():
                    if re.search(r"notekeep(\.py)? delete", ln) and not re.search(r"\b(no|not|never|n't|removed|missing)\b", ln, re.I):
                        bad.append(f"{p.relative_to(run.docs).as_posix()}: {ln.strip()[:80]}")
            return (bool(run.pages()) and not bad), "not presented as a command" if not bad else "; ".join(bad[:3])

        return [
            run.validator,
            flat_gone,
            lambda: run.has_all(None, [r"\b7070\b"], regex=True),
            no_9000,
            lambda: run.has_all("operator", ["NOTEKEEP_MAX_NOTE_BYTES"]),
            no_delete,
            lambda: run.has_all("operator", [rf"notekeep(\.py)? {c}\b" for c in ("serve", "list", "show", "export", "vacuum")], regex=True),
            lambda: run.has_all("tester", ["run-tests.sh"]),
            run.readme_links_books,
            run.no_gitbook_blocks,
        ]
    if eid == 2:
        qa = run.docs / "qa"

        def qa_files():
            missing = [n for n in ("README.md", "SUMMARY.md", ".gitbook.yaml", "book.toml") if not (qa / n).exists()]
            return not missing, "all present" if not missing else f"missing: {', '.join(missing)}"

        def parts():
            s = (qa / "SUMMARY.md").read_text() if (qa / "SUMMARY.md").exists() else ""
            n = len(re.findall(r"^\s*[-*]\s+\[Part\s+[IVX]+[:.]", s, re.M))
            return n >= 2, f"{n} numbered parts in SUMMARY.md"

        def untouched():
            changed = []
            for book in ("getting-started", "internals"):
                for p in sorted((run.base / "ledgerd" / "handbook" / book).rglob("*.md")):
                    rel = p.relative_to(run.base / "ledgerd")
                    q = run.repo / rel
                    if not q.exists() or digest(q) != digest(p):
                        changed.append(rel.as_posix())
            return not changed, "all identical" if not changed else f"changed or deleted: {', '.join(changed[:6])}"

        def makefile():
            mk = run.repo / "Makefile"
            t = mk.read_text() if mk.exists() else ""
            return bool(re.search(r"^docs:", t, re.M)) and "mdbook build handbook/getting-started" in t, "original recipe kept" if "mdbook build handbook/getting-started" in t else "original recipe gone"

        def honest():
            pages = [p for p in (qa.rglob("*.md") if qa.is_dir() else []) if re.search(r"running|run|ci|gates", p.stem) and p.name != "README.md"]
            if not pages:
                return False, "no running/CI page found"
            bad = []
            for p in pages:
                t = p.read_text(errors="replace")
                if not (re.search(r"^> Draft\.$", t, re.M) or re.search(r"\b(no|not yet|does not|doesn't|has no|there (is|are) no)\b[^.\n]{0,60}\b(tests?|CI|workflow|pipeline|suite)\b", t, re.I)):
                    bad.append(p.relative_to(qa).as_posix())
            return not bad, "drafts or explicit" if not bad else f"states test/CI facts as finished: {', '.join(bad)}"

        return [run.validator, qa_files, parts, untouched, makefile, honest, run.no_gitbook_blocks]
    raise SystemExit(f"no checks for eval {eid}")


def main():
    it = Path(sys.argv[1]).resolve()
    for ev in EVALS:
        for run_dir in sorted((it / f"eval-{ev['id']}-{ev['name']}").glob("*/run-*")):
            run = Run(run_dir / "outputs", ev, it / "baseline-state")
            exps = []
            for text, fn in zip(ev["assertions"], checks(run)):
                try:
                    ok, evidence = fn()
                except Exception as e:  # a check that cannot run is a failed check
                    ok, evidence = False, f"check raised {type(e).__name__}: {e}"
                exps.append({"text": text, "passed": bool(ok), "evidence": evidence})
            passed = sum(e["passed"] for e in exps)
            grading = {"expectations": exps,
                       "summary": {"passed": passed, "failed": len(exps) - passed, "total": len(exps),
                                   "pass_rate": round(passed / len(exps), 2)}}
            (run_dir / "grading.json").write_text(json.dumps(grading, indent=2) + "\n")
            print(f"{run_dir.relative_to(it)}: {passed}/{len(exps)}")
            for e in exps:
                if not e["passed"]:
                    print(f"    FAIL {e['text']} -- {e['evidence']}")


if __name__ == "__main__":
    main()
