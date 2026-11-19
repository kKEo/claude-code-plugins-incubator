# A mod and a command hook

Both are declared in `hooks/hooks.json` and both react to events. A command hook is a process per event; a mod is a module that stays loaded.

![A command hook and a mod compared: for a command hook the engine starts your script as a new process with the event as JSON on stdin and reads JSON from stdout, and the script cannot draw and remembers nothing; a mod is loaded once, its hooks join the chain of each event, and a hook calls back through the engine interface to draw, keep state, run a process, ask a model or start a timer](../operator/images/mod-vs-hook.svg)

<small>Rule of thumb: a script can do the job, use a command hook. The job must draw, remember, or stand between the model and a tool, use a mod.</small>
