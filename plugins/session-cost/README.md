# session-cost

A Claude Code mod that records every model request the session sends and shows its tokens and cost in a pane beside the chat. It collects data the whole time, whether the pane is open or closed.

## What it shows

- **Header**: the session's cost as `/cost` reports it, the price-table estimate, the request count, token totals (input, output, cache read, cache write), the cache hit rate and requests by kind (main, subagent, compaction).
- **Requests view** (`r`): one entry per request, newest first; the newest 300 are drawn and the totals count all. It shows the time, model, the effort the request asked for (dim, after the model, e.g. `opus-5-5 high`; absent for models without effort and for compactions), `main` / `sub:<agent>` / `compact`, duration written flush right on a 7-cell bar with a background track, filled in proportion to the slowest request drawn (the slowest one is highlighted), stop reason (a request that called tools shows them instead of `tool_use`, e.g. `→ Read ×3, Bash`; MCP tools by their short name), the four token counts (`cr` in green and `cw` in red, each in five steps from light to vivid by its share of the request's prompt tokens; a zero count is dim), and two costs: the request's share of the `/cost` ledger and the estimate (`$0.020 / est $0.029`).
- **Models view** (`m`): requests, tokens, cache hit rate and both costs per model.
- **History view** (`h`): this session, today, the last 7 days and the last `historyDays` days, plus the 10 most recent sessions. The windows are calendar days and count only the part of each session spent in them.
- **Days view** (`d`): one row per day with spend in the last `historyDays` days, newest first: this session's cost and requests beside the cost of all sessions and how many had spend that day. A session open across several days says how many it spans.
- **Version view** (`v`): the installed version (from this copy's `plugin.json`), the published version, the Claude Code version, and whether an update is available. `u` or **Check now** checks again.
- In the Requests view, a dim `── Sat 07 Nov ──` row marks where the day changes.
- A status-line entry under the prompt: `$0.544 · 3 req · 130k tok`.
- A one-line chip above the prompt (`$0.544 · 3 req · 130k tok  usage`). Its button toggles the pane and carries the keyboard shortcut.

### How cost is counted

Claude Code reports dollars only as the running session total (the `/cost` ledger). When a request's response ends and no other request is still running, the mod reads that total. The increase since the last reading becomes that request's cost, so the ledger column always adds up to `/cost`. When requests overlap, as parallel subagents do, the increase is split between them by estimated cost and marked `~`. Spend from before the mod loaded, or spend the engine makes outside model requests (title generation, classifiers), shows in the header as `unattributed`.

The **estimate** prices the token counts with a built-in table of Anthropic first-party list prices (`hooks/pricing.ts`). It cannot see fast mode, partner pricing (Bedrock, Vertex), Haiku 5.5's higher rate for prompts over 100K tokens ($0.50 / $2.50 per million instead of $0.10 / $0.50), or prices that changed after the table was written. An unknown model shows `?`.

### How the update check works

The check reads the published `plugin.json` from this repository's `master` branch on `raw.githubusercontent.com` and compares its `version` with the installed one, number by number. It runs only when you open the Version view (at most once a day) or press **Check now**; nothing is fetched otherwise, and nothing about the session is sent. GitHub caches the file for a few minutes, so a release can take that long to show. A copy loaded with `--plugin-dir` that is newer than the published one says so. To update:

```
/plugin marketplace update km-plugin-registry
/plugin update session-cost@km-plugin-registry
```

### How days are counted

A request counts on the local calendar day its response ended, so one session can spread over several days. Ledger shares follow their request's day; `/cost` growth read while no request was waiting counts on the day it was read. Spend from before the mod loaded is in no day. A session that was already running when this version loaded has its days rebuilt from its kept rows, with anything past the 1000-row cap on the earliest day. Sessions saved by an older version count whole on the day of their last request.

## Command

```
/session-cost                 toggle the pane
/session-cost on|off          open or close it explicitly
/session-cost requests|models|history|days|version   open it on that view
/session-cost reset           clear this session's requests, totals, day split and saved history entry
```

The pane's own close mark, or ctrl+x x while the pane holds the keyboard, also closes it.

## Keyboard toggle

Mods can't register a global shortcut, and `keybindings.json` can't run a slash command. Instead, the chip's button is tied to an engine keybinding action that has no default key (`toggleAction`, default `app:toggleReplTab`). Bind a chord to that action in `~/.claude/keybindings.json`:

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    { "context": "Global", "bindings": { "ctrl+x c": "app:toggleReplTab" } }
  ]
}
```

The chord works while the chip is shown (`band` on) and no dialog is up. If that action already does something in your setup, pick another in `/config` and bind that one instead.

## Settings

These appear in `/config` under the plugin and are stored in `pluginConfigs["session-cost"].options`:

| Field | Default | Meaning |
|---|---|---|
| `autoOpen` | `false` | Open the pane by itself when a session starts. |
| `statusLine` | `true` | Show the `$… · n req · … tok` summary under the prompt. |
| `band` | `true` | Show the cost chip above the prompt. The keyboard toggle needs it. |
| `toggleAction` | `app:toggleReplTab` | The engine action the chip's button borrows for the keyboard toggle. |
| `historyDays` | `30` | How many days of per-session, per-day totals to keep. |

## Data

- The request list (the newest 1000), the running totals and the day split live in the session's plugin state, so they survive `/reload-plugins` and a change of settings. Totals keep counting past 1000 requests.
- Per-session totals, split by day, are kept across sessions in the plugin's store. Days older than `historyDays` are pruned, and a session is removed once it has none left.
- `/clear` saves the ending session's totals to history and starts the list over.
- `/session-cost reset` deletes the session's saved entry. From then on its history counts only spend since the reset, while the header, chip and status line keep showing the full `/cost` total. The header lists the pre-reset part as `unattributed`.

## Install

At the prompt of a terminal session:

```
/plugin marketplace add kKEo/claude-code-plugins-incubator
/plugin install session-cost@km-plugin-registry
```

For development, start a session with the folder loaded and hot-reloaded:

```
claude --plugin-dir plugins/session-cost
```

## Files

- `hooks/register.tsx`: the hooks module (request collection, ledger reads, history, command, chip and pane).
- `hooks/ledger.ts`: totals, the row cap and the ledger-delta split.
- `hooks/days.ts`: day keys, the per-day buckets, backfill and history windows.
- `hooks/pricing.ts`: the price table and the estimate.
- `hooks/version.ts`: the published manifest's URL, version comparison and the check's age.
- `hooks/format.ts`: number, dollar, time and model-name formatting.
- `types/index.d.ts`: the state contract (`requests`, `totals`, `ledger`, `view`, `days`, `update`).
- `hooks/*.test.ts(x)`: run with `claude plugin test plugins/session-cost`.
