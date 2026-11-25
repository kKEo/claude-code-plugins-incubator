# Documentation targets. The books live in docs/guide/<book>/, one landing page above them.
# mdBook is a single static binary: https://github.com/rust-lang/mdBook/releases

DOCS   := docs/guide
BOOKS  := user operator tester developer
BOOK   ?= user
MDBOOK ?= mdbook
PORT   ?= 8000

.PHONY: docs docs-check docs-build docs-serve docs-site docs-clean

## Check the docs, then build every book into site/.
docs: docs-check docs-build

## Check relative links and reconcile the operator book with the code.
docs-check:
	./scripts/docs-check.sh

## Build all books into site/ and copy the landing page to the site root.
docs-build:
	@command -v $(MDBOOK) >/dev/null || { echo "mdbook not found; install it or set MDBOOK=/path/to/mdbook" >&2; exit 1; }
	@rm -rf site
	@for b in $(BOOKS); do $(MDBOOK) build $(DOCS)/$$b || exit 1; done
	@rm -f site/*/book.toml site/*/.gitbook.yaml
	@cp $(DOCS)/index.html site/index.html && touch site/.nojekyll
	@echo "site built in site/"

## Preview one book with live reload: make docs-serve BOOK=user
docs-serve:
	$(MDBOOK) serve $(DOCS)/$(BOOK) --open

## Build everything and serve the whole site from the landing page: make docs-site PORT=8080
docs-site: docs-build
	@echo "serving site/ at http://localhost:$(PORT)/ (Ctrl+C to stop)"
	@python3 -m http.server $(PORT) --bind 127.0.0.1 --directory site

docs-clean:
	rm -rf site
