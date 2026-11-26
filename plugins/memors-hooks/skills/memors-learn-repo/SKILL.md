---
name: memors-learn-repo
description: "Analyse the current repository and populate the memors knowledge base with what it finds: the project's documents, notes on architecture, modules, commands and conventions, and atomic facts. The analysis runs in a separate agent at a chosen effort level, and the user can add instructions that say what to concentrate on. Use when the user says: learn this repo, analyse the repository into the knowledge base, populate the knowledge base from this project, index this codebase into memors, seed memors with this repo, teach memors about this project, refresh what the knowledge base knows about this repo."
argument-hint: "[low|medium|high|xhigh|max] [what to concentrate on]"
---

# Learn the repository into the knowledge base

This skill fills the project's memors knowledge base from the repository in the working
directory. You do not analyse the repository yourself. You check that the run can work, hand it
to the `repo-learner` agent, and relay its report. The analysis reads many files, and keeping it
in a separate agent keeps those files out of this conversation.

Arguments: `$ARGUMENTS`

### Step 1: Read the arguments

The arguments are optional and come in this order:

1. **Effort.** If the first word is `low`, `medium`, `high`, `xhigh` or `max`, it is the effort
   level. `--effort <level>` or `effort=<level>` anywhere in the arguments means the same. With
   no level given, use `medium`. Never pick `max` yourself; use it only when the user wrote it.
2. **Instructions.** Everything else is the user's instructions for this run, for example
   `focus on the payment flow and skip the legacy/ folder`. Keep them word for word. They may be
   empty.

When the skill starts from a plain request rather than a slash command, take the effort and the
instructions from what the user wrote in the same way. Do not ask for either when they are
missing: the defaults are `medium` and no instructions.

| Effort | What the agent covers |
|---|---|
| `low` | The README, the manifests and the top-level layout. A quick first map. |
| `medium` | Also every documentation page, the entry points, the main files of each top-level module, and the build, test and CI setup. |
| `high` | Also each module in depth, the tests, the configuration surface and the recent git history. |
| `xhigh`, `max` | Every tracked source file is at least skimmed, with notes for each package and for the flows that cross them. |

### Step 2: Check that the run can work

Do these checks yourself; they take a few tool calls.

1. **The memors tools are there.** The run needs the memors `ingest`, `remember`, `search` and
   `read` tools (named `mcp__…memors…__ingest` and so on). If they are missing, stop and tell the
   user to turn on *Start the memors MCP server* in the plugin's `/config` settings, or to
   register their own memors server. Do not fall back to the `memors-mcp` command line: its
   writes are stored as if the human had made them, and the plugin blocks them.
2. **The repository root.** Use `git rev-parse --show-toplevel`. When the folder is not a git
   repository, use the working directory and say so in the dispatch prompt.
3. **The knowledge base.** Look for a `.memors-kb` file at the repository root or above it. When
   there is one, the run writes to the knowledge base it names. When there is none, the writes
   go to `MEMORS_KB` or to the shared `default` knowledge base, where they mix with other
   projects. In that case ask the user once whether to continue or to add a marker first, and
   show the marker's two lines from the plugin README. Never create the marker yourself.
4. **The shelf.** The namespace is the repository's name: the last part of the `origin` remote
   URL without `.git`, or the root folder's name when there is no remote. Use the user's choice
   instead when the instructions name a namespace.

### Step 3: Dispatch the agent

Start one `memors-hooks:repo-learner` agent with the Agent tool. Set the tool's `effort`
parameter to the level from step 1, so that the agent itself reasons at that level. Send this
prompt, with the values filled in:

```
REPO_ROOT: <absolute path>
NAMESPACE: <namespace>
EFFORT: <low|medium|high|xhigh|max>
IS_GIT_REPO: <yes|no>
INSTRUCTIONS:
<the user's instructions word for word, or "none">
```

Add nothing else to the prompt. In particular, do not add your own guesses about what matters
in the repository; the agent finds that out, and the user's instructions are the only steer.

Start one agent, not several, also for a large repository: parallel agents would write
overlapping notes and facts to one knowledge base. Then tell the user in one or two lines that
the analysis has started, at which effort, into which knowledge base and namespace, and that it
runs on its own while they keep working.

### Step 4: Relay the report

When the agent finishes, give the user its report, shortened to what they need:

- what was stored: documents, notes and facts, with counts and the namespace;
- what was skipped and why, including any file that looked like it held a secret;
- what the agent could not settle and left as questions;
- how to look at the result, for example `search the knowledge base for <topic>`.

Say that everything the run wrote has trust `agent`: it is the agent's reading of the
repository, not verified knowledge. Do not offer to raise the trust yourself; the human does
that with the memors `promote` dialog or from the command line.

If the agent stopped early or reported that a tool failed, say so plainly with its reason. Do
not finish the analysis yourself in this conversation; offer to run the skill again.

### Running it again

A second run on the same repository updates the first one. The agent keeps a record of the
commit it analysed, reads only what changed since then, revises its notes in place and replaces
the facts that are no longer true. To force a full pass, the user can say so in the
instructions, for example `/memors-learn-repo high start from scratch`.
