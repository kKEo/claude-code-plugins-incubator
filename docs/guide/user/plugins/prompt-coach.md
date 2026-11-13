# prompt-coach

Builds a corpus for improving your written fluency out of the prompts you type. Once installed, the mod collects every prompt you type, in every session, and has a small model (`haiku` by default) proofread it in the background, so the prompt itself is never delayed or changed. A pane beside the chat has two tabs. **Prompts** lists what was collected, newest first, each marked as fine or shown with its corrected form and a one-line note on the main mistakes. **Practice** is a game: it shows a random prompt of yours that needed a correction, you think how it should read and press *Show the correct form*, then answer *I know it* or *Not yet*, and the next prompt appears. Prompts you do not know yet come up more often.

![Workflow of prompt-coach: the mod collects each prompt, a small model checks it, the pane shows the correction and you practise from your mistakes](../images/workflow-prompt-coach.svg)

## What to type

There is nothing to type to collect prompts: it happens as you work. To look at the corrections or to practise:

```
/prompt-coach
/prompt-coach prompts
/prompt-coach practice
/prompt-coach clear
```

`clear` removes every collected prompt. `/prompt-coach recheck` checks again the prompts whose check failed.

## How it works

![How prompt-coach works: you type a prompt, the mod collects it and asks a correction model to proofread it in the background, keeps the result in the plugin store, shows a toast and fills the Prompts and Practice tabs](../images/how-prompt-coach.svg)

The numbers match the picture.

1. **Collect.** The mod saves each prompt you type. Slash commands, `!` lines and prompts under three words are skipped.
2. **Ask for a check,** in the background, after the turn has started, so your prompt is never delayed or changed.
3. **Proofread.** The correction model (`haiku` by default) answers "nothing to correct", or the corrected prompt with a one-line note.
4. **Keep the result** in the plugin's store: the original beside its corrected form. At most 400 prompts are kept.
5. **Toast.** A short notice tells you when a correction arrives. The Prompts and Practice tabs show the rest.

## Details

`/prompt-coach` toggles the pane (`on` and `off` do so explicitly), `/prompt-coach prompts` or `practice` opens it on that tab, `/prompt-coach recheck` checks again the prompts whose check failed, and `/prompt-coach clear` removes every collected prompt. Four switches in `/config` change the mod: *Collect prompts* (on by default), *Correction model* (`haiku`), *Toast on a correction* (on) and *Open pane at start* (off). Like plan-progress and session-cost, this is a *mod*.

## What it reads and writes

It keeps the prompts you typed, with their corrections and your practice answers, in the plugin's store, and sends each prompt once to the correction model through the session's own connection. Nothing is written into your project. [Trust and privacy](../trust.md) has the full account.

## Install

```
/plugin install prompt-coach@km-plugin-registry
```

The marketplace has to be added first; see the [Quick start](../quick-start.md).
