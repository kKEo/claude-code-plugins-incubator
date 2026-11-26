---
name: gitbook-docs-article
description: Add a dated article to a GitBook/mdBook documentation site that follows the book-per-reader template, and attach it to the landing page. A script creates the article in the `articles/` book under a file name that starts with its date, and rebuilds the indexes (the landing page's Articles section, the article list and the book's SUMMARY.md) newest first; the skill writes the article from the project's code and history. Use this whenever someone asks to write, add, draft, publish or post an article, a blog post, a news item, an announcement, a release write-up, a "what's new", a changelog story, a post-mortem, a decision write-up or a deep-dive for the docs site, to add a news, blog or articles section to the landing page, to list or link an article on the landing page, to change an article's date or title, or to refresh the article index, even if they never say "GitBook" or "mdBook". Also use it when the docs check reports that the landing page does not list the newest article. Not for pages of the user, operator, tester or developer books (that is gitbook-docs-creator) and not for checking docs (that is gitbook-docs-validator).
---

# GitBook docs article

You are adding an article to a documentation site that has one landing page and one book per
kind of reader. An article is a different kind of page from a book page:

| | Book page | Article |
|---|---|---|
| Says | what is true now | what happened, changed or was decided, on a date |
| Kept current | yes, on every change | no; it stays as written |
| Found through | the book's table of contents | the landing page and the article index, by date |
| Lives in | `<docs-root>/<book>/` | `<docs-root>/articles/YYYY-MM-DD-<slug>.md` |

The date in the file name is the article's date, and the only place it is stored. Every index
is ordered by it, newest first. The article is attached to the landing page: `index.html` has
an Articles section with the newest published articles (date, title, summary) and a link to
all of them. You never edit that section or the other indexes by hand; the script rebuilds
them from the article files.

The sibling skills own the rest of the tree, and this skill reads their files in place:

- `<skill-dir>/../gitbook-docs-validator/references/template.md` §10: the rules for articles, with their reasons.
- `<skill-dir>/../gitbook-docs-validator/scripts/validate_docs.py`: the check that ends every run.
- `<skill-dir>/../gitbook-docs-creator/references/writing.md`: §1, how to gather the facts, applies to articles too.

## Workflow

1. **Look before you write.** Find, in one parallel batch where you can:
   - the docs root: the directory with `index.html` and the book folders, usually `docs/guide/`.
     When there is no landing page, there is nothing to attach the article to: say so, and
     offer to create the docs tree with `gitbook-docs-creator` first;
   - the articles that exist (`<docs-root>/articles/`), so the new one does not repeat one
     and matches their tone;
   - the facts the article will state. Read them where they are recorded: the code, the diff
     or the commits (`git log`) for a change, the issue or the design note for a decision,
     the measurements for a result. Do not write them from memory.

   Settle three things before running the script:
   - **Title**: says what the article is about in the reader's words ("Imports are five times
     faster", not "Performance update").
   - **Date**: the day the article is published, today unless the user names another. For a
     write-up of a past event the user may want the event's date; ask only when it is unclear
     which one they mean.
   - **Whether it is an article at all.** If the text has to stay true after the next
     release (how to configure something, how to run the tests), it belongs in a book. Write
     the lasting part there, or say that it should go there, and let the article link to it.

2. **Create the article with the script.**

   ```bash
   python3 <skill-dir>/scripts/add_article.py <docs-root> --title "<title>" \
       [--date YYYY-MM-DD] [--slug <short-name>] [--summary "<lead paragraph>"]
   ```

   - The first article also creates the articles book: `book.toml`, `.gitbook.yaml`,
     `home-button.js`, `README.md` and `SUMMARY.md`. Pass `--name "<project name>"` then if
     the landing page's `<h1>` is not the name readers know.
   - `--slug` shortens the file name when the title is long; the default is made from the title.
   - `--dry-run` prints the plan and writes nothing.
   - The script never overwrites an article. On the landing page it touches only the section
     between `<!-- articles:start -->` and `<!-- articles:end -->`; the first time, it
     inserts that section above the footer and adds a few style rules to the page's
     `<style>`. `articles/SUMMARY.md` is rewritten in full on every run.

   The new file is a stub marked `> Draft.`. A draft is listed in the book's `SUMMARY.md`,
   so it can be previewed, and is left off the landing page until it is published.

   Read the script's "left for you" list. The usual entry on a first article: the Makefile
   builds only the books named in `BOOKS`, so add `articles` to that line; without it the
   links on the landing page lead nowhere on the built site.

3. **Write the article.** Keep the three lines the script wrote at the top (the H1, the
   `*Published …*` line, the Draft line) and write below them.
   - **Lead paragraph first.** The first paragraph under the date line says, in one or two
     sentences, what the article tells the reader. The indexes show it as the summary, so it
     has to stand on its own: no "In this article", no link, nothing that needs the title to
     make sense.
   - Then the body: what changed or happened, why, and what it means for the reader. End with
     what the reader does next, when there is something to do.
   - State only what you read in the code or the history or ran yourself. Quote names, numbers
     and commands exactly. When a fact is unknown, ask or leave the article a draft.
   - Version numbers, dates and "now" are welcome here, unlike in the books: an article is
     pinned to its date. For the same reason, do not come back later to bring an old article
     up to date. If it turned out wrong, add a dated `> **Update.** …` callout under the date
     line; if things moved on, write a new article.
   - Link to the book page that has the lasting detail (`../operator/config/settings.md`)
     instead of repeating it. Links inside the docs root are relative; anything else in the
     repository is an absolute repository URL.
   - The page rules of the books apply: one H1 on the first line, headings that do not skip
     a level, plain Markdown without GitBook-only blocks such as `{% hint %}`, commands in
     fenced `bash` blocks, images in `articles/images/` with alt text that is a full sentence.
   - When the article is ready, delete the `<!-- To write: … -->` comment and the `> Draft.`
     line. Leave the Draft line in when the user wants to review before publishing.

4. **Sync the indexes.** The title and the summary in the indexes are read from the article,
   so run this after writing, and after any later edit to a title, a lead paragraph or a file
   name:

   ```bash
   python3 <skill-dir>/scripts/add_article.py <docs-root> --sync
   ```

   `--latest N` sets how many articles the landing page shows (default 5); the link below
   them leads to the full list. To change an article's date, rename its file and fix the
   `*Published …*` line, then sync. To withdraw an article, delete its file, then sync.

5. **Gate on the validator.**

   ```bash
   python3 <skill-dir>/../gitbook-docs-validator/scripts/validate_docs.py <docs-root> --repo-root <repo-root> --quiet
   ```

   Fix every `articles` and `landing` ERROR and run it again. Findings in the role books
   that were there before are not yours to fix here: name them in the report. If `mdbook`
   is installed and the Makefile has the target, run `make docs-build` once and open the
   landing page with `make docs-site`: it is the only way to see the Articles section with
   working links.

6. **Report.** Short: the article's file, date and title; whether it is published or still a
   draft, and what a draft is waiting for; what changed on the landing page; the edits you
   made outside the articles book (the Makefile); the validator result.

## When the tree differs

- **Another folder name.** Put `{"articles": {"folder": "news"}}` into
  `<docs-root>/.docs-template.json`; the script and the validator both read it.
- **A hand-made landing page.** The script inserts its section above `<footer>`, else above
  `</main>` or `</body>`. To place it elsewhere, put the two markers
  `<!-- articles:start -->` and `<!-- articles:end -->` where the section belongs and run
  `--sync`. The section brings its own style rules and takes its colours from the page's
  `--line`, `--muted` and `--accent` variables when they exist.
- **An article book that was written by hand.** Rename the files to `YYYY-MM-DD-<slug>.md`,
  put the two markers into its `README.md`, then run `--sync`. The script lists files it
  could not index.

## Files

- `scripts/add_article.py`: creates the article and rebuilds the indexes (python3 3.8+,
  standard library only). It uses `book.toml`, `gitbook.yaml` and `home-button.js` from the
  creator skill's `assets/`.
- `evals/evals.json`: eval cases.
