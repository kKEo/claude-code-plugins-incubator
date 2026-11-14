# session-cost privacy policy

session-cost is a Claude Code mod that shows the tokens and cost of a session's model requests. This policy covers what it collects, where that data is kept and what it sends.

## What it collects

For each model request, it collects metadata only: token counts, model, effort, start and end time, stop reason, the names of the tools called, whether a subagent made the request, and the turn and subagent IDs Claude Code assigns. It also reads the session's running cost, its start time and the Claude Code version. The cross-session history is stored under the session's ID.

It does not read prompts, responses, tool inputs, tool results or any of your files. The one exception is its own `plugin.json`, which it reads to learn its installed version.

## Where it is kept

The data stays on your computer. It lives in the session's plugin state and the plugin's local store inside Claude Code. Per-day history is pruned after `historyDays` days (30 by default). `/session-cost reset` deletes the current session's data.

## What it sends

The only network request is the optional update check. It runs when you open the Version view (at most once a day) or press **Check now**. It is a plain GET of this plugin's published `plugin.json` from `raw.githubusercontent.com`. The request carries no session, cost, token, prompt or file data. GitHub sees what any download of a public file shows it: your IP address and the client's default headers. GitHub's own privacy statement covers that request.

No data is sent to the author or to any other third party. There is no analytics or telemetry.

## Contact

Questions go to the repository's issue tracker: https://github.com/kKEo/claude-code-plugins-incubator/issues
