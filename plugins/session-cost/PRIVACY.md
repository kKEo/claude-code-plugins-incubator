# session-cost privacy policy

session-cost is a Claude Code mod that shows the tokens and cost of a session's model requests. This policy covers what it collects, where that data is kept and what it sends.

## What it collects

For each model request, it collects metadata only: token counts, model, effort, start and end time, stop reason, the names of the tools called, whether a subagent made the request, and the turn and subagent IDs Claude Code assigns. It also reads the session's running cost and its start time. The cross-session history is stored under the session's ID.

It does not read prompts, responses, tool inputs, tool results or any of your files. The one exception is its own `plugin.json`, which it reads to show its installed version in the pane.

With the `cacheTtlSplit` setting on (it is off by default), it also reads the session's transcript files that Claude Code keeps under `~/.claude/projects/`. Those files hold the conversation, but the mod takes only the token counts of each response from them (how many cache-write tokens used the 1-hour and the 5-minute lifetime). It keeps only those counts and nothing else from the files.

## Where it is kept

The data stays on your computer. It lives in the session's plugin state and the plugin's local store inside Claude Code. Per-day history is pruned after `historyDays` days (30 by default). `/session-cost reset` deletes the current session's data.

## What it sends

Nothing. The mod makes no network requests of any kind.

No data is sent to the author or to any other third party. There is no analytics or telemetry.

## Contact

Questions go to the repository's issue tracker: https://github.com/kKEo/claude-code-plugins-incubator/issues
