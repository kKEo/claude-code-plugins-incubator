# Documentation index

Everything published about this marketplace lives under `docs/guide/` as one landing page and three books. Design and reference material elsewhere in the repository is listed at the end.

## Published site

| Page | Path | For |
|---|---|---|
| Landing page | [docs/guide/index.html](guide/index.html) | Everyone; the marketplace overview picture (`guide/images/plugins-overview.svg`) above one card per book |
| User guide | [docs/guide/user/](guide/user/README.md) | People who install and use the plugins |
| Plugin author guide | [docs/guide/operator/](guide/operator/README.md) | People who author, configure, publish and operate plugins. Part II is an introduction to writing mods, with drawings under `guide/operator/images/` and five worked examples |
| Tester guide | [docs/guide/tester/](guide/tester/README.md) | People who check a change before merge |
| Mods first-look deck | [docs/guide/mods-intro/](guide/mods-intro/src/README.md) | Complete beginners; what a mod is, what mods can do and four to install, with no code. Its drawings are in `guide/mods-intro/src/images/`. Not one of the three template books |
| Mods slide deck | [docs/guide/mods-deck/](guide/mods-deck/src/README.md) | Engineers new to mods; what a mod is and how it works, told in diagrams, ending with the four mods of this marketplace. Its own drawings are in `guide/mods-deck/src/images/`; the rest come from the plugin author guide and the user guide. Not one of the three template books: its pages are in `src/`, so the validator does not count it |
| Slide deck | [docs/guide/slides/](guide/slides/src/README.md) | Engineers new to Claude Code; an introduction with one slide per page, ending with examples from this marketplace. Not one of the three template books: its pages are in `src/`, so the validator does not count it |

Each book is a GitBook space (`.gitbook.yaml`) that mdBook also builds (`book.toml`). The site is built by `.github/workflows/docs.yml` into `site/` with the landing page at the root.

## Checking and building

```bash
make docs-check              # validator + reconciliation against the code
make docs                    # docs-check, then build all three books (needs mdbook)
make docs-serve BOOK=user    # serve one book locally
make slides-serve            # serve the mods deck alone (DECK=slides for the general deck)
make docs-site               # build, then serve the whole site from the landing page (PORT=8000)
```

## Design and reference documents

- [CONTRIBUTING.md](../CONTRIBUTING.md): submission rules.
- [plugins/README.md](../plugins/README.md): the plugin list by category.
- [The documentation template](../plugins/gitbook-docs/skills/gitbook-docs-validator/references/template.md): the rules this documentation follows.
- [Documentalist slides](../plugins/feature-dev-documentalist/slides.md): presentation and critique of the feature-dev-documentalist plugin.
- [Validator benchmark](../plugins/gitbook-docs-validator-workspace/iteration-1/benchmark.md): eval results for the validator skill.
- [Creator benchmark](../plugins/gitbook-docs-creator-workspace/iteration-1/benchmark.md): eval results for the creator skill.
