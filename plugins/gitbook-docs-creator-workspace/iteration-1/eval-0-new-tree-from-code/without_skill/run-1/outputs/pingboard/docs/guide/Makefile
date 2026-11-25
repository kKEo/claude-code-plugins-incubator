# Builds the landing page and the three books into _build/ with mdBook.
BOOKS := user operator tester

.PHONY: build clean $(BOOKS)

build: $(BOOKS)
	cp index.html _build/index.html

$(BOOKS):
	mdbook build $@
	rm -f _build/$@/book.toml _build/$@/.gitbook.yaml

clean:
	rm -rf _build
