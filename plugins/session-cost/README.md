# session-cost

A Claude Code mod that records every model request the session sends and shows its tokens and cost in a pane beside the chat. It collects data the whole time, whether the pane is open or closed.

## What it shows

- **Header**: the session's cost as `/cost` reports it, the price-table estimate, the request count, token totals (input, output, cache read, cache write), the cache hit rate and requests by kind (main, subagent, compaction).
- **Requests view** (`r`): one entry per request, newest first. It shows the time, model, `main` / `sub:<agent>` / `compact`, duration, stop reason, the four token counts, and two costs: the request's share of the `/cost` ledger and the estimate (`$0.020 / est $0.029`).
- **Models view** (`m`): requests, tokens, cache hit rate and both costs per model.
- **History view** (`h`): this session, today, the last 7 days and the last `historyDays` days, plus the 10 most recent sessions.
- A status-line entry under the prompt: `$0.544 · 3 req · 130k tok`.
- A one-line chip above the prompt (`$0.544 · 3 req · 130k tok  usage`). Its button toggles the pane and carries the keyboard shortcut.

### How cost is counted

Claude Code reports dollars only as the running session total (the `/cost` ledger). When a request's response ends and no other request is still running, the mod reads that total. The increase since the last reading becomes that request's cost, so the ledger column always adds up to `/cost`. When requests overlap, as parallel subagents do, the increase is split between them by estimated cost and marked `~`. Spend from before the mod loaded, or spend the engine makes outside model requests (title generation, classifiers), shows in the header as `unattributed`.

The **estimate** prices the token counts with a built-in table of Anthropic first-party list prices (`hooks/pricing.ts`). It cannot see fast mode, partner pricing (Bedrock, Vertex) or prices that changed after the table was written. An unknown model shows `?`.

## Command

```
/session-cost                 toggle the pane
/session-cost on|off          open or close it explicitly
/session-cost requests|models|history   open it on that view
/session-cost reset           clear this session's request list and totals
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
| `historyDays` | `30` | How many days of per-session totals to keep. |

## Data

- The request list (the newest 1000) and the running totals live in the session's plugin state, so they survive `/reload-plugins` and a change of settings. Totals keep counting past 1000 requests.
- Per-session totals are kept across sessions in the plugin's store and pruned after `historyDays`.
- `/clear` saves the ending session's totals to history and starts the list over.

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
- `hooks/pricing.ts`: the price table and the estimate.
- `hooks/format.ts`: number, dollar, time and model-name formatting.
- `types/index.d.ts`: the state contract (`requests`, `totals`, `ledger`, `view`).
- `hooks/*.test.ts(x)`: run with `claude plugin test plugins/session-cost`.
