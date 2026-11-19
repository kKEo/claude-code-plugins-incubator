# The files

Three files make a mod. No build step, no `node_modules`: the engine compiles the module itself.

![The files of a mod: plugin.json is the manifest; hooks/hooks.json names the one hooks module; hooks/register.tsx exports register and adds the hooks; types/index.d.ts is the state contract, needed when the mod keeps state; test files are optional and run with claude plugin test](../operator/images/mod-anatomy.svg)

<small>Source: [Mods overview](https://code.claude.com/docs/en/plugins/mods/overview), [What a mod is](../operator/mods/what-is-a-mod.html)</small>
