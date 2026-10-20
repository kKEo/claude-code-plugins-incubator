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
| Search, then read | `UserPromptSubmit` (opt-in) | `recall` | With `MEMORS_HOOK_RECALL=1`, injects up to 3 keyword-matched `memo://` addresses for the prompt. |

The plugin also bundles:
- the `memors` MCP server (`.mcp.json`);
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

## Configuration

| Variable | Default | Used by |
|---|---|---|
| `MEMORS_KB` | `default` | MCP server and all hooks. Set it per project so the hooks read the same KB the server writes. |
| `MEMORS_HOME` | `~/.memors-mcp` | MCP server and hooks (memors' own variable) |
| `MEMORS_BIN` | `memors-mcp` on `PATH` | MCP server command and hooks |
| `MEMORS_HOOK_RECALL` | `0` | `recall`: set to `1` to enable prompt recall |
| `MEMORS_HOOK_INDEX_BYTES` | `8192` | `orient`: size cap for the injected index |

If you already registered memors yourself (`claude mcp add memors ...`), either remove that entry or delete this plugin's `.mcp.json`. Otherwise the tools show up twice. The hooks work with either server name.

## Caveats

- **Never auto-accept `promote` dialogs.** Don't add a hook or setting that auto-accepts elicitation dialogs. The human's answer to the `promote` dialog is the only thing that raises trust.
- **`guard-cli` matches text, it doesn't parse shell.** A command whose string argument contains e.g. `memors-mcp trust promote` (such as a commit message) is denied too. Rephrase the command.
- **`check-known-source` only sees ingested URLs.** It matches a URL only if it was ingested with that `source.uri` and the URL's terms are searchable.

## Testing

```bash
export CLAUDE_PLUGIN_ROOT=$PWD/plugins/memors-hooks MEMORS_HOME=$(mktemp -d) MEMORS_KB=t
printf '# Retry\n\nBackoff doubles.\n' | memors-mcp ingest - --uri https://docs.example.io/retry --embed=false
echo '{"source":"startup"}' | plugins/memors-hooks/hooks/run-hook.cmd orient
echo '{"tool_name":"Bash","tool_input":{"command":"memors-mcp trust promote memo://fact/1 --to curated"}}' \
  | plugins/memors-hooks/hooks/run-hook.cmd guard-cli      # → permissionDecision: deny
echo '{"tool_name":"WebFetch","tool_input":{"url":"https://docs.example.io/retry/"}}' \
  | plugins/memors-hooks/hooks/run-hook.cmd check-known-source
```
