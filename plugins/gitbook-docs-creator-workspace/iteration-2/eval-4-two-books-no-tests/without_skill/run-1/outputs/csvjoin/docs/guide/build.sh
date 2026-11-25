#!/bin/sh
# Build the landing page and every book into docs/guide/_site with mdBook.
set -eu
cd "$(dirname "$0")"
rm -rf _site
mkdir -p _site
cp index.html _site/index.html
for book in user operator; do
    mdbook build "$book" --dest-dir "$PWD/_site/$book"
done
echo "Built $PWD/_site/index.html"
