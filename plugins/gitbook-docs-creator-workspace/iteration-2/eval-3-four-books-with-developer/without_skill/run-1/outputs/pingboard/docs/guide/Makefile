# Builds the landing page and the four books into _site/ with mdBook.
BOOKS := user operator tester developer
SITE  := $(CURDIR)/_site

.PHONY: build clean $(BOOKS)

build: $(BOOKS)
	cp index.html $(SITE)/index.html

$(BOOKS):
	mdbook build $@ --dest-dir $(SITE)/$@

clean:
	rm -rf $(SITE) $(addsuffix /book,$(BOOKS))
