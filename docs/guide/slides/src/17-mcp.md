# MCP servers

Model Context Protocol: an open standard that gives Claude tools for **external systems**: issue trackers, databases, browsers, docs.

```bash
# remote server over HTTP
claude mcp add --transport http notion https://mcp.notion.com/mcp

# local process over stdio
claude mcp add --transport stdio airtable -- npx -y airtable-mcp-server

claude mcp list
```

- Reach for it when you keep **copying data into the chat** from another tool
- Share a server with the team: `--scope project` writes `.mcp.json`
- Tools appear as `mcp__<server>__<tool>`; `/mcp` shows status and login
- A server's output enters the context: connect only servers you trust

<small>Source: [MCP](https://code.claude.com/docs/en/mcp)</small>
