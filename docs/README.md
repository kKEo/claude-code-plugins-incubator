# Documentation index

Everything published about this marketplace lives under `docs/guide/` as one landing page and three books. Design and reference material elsewhere in the repository is listed at the end.

## Published site

| Page | Path | For |
|---|---|---|
| Landing page | [docs/guide/index.html](guide/index.html) | Everyone; one card per book |
| User guide | [docs/guide/user/](guide/user/README.md) | People who install and use the plugins |
| Plugin author guide | [docs/guide/operator/](guide/operator/README.md) | People who author, configure, publish and operate plugins |
| Tester guide | [docs/guide/tester/](guide/tester/README.md) | People who check a change before merge |

Each book is a GitBook space (`.gitbook.yaml`) that mdBook also builds (`book.toml`). The site is built by `.github/workflows/docs.yml` into `site/` with the landing page at the root.

## Checking and building

```bash
make docs-check              # validator + reconciliation against the code
make docs                    # docs-check, then build all three books (needs mdbook)
make docs-serve BOOK=user    # serve one book locally
```

## Design and reference documents

- [CONTRIBUTING.md](../CONTRIBUTING.md): submission rules.
- [plugins/README.md](../plugins/README.md): the plugin list by category.
- [The three-book template](../plugins/gitbook-docs-validator/skills/gitbook-docs-validator/references/template.md): the rules this documentation follows.
- [Documentalist slides](../plugins/feature-dev-documentalist/slides.md): presentation and critique of the feature-dev-documentalist plugin.
- [Validator benchmark](../plugins/gitbook-docs-validator-workspace/iteration-1/benchmark.md): eval results for the validator skill.
