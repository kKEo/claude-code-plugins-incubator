"""Validator registry, in run order. `books` always runs first; the others can be selected."""
from __future__ import annotations

from collections import OrderedDict

from . import books, files, landing, links, pages, readme, repo, roles, summary

# name -> (scope, module). scope: "root" runs once, "book" runs per book, "repo" needs --repo-root.
CHECKS = OrderedDict([
    ("books", ("root", books)),
    ("landing", ("root", landing)),
    ("files", ("book", files)),
    ("summary", ("book", summary)),
    ("pages", ("book", pages)),
    ("links", ("book", links)),
    ("readme", ("book", readme)),
    ("roles", ("book", roles)),
    ("repo", ("repo", repo)),
])

NAMES = list(CHECKS)
ALWAYS = ("books",)
