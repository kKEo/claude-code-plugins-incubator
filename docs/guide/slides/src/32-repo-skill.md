# This repo: a skill plugin

**rigorous-review**: one skill, no code. A strict pre-merge review that only reads.

```text
do a rigorous review
/rigorous-review 123
/rigorous-review src/api --focus security
```

![Workflow of rigorous-review: you ask, the skill reads the diff and its context, checks five areas and reports findings](../user/images/workflow-rigorous-review.svg)

Each finding has a severity, a `file:line`, the failure mode and a minimal fix.

<small>More: [rigorous-review](../user/plugins/rigorous-review.html) in the user guide</small>
