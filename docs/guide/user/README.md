# Welcome

This guide is for anyone who wants to use the plugins in this marketplace inside Claude Code. It assumes you have Claude Code installed and can type a prompt; it does not assume you know how plugins are built.

<object type="image/svg+xml" data="images/plugins-overview.svg" aria-label="The seven plugins of the km-plugin-registry marketplace grouped by type: four skill and agent plugins, two mods and one hooks plugin. Each plugin links to its description." style="display: block; width: 100%; height: auto; aspect-ratio: 920 / 650;">

![The seven plugins of the km-plugin-registry marketplace grouped by type: four skill and agent plugins, two mods and one hooks plugin](images/plugins-overview.svg)

</object>

Select a plugin in the picture to open its description, or see all of them in [What is in the marketplace](plugins.md).

The marketplace is called `km-plugin-registry`. It currently holds seven plugins:

- **frontend-scaffold** builds a complete Vue 3 web application from a one-line description.
- **feature-dev-documentalist** writes a short document for each phase of a feature you are building, by looking at what changed in git.
- **gitbook-docs-validator** checks a documentation folder against a fixed three-book layout and tells you what is missing.
- **implementation-spec** writes a specification for a feature that does not exist yet, complete enough for an agent to build it without asking you more.
- **plan-progress** shows the current plan and how far Claude has got with it in a pane beside the chat.
- **session-cost** lists every model request with its tokens and cost in a pane beside the chat, with totals by model and by day.
- **memors-hooks** connects Claude to a local memors-mcp knowledge base and reminds it to search before re-fetching and to record what it learns.

## If you want to…

| If you want to… | Read |
|---|---|
| Install a plugin and try it in five minutes | [Quick start](quick-start.md) |
| Know what each plugin does before installing | [What is in the marketplace](plugins.md) |
| Know what to type for a common job | [Everyday use](everyday-use.md) |
| See whether a plugin fits your situation | [Use cases](use-cases.md) |
| Know what a plugin reads, writes and runs on its own | [Trust and privacy](trust.md) |
| Fix something that is not working | [FAQ and troubleshooting](faq.md) |
| Look up a word used in this guide | [Glossary](glossary.md) |

> **Looking for how plugins are built or published?** See the [plugin author guide](../operator/).
> **Looking for how a change is checked before it is merged?** See the [tester guide](../tester/).
