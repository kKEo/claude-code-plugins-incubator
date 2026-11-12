# prompt-coach

A Claude Code mod that turns the prompts you type into a corpus for improving your written fluency. Once the mod is installed it collects every prompt, has a small model proofread it, and keeps the original beside its corrected form. A pane beside the chat lists the prompts with their corrections and holds a practice game built from your own mistakes.

## What it does

- **Collects** each prompt you type at the prompt (or send through Remote Control), in every session and project. Slash commands, `!` shell lines, prompts under three words, and prompts that tasks, schedules or other sessions submit are skipped. A prompt typed twice is kept once; a very long one is cut at 1000 characters.
- **Corrects** each prompt in the background, after the turn has started, so your prompt is never delayed or changed. One request to the correction model (`haiku` by default) returns either "nothing to correct" or the corrected prompt with a one-line note naming the main mistakes. Code, commands, paths and identifiers are left alone. A toast tells you when a correction arrives.
- **Prompts tab** (`1`): the newest 60 prompts, newest first, each marked `✎ corrected` (with the corrected form in green and the note under it), `✓ fine` or `… checking`. The header counts the corpus: `12 prompts · 5 corrected · 7 fine · 2/5 known`.
- **Practice tab** (`2`): a random prompt of yours that needed a correction. Think how it should read, then press **Show the correct form** (`s`). The corrected prompt and the note appear, and you answer **I know it** (`k`) or **Not yet** (`n`); the next prompt follows. A prompt you answered "I know it" comes up four times less often than the others, and the same prompt is never dealt twice in a row.

## Command

```
/prompt-coach                 toggle the pane
/prompt-coach on|off          open or close it explicitly
/prompt-coach prompts         open it on the list of prompts
/prompt-coach practice        open it on the practice game
/prompt-coach recheck         check again the prompts whose check failed
/prompt-coach clear           remove every collected prompt
```

The hotkeys (`1`, `2`, `s`, `k`, `n`) work while the pane holds the keyboard: click it, or press ctrl+x tab.

## Settings

These appear in `/config` under the plugin and are stored in `pluginConfigs["prompt-coach"].options`:

| Field | Default | Meaning |
|---|---|---|
| `collect` | `true` | Save every prompt you type and have its language checked. Off, the corpus and the game stay as they are. |
| `model` | `haiku` | The model alias or id that proofreads each prompt. |
| `notify` | `true` | Show a toast when a prompt you typed has a correction. |
| `autoOpen` | `false` | Open the pane by itself when a session starts. |

## What is stored and sent

The corpus lives in the plugin's own store on your machine, one record per prompt, shared by all your sessions; nothing is written into your project. At most 400 prompts are kept: past that the oldest are dropped, the ones with nothing to correct first. Each collected prompt is sent once to the correction model through the session's own API client, the same provider your conversation already goes to, and costs one small request. Do not type secrets into prompts you would not want kept; `/prompt-coach clear` removes everything.

A check that fails (the model is unreachable or answers something unreadable) is tried again with the next prompt and at the next session start, three times in all; after that the prompt shows `not checked` until `/prompt-coach recheck`.

## Development

```
claude plugin validate plugins/prompt-coach
claude plugin test plugins/prompt-coach
```

`hooks/corpus.ts` holds the pure logic (what is collected, reading the model's reply, the weighted random pick); `hooks/register.tsx` holds the hooks and the pane.
