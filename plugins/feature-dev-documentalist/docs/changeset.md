---
theme: seriph
background: https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600
title: feature-dev-documentalist — What Changed & Why
info: |
  ## Changeset walk-through
  A beginner-friendly explanation of the four near-term improvements shipped to
  feature-dev-documentalist — what each one fixes, why it mattered, and the outcome.
class: text-center
transition: slide-left
mdc: true
---

# What Changed & Why

The four fixes we just shipped to **feature-dev-documentalist**

<div class="pt-8 opacity-80 text-sm">
Beginner-friendly · problem → change → outcome, for every fix
</div>

<div class="abs-br m-6 text-xs opacity-60">
Companion to <code>slides.md</code> · improvement branch
</div>

<!--
This deck is the "release notes, explained." The critique deck (slides.md) said what
was wrong; this one shows what we did about it and why it matters, assuming no prior
context.
-->

---
layout: statement
---

# Where we started

<div class="text-xl leading-relaxed pt-4 text-left max-w-3xl mx-auto">

A review of the plugin (see <code>slides.md</code>) found **four high-value weaknesses**.
This branch fixes all four.

<div class="pt-4 opacity-80 text-base">
No jargon assumed — each fix is explained from "what is the problem, in plain English"
through to "here's the proof it works."
</div>

</div>

---
layout: default
---

# The four changes at a glance

<div class="grid grid-cols-2 gap-4 pt-4">

<div v-click class="p-4 border-l-4 border-teal-400 rounded bg-teal-400/5">

### 1 · See the whole feature 🔍
Stop looking only at *uncommitted* changes. Look at everything on the branch.

</div>

<div v-click class="p-4 border-l-4 border-teal-400 rounded bg-teal-400/5">

### 2 · Learn the real "why" 📖
Read commit messages and design notes instead of guessing intent from code.

</div>

<div v-click class="p-4 border-l-4 border-teal-400 rounded bg-teal-400/5">

### 3 · Right model for the job 🧠
Use a smarter model where judgment is needed; keep the fast one for simple extraction.

</div>

<div v-click class="p-4 border-l-4 border-teal-400 rounded bg-teal-400/5">

### 4 · Keep nudging usefully 🔔
Remind about the *specific* missing document, not just "you have no docs folder."

</div>

</div>

<div v-click class="mt-6 text-sm opacity-80">

Everything is a change to plain-text files — agent prompts, a skill, one shell script, and the README. No new dependencies.

</div>

---
layout: section
---

# Change 1 — See the whole feature

Diff against the branch base, not just uncommitted work

---
layout: default
---

# Change 1 · The problem, in plain English

The tool figures out "which phase am I in?" by looking at **what files changed.**
It used to ask git this question:

```bash
git diff HEAD    # "what changed since my LAST commit?"
```

<v-clicks>

- On a feature branch, you make **many small commits** as you work. That's healthy.
- `git diff HEAD` only shows work you **haven't committed yet.**
- So right after you commit, git answers: *"nothing changed."* 😱
- The tool then sees an empty (or tiny) changeset and picks the **wrong phase** — or documents almost nothing.

</v-clicks>

---
layout: two-cols
layoutClass: gap-6
---

# Change 1 · What we changed

Ask git a better question: *"what changed since this branch **began**?"*

```bash
# find where the branch split
# off from main/master
base=$(git merge-base main HEAD)

# everything since then —
# committed AND uncommitted
git diff --name-only "$base"
```

<div class="text-xs opacity-70 pt-2">
"merge-base" = the commit where your branch and main last agreed.
</div>

::right::

# Why this is the right fix

<v-clicks>

- Captures the **entire feature**, however you committed it.
- Works whether you commit once or fifty times.
- Falls back to the old behaviour on a brand-new repo with no base — nothing breaks.
- The base branch is auto-detected (`origin/HEAD` → `main` → `master` → `develop`).

</v-clicks>

---
layout: default
---

# Change 1 · The outcome (proven)

We built a throwaway repo: one **committed** source file, one **uncommitted** file.

<div class="grid grid-cols-2 gap-6 pt-4">

<div v-click class="p-4 border-l-4 border-red-400 bg-red-400/10 rounded">

### Before — `git diff HEAD`
```text
(nothing)
```
The committed work was **invisible.**

</div>

<div v-click class="p-4 border-l-4 border-green-400 bg-green-400/10 rounded">

### After — diff vs merge-base
```text
src/a.js        ← the committed file
```
The feature work **shows up.** ✅

</div>

</div>

<div v-click class="mt-6 text-sm opacity-80">

Files touched: <code>skills/document-phase/SKILL.md</code> and the phase agents. Brand-new untracked files are still caught by <code>git status</code>, which the skill also runs.

</div>

---
layout: section
---

# Change 2 — Learn the real "why"

Read intent from commits and design notes

---
layout: default
---

# Change 2 · The problem, in plain English

Good docs explain **why** — *why* this approach, *what* was rejected, *who* it's for.

<v-clicks>

- But code (a diff) only shows **what** the code *is* — never **why** it was chosen.
- The agents were asked to *infer* the "why" from code alone.
- An AI told to "infer the rejected alternatives" from code will often **make up plausible-sounding ones.** That's confident but wrong documentation — the worst kind.

</v-clicks>

<div v-click class="mt-4 p-3 bg-amber-400/10 border-l-4 border-amber-400 rounded text-sm">

The "why" almost always **does** exist somewhere — just not in the code. It's in your commit messages and design notes.

</div>

---
layout: default
---

# Change 2 · What we changed

We pointed the spec & design agents at the places intent actually lives:

<v-clicks>

- **Full commit-message bodies**, not just one-line summaries:
  ```bash
  git log main..HEAD --format='%h %s%n%b'   # includes the paragraphs you wrote
  ```
- **In-repo design docs & ADRs** (`*adr*`, `*design*`, `*.puml`, `*.drawio`).
- A new rule in both agent prompts:
  > *"Prefer stated intent over inference. Fall back to `[to be confirmed]` only when neither the diff nor these sources answer it."*

</v-clicks>

<div v-click class="mt-4 text-sm opacity-80">

This keeps the plugin's existing honesty rule (<code>[to be confirmed]</code>) — but now the agent has a **real source to check first** before ever guessing.

</div>

---
layout: default
---

# Change 2 · The outcome

<div class="grid grid-cols-2 gap-6 pt-6">

<div v-click class="p-4 border-l-4 border-red-400 bg-red-400/10 rounded">

### Before
"This feature adds a cache layer *[to improve performance — to be confirmed]*."
<br><span class="text-xs opacity-70">A guess dressed as a fact, or a placeholder.</span>

</div>

<div v-click class="p-4 border-l-4 border-green-400 bg-green-400/10 rounded">

### After
"This feature adds a cache layer. Per commit `a1b2c3`: *'chosen over Redis to avoid a new service in the on-prem deploy.'*"
<br><span class="text-xs opacity-70">Grounded in what you actually wrote.</span>

</div>

</div>

<div v-click class="mt-6 text-sm opacity-80">

Files touched: <code>agents/spec-documenter.md</code>, <code>agents/architect-documenter.md</code>.
<span class="opacity-70">Pulling from PR descriptions and issue trackers is planned next.</span>

</div>

---
layout: section
---

# Change 3 — Right model for the job

Match model power to task difficulty

---
layout: default
---

# Change 3 · The problem, in plain English

Claude comes in different sizes. Two matter here:

<div class="grid grid-cols-2 gap-6 pt-4">

<div v-click class="p-4 border rounded">

### 🐇 Haiku
**Fast & cheap.** Great at mechanical work: *"list the files that changed, name the patterns."*

</div>

<div v-click class="p-4 border rounded">

### 🧠 Sonnet
**Stronger reasoning.** Better at judgment: *"why was this designed this way? what are the trade-offs?"*

</div>

</div>

<div v-click class="mt-6 p-3 bg-red-400/10 border-l-4 border-red-400 rounded text-sm">

**The mismatch:** *all five* agents used haiku — including the spec & design agents, whose whole job is judgment. We were using the fast model for the hardest thinking.

</div>

---
layout: default
---

# Change 3 · What we changed & the outcome

A one-line change in each agent's settings (its "frontmatter"):

```diff
- model: haiku      # in spec-documenter.md and architect-documenter.md
+ model: sonnet
```

<div class="grid grid-cols-2 gap-6 pt-4">

<div v-click>

### The tiering
| Agent | Model |
|---|---|
| spec, design | **sonnet** 🧠 |
| impl, deploy, testing | **haiku** 🐇 |

</div>

<div v-click>

### Why it's balanced
- Smart model **only** where "why" matters.
- Cheap model stays for extraction — no runaway cost.
- Each agent's model lives in its own file, so it's **easy to change**, now documented in the README.

</div>

</div>

---
layout: section
---

# Change 4 — Keep nudging usefully

Per-phase reminders, not folder-level

---
layout: default
---

# Change 4 · The problem, in plain English

There's a gentle reminder that runs after each turn: *"you have undocumented work."*

<v-clicks>

- It checked one thing: *"does a docs folder exist for this branch?"*
- The moment you wrote **one** doc (say `spec.md`), the folder existed…
- …so it went **silent forever** — even if design, implementation, deployment, and testing were all still undocumented. 🤐

</v-clicks>

<div v-click class="mt-4 text-sm opacity-80">

One document out of five, and the safety net switched itself off.

</div>

---
layout: default
---

# Change 4 · What we changed

The reminder script now does what the main tool does — **works out the current phase**, then checks for *that phase's* file:

```bash
phase=$(classify_from_changed_files)   # e.g. "implementation"
file="${phase}.md"                     # → implementation.md
# nudge only if THAT specific file is missing
[[ -f "docs/features/*branch*/$file" ]] || nudge "$phase"
```

<v-clicks>

- Reuses the **same phase rules** as the skill, so they agree.
- Nudges about the **specific** missing document, by name.
- Keeps every existing safety guard: silent on main/master, on a clean tree, and on detached HEAD.

</v-clicks>

---
layout: default
---

# Change 4 · The outcome (tested across 6 states)

<div class="grid grid-cols-2 gap-x-8 gap-y-2 pt-4 text-sm">

<v-clicks>

<div>✅ Implementation change, no doc → nudges **"implementation.md"**</div>
<div>✅ Mixed changes → picks one phase by priority order</div>
<div>✅ That phase's doc exists → **silent**, even if others missing</div>
<div>✅ On <code>main</code> / base branch → silent</div>
<div>✅ Clean working tree → silent</div>
<div>✅ Fresh repo, no base branch → falls back, no crash</div>

</v-clicks>

</div>

<div v-click class="mt-6 text-sm opacity-80">

File touched: <code>hooks/check-undocumented</code>. Ran under <code>bash -n</code> (syntax) and in throwaway repos for each state above.

</div>

---
layout: default
---

# How we verified the whole change

Nothing here is "trust me" — each fix was exercised directly:

<div class="grid grid-cols-2 gap-6 pt-4 text-sm">

<div v-click class="p-3 border rounded">

**🧪 Throwaway git repos**
Created branches with committed + uncommitted files to prove detection now sees committed work.

</div>

<div v-click class="p-3 border rounded">

**🔔 Hook state matrix**
Ran the reminder script in 6 different repo states; confirmed the right nudge (or silence) each time.

</div>

<div v-click class="p-3 border rounded">

**🔍 Frontmatter check**
Grepped all agents to confirm the model tiers landed exactly as intended.

</div>

<div v-click class="p-3 border rounded">

**♻️ Fallback safety**
Confirmed a repo with no base branch still works and never errors.

</div>

</div>

---
layout: default
---

# Files touched

| File | Change |
|---|---|
| `skills/document-phase/SKILL.md` | Detect via merge-base instead of `git diff HEAD` |
| `agents/spec-documenter.md` | Read commit bodies + ADRs; model → sonnet |
| `agents/architect-documenter.md` | Read commit bodies + design docs; model → sonnet |
| `agents/impl-documenter.md` | Diff vs merge-base; full commit log |
| `agents/deploy-documenter.md` | Diff infra files vs merge-base |
| `agents/testing-documenter.md` | Diff test files vs merge-base |
| `hooks/check-undocumented` | Per-phase classification & nudge |
| `README.md` | New "Model Configuration" section |

---
layout: default
---

# What's intentionally *not* in this change

These are agreed and scheduled — just **not** in this branch:

<div class="grid grid-cols-2 gap-4 pt-4 text-sm">

<v-clicks>

<div class="p-3 border-l-4 border-amber-400 bg-amber-400/10 rounded">

**🔜 Living docs & drift detection**
Update docs in place, preserve human edits, flag stale sections. *(Mid-term.)*

</div>

<div class="p-3 border-l-4 border-amber-400 bg-amber-400/10 rounded">

**🔜 Multi-label phase detection**
Handle branches that span several phases at once. *(Mid-term.)*

</div>

<div class="p-3 border-l-4 border-amber-400 bg-amber-400/10 rounded">

**🔜 Self-verification pass**
An agent that double-checks the draft before writing. *(Mid-term.)*

</div>

<div class="p-3 border-l-4 border-amber-400 bg-amber-400/10 rounded">

**🔜 Cross-feature index & PR/issue ingestion**
Aggregate docs; pull intent from GitHub. *(Long-term.)*

</div>

</v-clicks>

</div>

---
layout: statement
---

# In one breath

<div class="text-xl leading-relaxed pt-4 text-left max-w-3xl mx-auto">

<v-clicks>

- The tool now sees your **whole feature**, not just uncommitted scraps.

- It documents the **real "why"** from your commits and notes, instead of guessing.

- It **thinks harder** where thinking matters, and stays cheap where it doesn't.

- It keeps **reminding you** about each missing document, not just the first.

</v-clicks>

<div v-click class="pt-6 text-teal-400">
Same simple, file-based plugin — just markedly more trustworthy output.
</div>

</div>

---
layout: center
class: text-center
---

# Thank you

The critique that started this → <code>slides.md</code>

<div class="pt-8 opacity-70 text-sm">

Run either deck locally: &nbsp; <code>npx slidev docs/changeset.md</code>

</div>

<div class="abs-br m-6 text-xs opacity-50">
feature-dev-documentalist · improvement branch
</div>
