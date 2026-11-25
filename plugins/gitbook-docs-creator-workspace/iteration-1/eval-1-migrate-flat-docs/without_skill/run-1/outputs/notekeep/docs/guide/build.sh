#!/bin/sh
# Builds the landing page and the three books with mdBook into docs/guide/_site.
set -e
cd "$(dirname "$0")"
rm -rf _site
for book in user-guide operator-guide tester-guide; do
  mdbook build "$book"
done
cp index.html _site/index.html
echo "Built docs/guide/_site/index.html"
