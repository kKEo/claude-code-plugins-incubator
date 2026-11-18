# Drawing in the interface

This page shows where a mod can draw, how a drawing is written, and how it stays up to date. It is the chapter to read before you build a pane.

## Six sites

![Where a mod draws in the interface. One: a pane beside the chat, opened with $.ui.open and drawn by a ui.render hook. Two: a band row above the prompt. Three: a status line under the prompt, set with $.ui.status. Four: a toast from $.ui.toast. Five: a tool call's row in the transcript. Six: a slash command registered with $.command.register](../images/interface-sites.svg)

| Site | How a mod reaches it | Good for |
|---|---|---|
| Pane | `$.ui.open({ id, title })`, then a `ui.render` hook on `{ component: 'Pane', requestId: id }` | Anything with more than one line that should stay in view |
| Band | A `ui.render` hook on `{ component: 'AbovePrompt' }` | One row of context with a button or two |
| Status line | `$.ui.status(text)` from any hook; `undefined` clears it | One short fact that is always true |
| Toast | `$.ui.toast(text)` from any hook | Something that just happened |
| Transcript row | A `ui.render` hook on `{ component: 'ToolUse' }`, with `await next(e)` in its tree | A chart or a note under one tool call |
| Slash command | `$.command.register({ name, description })` in `session.start`, and a `command.run` hook | The user's way to open, close or switch what you draw |

Two calls need no hook at all: `$.ui.status` and `$.ui.toast` work from anywhere. Start with those. A mod that only pins a status line is about ten lines long; [Your first mod](first-mod.md) is one.

Other sites exist for narrower jobs: `UserMessage` and `AssistantMessage` rows, `CommandOutput` for a command's own output row, `ContextMenu` for the desktop app's right-click menu, and `AskUserQuestion` for the question dialog.

## A drawing is a tree

A `ui.render` hook returns a tree of elements, written as JSX. The elements are not globals. They come from the table of the surface that is drawing.

```tsx
on('ui.render', { component: 'Pane', requestId: 'notes' }, async ($, e) => {
  const { Box, Text, Button } = $.ui.resolve(e)

  return (
    <Box flexDirection="column">
      <Text bold>Notes</Text>
      <Text dimColor>Nothing yet.</Text>
      <Button key="add" label="Add" onPress={() => $.ui.toast('added')} />
    </Box>
  )
})
```

| Element | Draws |
|---|---|
| `Box` | A flex container: direction, margins, border, background |
| `Text` | Text, with `bold`, `dimColor`, `color` |
| `Button` | A pressable label. Give each one in a list its own `key` |
| `Input`, `Select` | A text field and a picker |
| `Markdown` | Model-style text: headings, lists, tables, code fences |
| `Code` | Source code or a unified diff |
| `Progress` | A labelled bar, on every surface |
| `Link` | An `https:` address the surface opens |

The file must be `.tsx` for JSX to compile. A hook that draws nothing for now returns `next(e)`, which leaves the site to the engine.

## Four surfaces

The same mod may be drawn by four different surfaces, and `e.surface` says which: `terminal`, `desktop`, `vscode` or `mobile`.

| What differs | Detail |
|---|---|
| The element table | `terminal` alone has `Raster` and `Image`; it has no `Svg`. `mobile` and `vscode` have no `Client`. A mobile app may draw nothing for an `Input` |
| The size | `e.viewport` gives `columns` and `rows` in character cells. A pane or a band should size itself to `e.props.bodyColumns` |
| The placement | A pane reads `e.props.placement`: `dock`, `inline`, or `widget` on the desktop app |

Write one tree from the elements every surface has, `Box`, `Text`, `Button`, `Progress`, and it works everywhere. Loop a test over the surfaces to prove it; see [Your first mod](first-mod.md).

## How a drawing stays current

A render hook does not poll and is not called on a timer. It runs again when something it read has changed.

![How a write to session state redraws the interface. One: something happens, a tool call, a timer or a button press. Two: a handler writes with update. Three: the host stores the value under a new version and looks up the sites that read it. Four: those sites draw again and their read subscribes them once more. A button in the new drawing can start the loop again](../images/state-loop.svg)

```tsx
import { atom, read, update } from 'claude-code'

const calls = atom({ plugin: 'tool-calls', key: 'calls' } as const, [])

// Somewhere an event writes:
on('tool.call', async ($, e, next) => {
  await update($, calls, list => [...list, e.tool].slice(-200))
  return next(e)
})

// The pane reads while drawing, which subscribes it:
on('ui.render', { component: 'Pane', requestId: 'tool-calls' }, async ($, e) => {
  const { Box, Text } = $.ui.resolve(e)
  const list = await read($, calls)
  return <Box flexDirection="column">{list.map(tool => <Text>{tool}</Text>)}</Box>
})
```

Three rules follow from the picture.

1. **Read state while drawing.** The read is the subscription. A value kept in a module variable redraws nothing when it changes.
2. **Never write state while drawing.** `$.state.set` inside a render hook is denied. Write from an event hook or from a handler such as `onPress`.
3. **Use `update`, not a captured value.** `onPress: () => update($, count, n => n + 1)` reads, applies and writes in one step, so two fast presses both count.

For something that is not state, such as a clock, call `$.ui.invalidate` to ask for a redraw.

## Opening a pane

```ts
on('session.start', async ($, e, next) => {
  await $.command.register({ name: 'notes', description: 'Show the notes pane' })
  return next(e)
})

on('command.run', { command: 'notes' }, async $ => {
  await $.ui.open({ id: 'notes', title: 'Notes' })
  return { text: 'Notes pane opened.' }
})
```

- One pane per `id`. Opening an open id changes its title; it never makes a second pane.
- `$.ui.open` resolves `{ isPlaced }`: whether a surface is drawing the pane right now.
- A pane the user opened, with a command, is seated at any width. A pane a mod opens by itself at session start is seated only in a wide terminal, from 144 columns (110 in some layouts; the documentation of `$.ui.open` has the rule), and waits below that. Give every pane a command so the user can ask for it.
- `focus`, `closeOnEscape` and `holdToasts` together make a pane behave as a dialog. Leave `holdToasts` off a pane that stays open, because it holds back every other mod's toasts.

## When a tree is wrong

A tree is validated before it is drawn. An element the surface does not have, a prop it does not take, or a child where none may go fails the hook, and it is skipped by itself: every other mod's drawing still appears, and the engine draws its own content at that site. While you develop from a watched folder the transcript shows one dim line with the reason:

```
notes: ui.render hook skipped: returned the wrong shape (a tree Pane refuses: …)
```

That reason and the element's props type in the declaration file are the two things to read. [Behaviour and limitations](limits.md) lists the size limits a tree is held to.

Next: [State, lifecycle and reloads](state-lifecycle.md).
