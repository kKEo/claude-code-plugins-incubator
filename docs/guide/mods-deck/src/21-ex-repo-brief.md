# Intermediate: repo-brief

Change what the model reads: steady house rules go into the system prompt once, the current branch rides along with each prompt.

![How the repo-brief example works. Steady text: when a thread renders its system prompt, the prompt.compose hook reads house-rules.md and appends a section, which is sent once and is then fixed for the thread. Changing text: for every prompt you type, the prompt.submit hook asks git for the branch and attaches it as context the model reads and you never see. The model knows the rules from the system prompt and the branch fresh with each prompt](../operator/images/example-repo-brief.svg)

<small>Full source: [repo-brief](../operator/mods/example-repo-brief.html), 42 lines</small>
