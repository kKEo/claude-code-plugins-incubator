# Documentation targets. The books live in docs/guide/<book>/; see docs/README.md.

BOOKS := user operator tester
BOOK  ?= user
MDBOOK ?= mdbook
PORT   ?= 8000

.PHONY: docs docs-check docs-build docs-serve docs-site docs-clean

## Check the docs against the template and the code, then build every book.
docs: docs-check docs-build

## Validate structure (gitbook-docs-validator) and reconcile the operator book with the code.
docs-check:
	scripts/docs-check

## Build all three books into site/ and copy the landing page and its images to the site root.
docs-build:
	@command -v $(MDBOOK) >/dev/null || { echo "mdbook not found; install it or set MDBOOK=/path/to/mdbook" >&2; exit 1; }
	@for b in $(BOOKS); do $(MDBOOK) build docs/guide/$$b || exit 1; done
	@mkdir -p site/images && cp docs/guide/index.html site/index.html && cp docs/guide/images/* site/images/
	@echo "site built in site/"

## Serve one book locally: make docs-serve BOOK=operator
docs-serve:
	$(MDBOOK) serve docs/guide/$(BOOK) --open

## Build everything and serve the whole site from the landing page: make docs-site PORT=8080
docs-site: docs-build
	@echo "serving site/ at http://localhost:$(PORT)/ (Ctrl+C to stop)"
	@python3 -m http.server $(PORT) --bind 127.0.0.1 --directory site

docs-clean:
	rm -rf site
