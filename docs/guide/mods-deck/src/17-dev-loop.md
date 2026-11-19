# The development loop

Save a file and the running session reloads the module. That is the whole toolchain.

![The development loop of a mod: write three files; claude plugin validate type-checks them and prints what the module hooks and calls; claude --plugin-dir loads it for one session; edit and save and the module reloads by itself, repeat; claude plugin test runs the tests; then share it through a marketplace, or ask Claude to make the mod with the plugin-authoring skill](images/dev-loop.svg)

<small>Source: [Create a mod](https://code.claude.com/docs/en/plugins/mods/create), [Test a mod](https://code.claude.com/docs/en/plugins/mods/test), [Your first mod](../operator/mods/first-mod.html)</small>
