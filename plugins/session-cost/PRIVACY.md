# session-cost privacy policy

session-cost is a Claude Code mod that shows the tokens and cost of a session's model requests. This policy covers what it collects, where that data is kept and what it sends.

## What it collects

For each model request, it collects metadata only: token counts, model, effort, start and end time, stop reason, the names of the tools called, whether a subagent made the request, and the turn and subagent IDs Claude Code assigns. It also reads the session's running cost and its start time. The cross-session history is stored under the session's ID.

To name each session in its history, it keeps the session's title and the first prompt you send, cut to 60 characters. The title comes from the session's transcript: the mod reads the transcript's newest part and keeps only the title rows (`/rename` and the title Claude Code generates), skipping every other row unparsed.

It does not read responses, tool inputs, tool results or any other of your files. The one other exception is its own `plugin.json`, which it reads to show its installed version in the pane.

## Where it is kept

The data stays on your computer. It lives in the session's plugin state and the plugin's local store inside Claude Code. Per-day history is pruned after `historyDays` days (30 by default). `/session-cost reset` deletes the current session's saved history entry, name included.

## What it sends

Nothing. The mod makes no network requests of any kind.

No data is sent to the author or to any other third party. There is no analytics or telemetry.

## Contact

Questions go to the repository's issue tracker: https://github.com/kKEo/claude-code-plugins-incubator/issues
