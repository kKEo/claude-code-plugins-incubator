# FAQ and troubleshooting

This page collects the questions that come up most and the fixes that usually work.

## The plugin does not show up after installing

Run `/reload-plugins`, or start a new session. Then type `/plugin` and check that `km-plugin-registry` is listed as a marketplace and that the plugin is listed as installed. If the marketplace is missing, add it again with `/plugin marketplace add kKEo/claude-code-plugins-incubator`.

## Claude answers in general terms instead of using the plugin

Plugins trigger on the words in your prompt. Use a phrase from [Everyday use](everyday-use.md), or call the skill by name: `/document-phase`, `/frontend-scaffold:scaffold-frontend`. For the validator, mention the docs folder or the words "template", "SUMMARY.md" or "GitBook".

## I never see the "document before committing" tip

The tip appears only when all three are true: you are on a branch that is not `main`, `master`, `develop`, `development` or `trunk`; there are uncommitted changes; and there is no folder under `docs/features/` whose name contains the branch name. If you already documented once, the tip stops on purpose.

On Windows the tip needs a bash to run. Git for Windows provides one; without it the script exits silently.

## The documentalist asks me which phase I am in

Your changes span more than one kind of file, for example source code and a workflow file. Pick the phase you are documenting now. To avoid the question, name the phase: `/document-phase implementation`.

## The documentalist wants to overwrite a file

A document for that phase already exists in the feature folder. Say yes to replace it, or no to keep it. To keep both, rename the old one first.

## The validator cannot find the documentation

It looks for a folder that holds `index.html` and book folders, each with a `SUMMARY.md`, usually `docs/guide/`. If your docs live elsewhere, name the path in the prompt: "check documentation in `handbook/`".

## The validator reports a role as missing although the book exists

Book folders are matched to roles by name. `user`, `getting-started`, `guide` map to the user book; `operator`, `internals`, `deploy`, `developer` to the operator book; `tester`, `qa`, `testing` to the tester book. Other names need a small `.docs-template.json` in the docs folder; the [plugin author guide](../operator/config/commands.md) shows the shape.

## The scaffolded project does not build

Claude runs `npm run build` and fixes type errors before reporting success, so a failure usually means the environment: an old Node version (18 or newer is needed) or no network for `npm install`. Run the build again by hand and paste the error into the conversation.

## Where do I report a problem?

Open an issue at <https://github.com/kKEo/claude-code-plugins-incubator/issues> with the prompt you used and what happened.
