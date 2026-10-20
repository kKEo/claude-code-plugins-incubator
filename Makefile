# Documentation targets. The books live in docs/guide/<book>/; see docs/README.md.

BOOKS := user operator tester
BOOK  ?= user
MDBOOK ?= mdbook

.PHONY: docs docs-check docs-build docs-serve docs-clean

## Check the docs against the template and the code, then build every book.
docs: docs-check docs-build

## Validate structure (gitbook-docs-validator) and reconcile the operator book with the code.
docs-check:
	scripts/docs-check

## Build all three books into site/ and copy the landing page to the site root.
docs-build:
	@command -v $(MDBOOK) >/dev/null || { echo "mdbook not found; install it or set MDBOOK=/path/to/mdbook" >&2; exit 1; }
	@for b in $(BOOKS); do $(MDBOOK) build docs/guide/$$b || exit 1; done
	@mkdir -p site && cp docs/guide/index.html site/index.html
	@echo "site built in site/"

## Serve one book locally: make docs-serve BOOK=operator
docs-serve:
	$(MDBOOK) serve docs/guide/$(BOOK) --open

docs-clean:
	rm -rf site
