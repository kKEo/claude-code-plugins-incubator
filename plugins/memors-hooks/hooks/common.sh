#!/usr/bin/env bash
# Shared by the hook scripts (through lib.sh) and by the MCP server wrapper
# (hooks/serve). Sourced, never executed. Reads nothing from stdin.

# Resolve the memors-mcp binary: $MEMORS_BIN, PATH, then common install dirs
# (hooks may run with a thinner PATH than the user's shell).
resolve_memors() {
  local c
  for c in "${MEMORS_BIN:-}" "$(command -v memors-mcp 2>/dev/null)" \
           "$HOME/.local/bin/memors-mcp" /opt/homebrew/bin/memors-mcp /usr/local/bin/memors-mcp; do
    if [[ -n "$c" && -x "$c" ]]; then
      printf '%s' "$c"
      return 0
    fi
  done
  return 1
}

# The project marker: a file named .memors-kb whose first non-blank,
# non-comment line is the knowledge-base name. It is looked for in the given
# directory and its parents, so a project keeps one marker at its root.
MEMORS_MARKER=".memors-kb"

# find_marker <dir> — print the path of the nearest marker, or fail.
find_marker() {
  local dir="$1"
  [[ -d "$dir" ]] || return 1
  dir=$(cd "$dir" 2>/dev/null && pwd -P) || return 1
  while :; do
    if [[ -f "$dir/$MEMORS_MARKER" ]]; then
      printf '%s' "$dir/$MEMORS_MARKER"
      return 0
    fi
    [[ "$dir" == "/" || -z "$dir" ]] && return 1
    dir=$(dirname "$dir")
  done
}

# read_marker <file> — print the knowledge-base name in the marker, or fail
# when the file is empty or the name is not a plain file name.
read_marker() {
  local name
  name=$(grep -v -E '^[[:space:]]*(#|$)' "$1" 2>/dev/null | head -1 | tr -d '[:space:]\r')
  [[ -n "$name" && "$name" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || return 1
  printf '%s' "$name"
}

# resolve_kb <dir>... — set MEMORS_KB to the knowledge-base name for a
# project: the nearest marker above the first directory that has one, else
# $MEMORS_KB as given, else "default". MEMORS_KB_SOURCE says which: marker,
# env or default. Sets variables (no subshell) so callers see both.
resolve_kb() {
  local d m name
  for d in "$@"; do
    [[ -n "$d" ]] || continue
    m=$(find_marker "$d") || continue
    if name=$(read_marker "$m"); then
      MEMORS_KB=$name
      MEMORS_KB_SOURCE=marker
      return 0
    fi
    printf 'memors-hooks: ignoring %s: it must hold one knowledge-base name (letters, digits, . _ -)\n' "$m" >&2
  done
  if [[ -n "${MEMORS_KB:-}" ]]; then
    MEMORS_KB_SOURCE=env
    return 0
  fi
  MEMORS_KB=default
  MEMORS_KB_SOURCE=default
}

# option_on <KEY> <default> — whether a boolean /config option is on. Claude
# Code exports each plugin option to hooks as CLAUDE_PLUGIN_OPTION_<KEY>; the
# server wrapper gets it through .mcp.json instead. An unset or empty value
# means the manifest's default. true, 1, yes and on (any case) mean on.
option_on() {
  local var="CLAUDE_PLUGIN_OPTION_$1" v
  v="${!var:-}"
  [[ -z "$v" ]] && v="$2"
  v=$(printf '%s' "$v" | tr '[:upper:]' '[:lower:]')
  [[ "$v" == true || "$v" == 1 || "$v" == yes || "$v" == on ]]
}
