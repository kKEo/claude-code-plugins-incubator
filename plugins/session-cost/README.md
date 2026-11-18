# session-cost

A Claude Code mod that records every model request the session sends and shows its tokens and cost in a pane beside the chat. It collects data the whole time, whether the pane is open or closed.

## What it shows

- **Header**: the session's cost as `/cost` reports it, the price-table estimate, the request count, token totals (input, output, cache read, cache write), the cache hit rate, requests by kind (main, subagent, compaction) and the installed version (`v<version>`, dim, from this copy's `plugin.json`). The header is the same on every view.
- **Requests view** (`r`): one entry per request, newest first; the newest 300 are drawn and the totals count all. It shows the time, model, the effort the request asked for (dim, after the model, e.g. `opus-5-5 high`; absent for models without effort and for compactions), `main` / `sub:<agent>` / `compact`, duration written flush right on a 7-cell bar with a background track, filled in proportion to the slowest request drawn (the slowest one is highlighted), stop reason (a request that called tools shows them instead of `tool_use`, e.g. `→ Read ×3, Bash`; MCP tools by their short name), the four token counts (`cr` in green and `cw` in red, each in five steps from light to vivid by its share of the request's prompt tokens; a zero count is dim), and two costs: the request's share of the `/cost` ledger and the estimate (`$0.020 / est $0.029`).
- **Models view** (`m`): requests, tokens, cache hit rate and both costs per model.
- **History view** (`h`): this session, today, the last 7 days and the last `historyDays` days, plus the 10 most recent sessions. Each recent session shows its time, cost, requests, short id and name: its `/rename` title, else the title Claude Code generated for it, else its first prompt (on one line, cut to 60 characters, and cut further to fit the row). A session with none of these, or saved before 0.5.0, shows its id alone. The windows are calendar days and count only the part of each session spent in them. Each recent session, and this session once it has a request, has a `·` mark: press one to mark it **A**, then another to mark it **B** and open the Compare view.
- **Compare view** (`c`): two sessions side by side, A the baseline, `—` until both are picked. Every metric row shows A, B, B−A and %: green when B is better (cheaper, faster, fewer tokens), red when worse; the cache hit rate is the other way round (higher is green, its change in percentage points). The metrics: `/cost` and the estimate, requests, the four token counts, the cache hit rate, wall-clock time (first request's start to last one's end) and summed request time; then requests, tokens and cost by kind (main, sub, compact), by model, and by subagent type (`sub:Explore`, `sub:Plan`, …). `swap` (`s`) flips A and B. A session saved before 0.6.0 compares on its totals; its wall-clock time, request time and breakdowns show `n/a` with a dim note. Compare whole sessions: for clean results, run each variant in a fresh session.
- **Days view** (`d`): one row per day with spend in the last `historyDays` days, newest first: this session's cost and requests beside the cost of all sessions and how many had spend that day. A session open across several days says how many it spans.
- In the Requests view, a dim `── Sat 07 Nov ──` row marks where the day changes.
- A status-line entry under the prompt: `$0.544 · 3 req · 130k tok`.
- A one-line chip above the prompt (`$0.544 · 3 req · 130k tok  usage`). Its button toggles the pane and carries the keyboard shortcut. While you collapse the band, the mod skips the cost text and keeps only the button, so the shortcut still works.

### How cost is counted

Claude Code reports dollars only as the running session total (the `/cost` ledger). When a request's response ends and no other request is still running, the mod reads that total. The increase since the last reading becomes that request's cost, so the ledger column always adds up to `/cost`. When requests overlap, as parallel subagents do, the increase is split between them by estimated cost and marked `~`. Spend from before the mod loaded, or spend the engine makes outside model requests (title generation, classifiers), shows in the header as `unattributed`.

The **estimate** prices the token counts with a built-in table of Anthropic first-party list prices (`hooks/pricing.ts`). It cannot see fast mode, partner pricing (Bedrock, Vertex), Haiku 5.5's higher rate for prompts over 100K tokens ($0.50 / $2.50 per million instead of $0.10 / $0.50), or prices that changed after the table was written. An unknown model shows `?`.

### What it fetches and runs

- **Network**: none. The mod fetches nothing and sends nothing; it makes no network calls of any kind.
- **Reads from the conversation**: its `turn.step` hook passes every model request through unchanged and, after the response, records only metadata: the token counts, model, effort, start and end time, stop reason, the names of the tools called, and whether a subagent made it. It does not read responses, tool inputs or tool results. Its `prompt.submit` hook passes every prompt through unchanged and keeps the first one you send (typed, from a phone or from the SDK; not a slash command or a peer's message) as the session's name, on one line and cut to 60 characters. This data stays in the session's plugin state and the plugin's local store.
- **Reads from disk**: its own `.claude-plugin/plugin.json` (under the plugin's install folder), to show the installed version in the pane's header, and the session's transcript, for the session's title only. At the end of each turn it reads what the transcript gained since the last read (at most its last 1 MiB) and keeps only the `custom-title` (`/rename`) and `ai-title` rows' text; every other row is skipped unparsed.
- **Reads about subagents**: its `agent.spawn` hook passes every subagent spawn through unchanged and keeps only the agent's id, its type (`Explore`, `Plan`, …) and the id of the agent that spawned it; for a subagent it did not see start, it looks the type up in the session's agent list. It does not read the subagent's prompt or description.
- **Runs**: nothing. The mod starts no processes, runs no shell commands, calls no tools, agents or models, and hooks no tool calls.
- **Its `command.run` hook** answers only its own `/session-cost` slash command. It reads the argument against a fixed list (`on`, `off`, `requests`, `models`, `history`, `days`, `compare`, `reset`, `toggle`), opens, closes or switches the pane or clears the session's data, and returns a one-line reply. `compare A B` looks the two words up among the saved sessions and this one, and opens the Compare view on them. Any other argument gets an "Unknown argument" reply and does nothing.

### How days are counted

A request counts on the local calendar day its response ended, so one session can spread over several days. Ledger shares follow their request's day; `/cost` growth read while no request was waiting counts on the day it was read. Spend from before the mod loaded is in no day. A session that was already running when this version loaded has its days rebuilt from its kept rows, with anything past the 1000-row cap on the earliest day. Sessions saved by an older version count whole on the day of their last request.

## Privacy

The mod keeps its data on your computer and sends none of it anywhere; see [What it fetches and runs](#what-it-fetches-and-runs) and the full [privacy policy](PRIVACY.md).

## Command

```
/session-cost                 toggle the pane
/session-cost on|off          open or close it explicitly
/session-cost requests|models|history|days|compare   open it on that view
/session-cost compare <A> <B> compare two sessions, each named by its id, an id prefix or its name
                              (a unique part of it is enough; "quote" a name with spaces)
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

The chord works while the chip is on (`band` on), even with the band collapsed, and no dialog is up. If that action already does something in your setup, pick another in `/config` and bind that one instead.

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
- Each saved session also keeps its name (title or first prompt, up to 60 characters). Sessions saved before 0.5.0 have none.
- Each saved session also keeps a rollup for comparing it later: its first-request start and last-request end, summed request time, and requests, tokens, estimate and ledger cost by kind, by model and per subagent (keyed by the subagent's id, with its type and the agent that spawned it). It holds no per-request rows: about 200 bytes per model and per subagent. It is pruned with the session's entry. A session whose kept rows no longer add up to its totals (one already running when 0.6.0 loaded, with requests past the 1000-row cap) saves no rollup and compares on totals, like sessions saved before 0.6.0.
- `/clear` saves the ending session's totals and name to history and starts the list over; the next conversation is named by its own title or first prompt.
- `/session-cost reset` deletes the session's saved entry. From then on its history counts only spend since the reset, while the header, chip and status line keep showing the full `/cost` total. The header lists the pre-reset part as `unattributed`.

## Install

At the prompt of a terminal session:

```
/plugin marketplace add kKEo/claude-code-plugins-incubator
/plugin install session-cost@km-plugin-registry
```

The mod does not check for updates itself. To update:

```
/plugin marketplace update km-plugin-registry
/plugin update session-cost@km-plugin-registry
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
- `hooks/version.ts`: reads the `version` out of a `plugin.json`.
- `hooks/names.ts`: reads titles out of transcript rows and picks a session's name.
- `hooks/rollup.ts`: the per-session rollup (by kind, model and subagent) kept for comparing.
- `hooks/compare.ts`: the Compare view's metrics and deltas, and finding a session by id or name.
- `hooks/format.ts`: number, dollar, time, model-name and one-line text formatting.
- `types/index.d.ts`: the state contract (`requests`, `totals`, `ledger`, `view`, `days`, `names`, `rollup`, `compare`).
- `hooks/*.test.ts(x)`: run with `claude plugin test plugins/session-cost`.
- `PRIVACY.md`: the privacy policy (`privacyPolicyUrl` in `plugin.json`).
