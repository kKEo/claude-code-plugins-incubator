# Reporting a defect

Report defects as issues at <https://github.com/example/pingboard/issues>. Search first; add your observations to an existing issue if there is one.

For a security problem, do not publish details in an issue. Ask the maintainers for a private channel first.

## What a useful report contains

1. **A title that names the behaviour.** "`check --json` prints nothing when the list is empty" is useful; "check is broken" is not.
2. **The version.** The commit (`git rev-parse --short HEAD`) or the output of `pip show pingboard`.
3. **The environment.** Operating system and the output of `python --version`.
4. **The settings.** Every `PINGBOARD_*` variable that is set: `env | grep PINGBOARD`.
5. **The steps.** The exact commands, in order, starting from an empty target list when possible.
6. **The expected result** and why you expect it, for example a sentence of the documentation.
7. **The actual result.** The complete output, including a Python traceback if there is one, as text and not as a picture.

Replace private host names in URLs and output before you post them.

## Template

```
Title: <behaviour>

Version: <commit or version>
Environment: <operating system>, Python <version>
Settings: <PINGBOARD_* variables, or "defaults">

Steps:
1. ...
2. ...

Expected: ...
Actual: ...

Output:
<paste>
```

## For a failed step of the manual test plan

Give the number of the step, for example "manual test plan, step 3.5", in addition to the points above.

## If you can, add a failing test

A test that reproduces the defect is the best report. It shows the problem without ambiguity and protects the fix later. [Writing tests](writing.md) shows the patterns.
