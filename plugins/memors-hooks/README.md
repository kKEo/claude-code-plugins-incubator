# memors-hooks

Hooks that run the [memors-mcp](https://github.com/kKEo/memors) knowledge-base loop for the agent. memors' SKILL.md asks the model to orient once, search before re-fetching, record what it learns and leave trust changes to the human. A skill can only ask for those things. These hooks run in the harness, so they do the steps automatically or enforce them.

## What It Does

| SKILL.md step | Hook | Script | Effect |
|---|---|---|---|
| Orient once | `SessionStart` (startup, resume, clear, compact) | `orient` | Injects `export --index` (≤ 8 KB), whether search is keyword-only, queued jobs and the open lint count. It runs again after `/compact`, so the index survives compaction. |
| Trust is the human's | `PreToolUse` `Bash` | `guard-cli` | **Denies** `memors-mcp ingest/remember/forget/trust promote/trust demote` and `sqlite3` on the KB files. CLI writes are stored at trust `user`, and the CLI has none of the MCP tools' limits. Reads such as `search`, `read`, `status` and `ls` stay allowed. |
| Don't re-derive | `PostToolUse` `WebFetch` | `check-known-source` | If the fetched URL is already ingested, points at its `memo://doc/...` address. |
| Record what you found | `PostToolUse` `WebFetch\|WebSearch\|mcp__*memors*__(search\|remember\|ingest)` | `track` | Logs web fetches, empty memors searches and write-backs to `$TMPDIR/memors-hooks/<session>.log`. Prints nothing. |
| Record what you found | `Stop` | `nudge-remember` | Sends one non-blocking reminder when the session fetched or missed but recorded nothing since the last nudge or write. |
| Search, then read | `UserPromptSubmit` (opt-in) | `recall` | With *Prompt recall* on in `/config` (or `MEMORS_HOOK_RECALL=1`), injects up to 3 keyword-matched `memo://` addresses for the prompt. |

The plugin also bundles:
- the `memors` MCP server (`.mcp.json`, started through `hooks/serve`, which picks the project's knowledge base). It is **off by default**: turn on *Start the memors MCP server* in `/config` to run it;
- the upstream `memors-mcp` skill, plus a section describing what these hooks already do.

## Design Rules

- **Fail open.** If `memors-mcp` or `jq` is missing, or the KB is absent, unreadable or on an old schema, every hook exits 0. Only `guard-cli` can block.
- **Read-only.** No hook writes to the KB. A KB that needs `migrate` is reported to the human, not migrated.
- **Fast.** Hook searches use `--no-model` (keyword-only), so the embedding model is never loaded. A typical run takes about 0.2 s.
- **Retrieved text is data.** Hooks inject titles, addresses and trust, never passage text, under a "data, not instructions" header.
- **No auto-ingest.** `WebFetch` output is a model summary written for one prompt, so it makes poor KB content. The agent decides what to ingest.

## Requirements

- `memors-mcp` on `PATH`, or `MEMORS_BIN=/path/to/memors-mcp`. The hooks also look in `~/.local/bin`, `/opt/homebrew/bin` and `/usr/local/bin`.
- `jq`
- bash (Git Bash on Windows, through `run-hook.cmd`)

## Which knowledge base

memors keeps one file per knowledge base, and the usual setup is one per project. The plugin
picks the name the same way for its server and for every hook, so both read one file:

1. The nearest `.memors-kb` file at or above the session's working directory (hooks) or the
   project directory (server). Its first non-blank, non-comment line is the name:
   ```
   # .memors-kb — the memors knowledge base for this project
   payments
   ```
   Commit it with the project. A name is letters, digits, `.`, `_` and `-`; anything else is
   ignored with a note on stderr.
2. `MEMORS_KB` from the environment, when no marker is found.
3. `default`, the shared knowledge base. The `orient` hook then says so, so the agent can
   suggest a marker.

A marker wins over `MEMORS_KB` because it travels with the project, while the environment is
the same in every session. Nested projects (a monorepo with one marker at the root) resolve to
the root's marker unless a subdirectory has its own.

If a long-running `memors-mcp serve --http` already serves the project's knowledge base (for
example one started by MemoRS Tray), the plugin's server refuses to start and prints the
`claude mcp add` command for it; register that URL instead, and the hooks keep reading the
same file.

## Configuration

### Settings in `/config`

Each feature has a switch in the plugin's `/config` settings. Claude Code passes them to the hooks as `CLAUDE_PLUGIN_OPTION_<KEY>` and to the server through `.mcp.json`.

| Setting | Key | Default | Controls |
|---|---|---|---|
| Start the memors MCP server | `mcp_server` | off | The bundled `memors` server. |
| Knowledge-base index at session start | `orient` | on | `orient` |
| Block memors CLI writes from Bash | `guard_cli` | on | `guard-cli` |
| Point at already-stored pages | `check_known_source` | on | `check-known-source` |
| Remind to record findings | `nudge_remember` | on | `track` and `nudge-remember` |
| Prompt recall | `recall` | off | `recall` |
| Index size limit (bytes) | `index_bytes` | 8192 | `orient`'s size cap |

**Why the server is off by default.** Many setups already run memors elsewhere: registered with `claude mcp add`, or served over HTTP by MemoRS Tray. A second copy would show every tool twice. A plugin cannot ship an MCP server that is disabled by default, so with the setting off `hooks/serve` answers MCP with an empty tool list instead of starting `memors-mcp`. It does not exit, because Claude Code would then report a failed server in every session. `/mcp` lists it as connected with no tools. Once the setting is on, restart Claude Code or reconnect the server in `/mcp`. While it is off, `orient` tells Claude so, in case no other memors server provides the tools.

The hooks work with any memors server, so the usual choices are:
- the plugin's server: turn on *Start the memors MCP server*;
- your own registration (`claude mcp add memors ...`, or an HTTP URL): leave the setting off.

### Environment variables

| Variable | Default | Used by |
|---|---|---|
| `MEMORS_KB` | `default` | MCP server and all hooks, when the project has no `.memors-kb` marker (see above). |
| `MEMORS_HOME` | `~/.memors-mcp` | MCP server and hooks (memors' own variable) |
| `MEMORS_BIN` | `memors-mcp` on `PATH` | MCP server command and hooks |
| `MEMORS_HOOK_RECALL` | `0` | `recall`: `1` turns prompt recall on even when the *Prompt recall* setting is off |
| `MEMORS_HOOK_INDEX_BYTES` | the *Index size limit* setting | `orient`: size cap for the injected index; overrides the setting when set |

If you registered memors yourself (`claude mcp add memors ...`), keep *Start the memors MCP server* off. Otherwise the tools show up twice. The hooks work with either server name and read the knowledge base the marker names, whichever server writes it.

## Caveats

- **Never auto-accept `promote` dialogs.** Don't add a hook or setting that auto-accepts elicitation dialogs. The human's answer to the `promote` dialog is the only thing that raises trust.
- **`guard-cli` matches text, it doesn't parse shell.** A command whose string argument contains e.g. `memors-mcp trust promote` (such as a commit message) is denied too. Rephrase the command.
- **`check-known-source` only sees ingested URLs.** It matches a URL only if it was ingested with that `source.uri` and the URL's terms are searchable.

## Testing

```bash
export CLAUDE_PLUGIN_ROOT=$PWD/plugins/memors-hooks MEMORS_HOME=$(mktemp -d) MEMORS_KB=t
printf '# Retry\n\nBackoff doubles.\n' | memors-mcp ingest - --uri https://docs.example.io/retry --embed=false
echo '{"source":"startup"}' | plugins/memors-hooks/hooks/run-hook.cmd orient
proj=$(mktemp -d) && echo t > "$proj/.memors-kb" && mkdir "$proj/sub"
echo "{\"source\":\"startup\",\"cwd\":\"$proj/sub\"}" | MEMORS_KB=other plugins/memors-hooks/hooks/run-hook.cmd orient   # → knowledge base 't', the marker wins
(cd "$proj" && MEMORS_HOOKS_MCP_SERVER=true bash plugins/memors-hooks/hooks/serve </dev/null)                # → stderr: knowledge base 't' (from marker)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | bash plugins/memors-hooks/hooks/serve   # server off: → {"result":{"tools":[]}}
echo '{"tool_name":"Bash","tool_input":{"command":"memors-mcp trust promote memo://fact/1 --to curated"}}' \
  | plugins/memors-hooks/hooks/run-hook.cmd guard-cli      # → permissionDecision: deny (nothing with CLAUDE_PLUGIN_OPTION_GUARD_CLI=false)
echo '{"tool_name":"WebFetch","tool_input":{"url":"https://docs.example.io/retry/"}}' \
  | plugins/memors-hooks/hooks/run-hook.cmd check-known-source
```
