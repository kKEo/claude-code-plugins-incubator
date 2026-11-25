#!/usr/bin/env bash
# docs-check: keep the books under docs/guide/ honest.
#
#  1. Every relative link resolves to a file or directory inside docs/guide/. A link that
#     leaves the books would break on the published site; use an absolute repository URL.
#  2. Reconciliation: every name the code defines (environment variables, commands, metrics)
#     appears on its reference page in the operator book. Add one block per reference page
#     in section 2; a block is skipped while its page is still a draft ("> Draft.").
#
# Portable: bash, grep -E, sed, find; no GNU-only flags. Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")/.."

GUIDE=docs/guide
OP=$GUIDE/operator
fail=0
err()  { echo "docs-check: $*" >&2; fail=1; }
warn() { echo "docs-check: warning: $*" >&2; }
is_draft() { grep -qx '> Draft\.' "$1"; }

# reconcile <reference page> <label> <names...>: each name must appear in backticks on the page.
reconcile() {
  local page="$1" label="$2"; shift 2
  if [ ! -f "$page" ]; then err "$label reference page $page does not exist"; return; fi
  if is_draft "$page"; then warn "$page is a draft; skipping the $label check"; return; fi
  [ "$#" -gt 0 ] || { err "found no $label names in the code; is the pattern stale?"; return; }
  local n
  for n in "$@"; do
    grep -qF -- "\`$n\`" "$page" || err "$label $n is in the code but missing from $page"
  done
}

# 1. Relative links.
guide_root=$(cd "$GUIDE" && pwd -P)
broken=$(mktemp)
trap 'rm -f "$broken"' EXIT
while IFS= read -r -d '' md; do
  dir=$(dirname "$md")
  # Markdown links ](target), skipping URLs, mailto and same-page anchors.
  { grep -oE '\]\([^)[:space:]]+\)' "$md" || true; } | sed -E 's/^\]\(//; s/\)$//' |
  while IFS= read -r target; do
    case "$target" in http://*|https://*|mailto:*|\#*) continue ;; esac
    path=${target%%#*}
    [ -z "$path" ] && continue
    if [ ! -e "$dir/$path" ]; then
      echo "docs-check: broken link in $md: $target" >&2; echo x
      continue
    fi
    real=$(cd "$(dirname "$dir/$path")" && pwd -P)
    case "$real/" in "$guide_root"/*) ;; *) echo "docs-check: link leaves $GUIDE in $md: $target (use a repository URL)" >&2; echo x ;; esac
  done
done < <(find "$GUIDE" -name '*.md' -print0) > "$broken"
[ -s "$broken" ] && fail=1

# 2. Reconciliation with the code: every name the code defines is on its reference page.
#
# Environment variables read by the code.
vars=$(grep -rhoE '"PINGBOARD_[A-Z_]*[A-Z]"' pingboard | tr -d '"' | sort -u || true)
reconcile "$OP/config/environment.md" "environment variable" $vars

# Commands and flags the argument parser defines.
cmds=$(grep -oE 'add_parser\("[a-z-]+"' pingboard/cli.py | sed -E 's/.*"([a-z-]+)"/\1/' | sort -u || true)
reconcile "$OP/config/commands.md" "command" $cmds
flags=$(grep -oE 'add_argument\("--[a-z-]+"' pingboard/cli.py | sed -E 's/.*"(--[a-z-]+)"/\1/' | sort -u || true)
reconcile "$OP/config/commands.md" "flag" $flags

# Paths the HTTP server answers.
routes=$(grep -oE 'self\.path == "[^"]+"' pingboard/server.py | sed -E 's/.*"([^"]+)"/\1/' | sort -u || true)
reconcile "$OP/config/http.md" "HTTP route" $routes

# Metrics the server exposes.
metrics=$(grep -oE 'pingboard_[a-z_]*[a-z]' pingboard/server.py | sort -u || true)
reconcile "$OP/monitoring/signals.md" "metric" $metrics

if [ "$fail" -ne 0 ]; then
  echo "docs-check: FAILED" >&2
  exit 1
fi
echo "docs-check: ok"
