# memors-hooks

Runs the memors-mcp knowledge base alongside Claude. The plugin bundles the `memors` server, whose tools search, read and record facts in the knowledge base, and it adds five hooks. The server is off by default, so a memors server you registered yourself is not duplicated. Turn on *Start the memors MCP server* in `/config` to use the bundled one. At the start of a session it adds an index of what the knowledge base holds. Before a Bash command it can block one that changes trust or writes to the knowledge base from the command line. After a web fetch it can point at a page already stored. At the end of a turn it can remind Claude, once, to record what it found. Each of these has its own switch in `/config`, and all are on except *Prompt recall*, the hook that matches addresses to each prompt. *Index size limit* caps the session-start index (8192 bytes). The hooks never write to the knowledge base, and if `memors-mcp` or `jq` is missing they do nothing. The knowledge base is chosen per project: put its name in a `.memors-kb` file at the project root, and the server and the hooks read the same file. Without a marker `MEMORS_KB` applies, then the shared `default`.

![Workflow of memors-hooks: hooks orient the session, guard the knowledge base, point at stored pages and remind Claude to record findings](../images/workflow-memors-hooks.svg)

## What to type

With a memors server running (the plugin's own, turned on in `/config`, or one you registered), there is nothing to type. To have Claude look up something it may already know:

```
search the knowledge base for our retry policy
```

To give a project its own knowledge base, put the name in a `.memors-kb` file at the project root.

## How it works

![How memors-hooks works: four Claude Code events run the orient, guard-cli, check-known-source and nudge-remember hooks, which read the knowledge base and a session log on disk; the optional memors server reads and writes the knowledge base](../images/how-memors-hooks.svg)

The numbers match the picture.

1. **orient** runs when a session starts, and again after `/clear` and `/compact`. It adds an index of the knowledge base: titles and addresses, never passage text.
2. **guard-cli** runs before each Bash command, and denies one that writes to the knowledge base or changes trust from the command line. It is the only hook that can block.
3. **check-known-source** runs after a web fetch and points at the copy already stored. A companion, `track`, logs the fetch.
4. **nudge-remember** runs when a turn ends, and reminds Claude once when something was fetched and nothing was recorded.

## What it reads and writes

The hooks read the knowledge base and never write to it. They keep a log of fetches, empty searches and write-backs in the system's temporary folder. The `memors` server, when on, writes to the knowledge base only when Claude records or ingests something. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install memors-hooks@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
