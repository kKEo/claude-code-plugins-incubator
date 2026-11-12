import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Answer, CoachView, Entry, Round } from '../types'
import {
  COACH_SYSTEM,
  MAX_TRIES,
  addEntry,
  answered,
  coachPrompt,
  isCollectable,
  newEntry,
  overflow,
  parseReply,
  pickNext,
  practiceSet,
  replaceEntry,
  stamp,
  stats,
} from './corpus'

const PANE = 'prompt-coach'
const TITLE = 'Prompt coach'
const COMMAND = 'prompt-coach'
/** One store key per prompt, so two sessions adding at once never overwrite each other. */
const KEY = 'p:'
/** Prompts drawn in the list; older ones stay in the corpus and in the game. */
const DRAWN = 60
/** Prompts checked in one go; the rest wait for the next prompt or session. */
const CHECK_BATCH = 5

const NO_ROUND: Round = { id: null, isRevealed: false }

const entries = atom({ plugin: 'prompt-coach', key: 'entries' } as const, [] as Entry[], { shape: 'entries-1' })
const view = atom({ plugin: 'prompt-coach', key: 'view' } as const, 'prompts' as CoachView)
const round = atom({ plugin: 'prompt-coach', key: 'round' } as const, NO_ROUND)

type Engine = EngineInterface

let model = 'haiku'
let isNotifyOn = true
let isChecking = false
/** Serialises corpus writes so the store and the pane's state move together. */
let queue: Promise<unknown> = Promise.resolve()

function serial<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work)
  queue = run.catch(() => undefined)
  return run
}

function isEntry(x: unknown): x is Entry {
  if (typeof x !== 'object' || x === null) return false
  const e = x as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.at === 'number' &&
    typeof e.text === 'string' &&
    (e.status === 'pending' || e.status === 'ok' || e.status === 'fixed') &&
    typeof e.tries === 'number' &&
    typeof e.known === 'number' &&
    typeof e.missed === 'number'
  )
}

/** Reads the corpus every session has added to, oldest first. */
async function load($: Engine): Promise<void> {
  await serial(async () => {
    const keys = (await $.store.keys()).filter(k => k.startsWith(KEY))
    const values = await Promise.all(keys.map(k => $.store.get(k)))
    const list = values.filter(isEntry).sort((a, b) => a.at - b.at)
    await update($, entries, () => list)
  })
}

async function collect($: Engine, text: string): Promise<void> {
  const at = await $.clock.now()
  const entry = newEntry(`${at.toString(36)}-${Math.random().toString(36).slice(2, 8)}`, at, text)
  await serial(async () => {
    const list = (await read($, entries)) ?? []
    const added = addEntry(list, entry)
    if (added.length === list.length) return
    await $.store.set(KEY + entry.id, entry)
    const dropped = overflow(added)
    for (const id of dropped) await $.store.delete(KEY + id)
    await update($, entries, () => added.filter(e => !dropped.includes(e.id)))
  })
}

/** Saves a changed entry, unless the corpus was cleared meanwhile. */
async function save($: Engine, id: string, change: (entry: Entry) => Entry): Promise<Entry | null> {
  return serial(async () => {
    const list = (await read($, entries)) ?? []
    const current = list.find(e => e.id === id)
    if (current === undefined) return null
    const changed = change(current)
    await $.store.set(KEY + id, changed)
    await update($, entries, () => replaceEntry(list, changed))
    return changed
  })
}

/** Has the model proofread the prompts not checked yet, newest first. */
async function check($: Engine): Promise<void> {
  if (isChecking) return
  isChecking = true
  try {
    const list = (await read($, entries)) ?? []
    const waiting = list.filter(e => e.status === 'pending' && e.tries < MAX_TRIES).reverse().slice(0, CHECK_BATCH)
    let found = 0
    for (const entry of waiting) {
      let reply: string | null = null
      let isDown = false
      try {
        const r = await $.model.complete({
          model,
          system: COACH_SYSTEM,
          prompt: coachPrompt(entry.text),
          maxTokens: 1500,
          timeoutMs: 45_000,
        })
        if (r.isAnswered) reply = r.text
        else isDown = r.reason === 'api-error'
      } catch {
        isDown = true
      }
      const checked = reply === null ? null : parseReply(reply, entry.text)
      const saved = await save($, entry.id, current =>
        checked === null
          ? { ...current, tries: current.tries + 1 }
          : checked.status === 'ok'
            ? { ...current, status: 'ok' }
            : { ...current, status: 'fixed', corrected: checked.corrected, ...(checked.note === undefined ? {} : { note: checked.note }) },
      )
      if (saved?.status === 'fixed') found += 1
      // The provider refused or is unreachable: the rest wait for a later run.
      if (isDown) break
    }
    if (found > 0 && isNotifyOn) {
      $.ui.toast(`Prompt coach: ${found === 1 ? 'a correction for your prompt' : `${found} corrections`} · /${COMMAND}`)
    }
  } catch {
    // Checking is best effort; the prompts stay collected.
  } finally {
    isChecking = false
  }
}

async function isOpen($: Engine): Promise<boolean> {
  return (await $.ui.panes()).some(pane => pane.id === PANE)
}

async function open($: Engine): Promise<string> {
  const opened = await $.ui.open({ id: PANE, title: TITLE })
  return opened.isPlaced ? 'Prompt coach pane opened.' : `Prompt coach pane waits for a wider terminal (${opened.reason}).`
}

async function toggle($: Engine): Promise<string> {
  if (await isOpen($)) {
    await $.ui.close({ id: PANE })
    return 'Prompt coach pane closed.'
  }
  return open($)
}

/** Shows the practice tab, on a random prompt unless a card is already up. */
async function showPractice($: Engine): Promise<void> {
  const [list, current] = await Promise.all([read($, entries), read($, round)])
  const set = practiceSet(list ?? [])
  if (!set.some(e => e.id === current?.id)) {
    const first = pickNext(list ?? [], null, Math.random())
    await update($, round, () => ({ id: first?.id ?? null, isRevealed: false }))
  }
  await update($, view, () => 'practice')
}

/** Records the answer and deals the next random prompt. */
async function answer($: Engine, id: string, given: Answer): Promise<void> {
  await save($, id, entry => answered(entry, given))
  const list = (await read($, entries)) ?? []
  const following = pickNext(list, id, Math.random())
  await update($, round, () => ({ id: following?.id ?? null, isRevealed: false }))
}

async function clear($: Engine): Promise<number> {
  return serial(async () => {
    const keys = (await $.store.keys()).filter(k => k.startsWith(KEY))
    for (const k of keys) await $.store.delete(k)
    await update($, entries, () => [])
    await update($, round, () => NO_ROUND)
    return keys.length
  })
}

export const register: Register = (on, options) => {
  const isCollecting = options.collect !== false
  const autoOpen = options.autoOpen === true
  model = typeof options.model === 'string' && options.model.trim() !== '' ? options.model.trim() : 'haiku'
  isNotifyOn = options.notify !== false
  isChecking = false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Toggle the pane with your collected prompts, their corrections and the practice game',
      argumentHint: '[on|off|prompts|practice|recheck|clear]',
    })
    try {
      await load($)
      // Prompts an earlier session left unchecked (it ended, or the model was unreachable).
      if (isCollecting) $.clock.after(2000, () => void check($))
    } catch {
      // The corpus is read again when the pane opens.
    }
    if (autoOpen && e.surface !== null && e.isInteractive) void $.ui.open({ id: PANE, title: TITLE })
    return next(e)
  })

  // Every prompt the person typed; the check runs after the hook, so the turn never waits for it.
  on('prompt.submit', async ($, e, next) => {
    const ran = await next(e)
    try {
      const isTyped = e.origin.kind === 'composer' || e.origin.kind === 'bridge'
      const hasEntered = !('drop' in ran)
      if (isCollecting && isTyped && hasEntered && e.command === undefined && e.isMeta !== true && isCollectable(e.text)) {
        await collect($, e.text)
        $.clock.after(10, () => void check($))
      }
    } catch {
      // Collecting is best effort; the prompt itself is untouched.
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('command.run', { command: COMMAND }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'off' || arg === 'close' || arg === 'hide') {
      if (await isOpen($)) await $.ui.close({ id: PANE })
      return { text: 'Prompt coach pane closed.' }
    }
    if (arg === 'clear') {
      const removed = await clear($)
      return { text: `Prompt coach: removed ${removed} collected prompt${removed === 1 ? '' : 's'}.` }
    }
    if (arg === 'recheck') {
      const list = (await read($, entries)) ?? []
      for (const entry of list.filter(x => x.status === 'pending' && x.tries > 0)) {
        await save($, entry.id, current => ({ ...current, tries: 0 }))
      }
      const waiting = ((await read($, entries)) ?? []).filter(x => x.status === 'pending').length
      $.clock.after(10, () => void check($))
      return { text: `Prompt coach: checking ${waiting} prompt${waiting === 1 ? '' : 's'}.` }
    }
    if (arg === 'prompts' || arg === 'list') {
      await load($)
      await update($, view, () => 'prompts')
      return { text: await open($) }
    }
    if (arg === 'practice' || arg === 'game') {
      await load($)
      await showPractice($)
      return { text: await open($) }
    }
    if (arg === 'on' || arg === 'open' || arg === 'show') {
      await load($)
      return { text: await open($) }
    }
    if (arg !== '' && arg !== 'toggle') {
      return { text: `Unknown argument "${arg}". Use: on, off, prompts, practice, recheck or clear.` }
    }
    if (!(await isOpen($))) await load($)
    return { text: await toggle($) }
  }).catch(async () => ({ text: 'Prompt coach: the command failed; see the debug log.' }))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const [list0, v, r0] = await Promise.all([read($, entries), read($, view), read($, round)])
    const list = list0 ?? []
    const mode: CoachView = v ?? 'prompts'
    const s = stats(list)

    const tabs = (
      <Box flexDirection="row" gap={1}>
        <Button key="view:prompts" hotkey="1" variant={mode === 'prompts' ? 'primary' : 'secondary'} onPress={() => update($, view, () => 'prompts')}>
          Prompts
        </Button>
        <Button key="view:practice" hotkey="2" variant={mode === 'practice' ? 'primary' : 'secondary'} onPress={() => showPractice($)}>
          Practice
        </Button>
      </Box>
    )

    const header = (
      <Text wrap="truncate-end">
        <Text weight="bold">{s.total}</Text> prompt{s.total === 1 ? '' : 's'}
        <Text dimColor> · </Text>
        <Text color="warning">{s.fixed} corrected</Text>
        <Text dimColor> · </Text>
        <Text color="success">{s.ok} fine</Text>
        {s.pending > 0 ? <Text dimColor> · {s.pending} unchecked</Text> : null}
        {s.fixed > 0 ? <Text dimColor> · {s.known}/{s.fixed} known</Text> : null}
        {isCollecting ? null : <Text color="warning"> · collecting is off</Text>}
      </Text>
    )

    let body
    if (mode === 'prompts') {
      const shown = list.slice(-DRAWN).reverse()
      body =
        shown.length === 0 ? (
          <Text dimColor wrap="wrap">
            No prompts yet. Every prompt you type is collected here, with a corrected form when its language can be improved.
          </Text>
        ) : (
          <Box flexDirection="column" gap={1}>
            {shown.map(entry => (
              <Box key={`entry:${entry.id}`} flexDirection="column">
                <Text wrap="truncate-end">
                  <Text dimColor>{stamp(entry.at)} </Text>
                  {entry.status === 'fixed' ? (
                    <Text color="warning">✎ corrected</Text>
                  ) : entry.status === 'ok' ? (
                    <Text color="success">✓ fine</Text>
                  ) : entry.tries >= MAX_TRIES ? (
                    <Text dimColor>not checked · /{COMMAND} recheck</Text>
                  ) : (
                    <Text dimColor>… checking</Text>
                  )}
                </Text>
                <Text wrap="wrap">{entry.text}</Text>
                {entry.status === 'fixed' && entry.corrected !== undefined ? (
                  <Text wrap="wrap" color="success">→ {entry.corrected}</Text>
                ) : null}
                {entry.status === 'fixed' && entry.note !== undefined ? (
                  <Text wrap="wrap" dimColor>{entry.note}</Text>
                ) : null}
              </Box>
            ))}
            {list.length > DRAWN ? <Text dimColor>Showing the newest {DRAWN} of {list.length}.</Text> : null}
          </Box>
        )
    } else {
      const set = practiceSet(list)
      const r = r0 ?? NO_ROUND
      // A card that left the corpus, or none dealt yet: the first one stands in until a press deals at random.
      const dealt = set.find(x => x.id === r.id)
      const card = dealt ?? pickNext(list, null, 0)
      const isRevealed = dealt !== undefined && r.isRevealed
      body =
        card === null ? (
          <Text dimColor wrap="wrap">
            Nothing to practise yet. A prompt appears here once one you typed has a correction.
          </Text>
        ) : (
          <Box flexDirection="column" gap={1}>
            <Text dimColor>How should this prompt read?</Text>
            <Text wrap="wrap" weight="bold">{card.text}</Text>
            {isRevealed ? (
              <Box flexDirection="column" gap={1}>
                <Box flexDirection="column">
                  <Text dimColor>The correct form</Text>
                  <Text wrap="wrap" color="success">{card.corrected ?? ''}</Text>
                  {card.note !== undefined ? <Text wrap="wrap" dimColor>{card.note}</Text> : null}
                </Box>
                <Box flexDirection="row" gap={1}>
                  <Button key="answer:known" hotkey="k" variant="primary" autoFocus onPress={() => answer($, card.id, 'known')}>
                    I know it
                  </Button>
                  <Button key="answer:missed" hotkey="n" variant="secondary" onPress={() => answer($, card.id, 'missed')}>
                    Not yet
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box flexDirection="row">
                <Button key="reveal" hotkey="s" variant="primary" autoFocus onPress={() => update($, round, () => ({ id: card.id, isRevealed: true }))}>
                  Show the correct form
                </Button>
              </Box>
            )}
            <Text dimColor>
              Known {card.known}× · not yet {card.missed}× · from {stamp(card.at)}
            </Text>
          </Box>
        )
    }

    return (
      <Box flexDirection="column" gap={1}>
        {tabs}
        {header}
        {body}
      </Box>
    )
  })
}
