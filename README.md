# momon-author-extractor

A resumable metadata extractor for a saved momon:GA work list.

## Goal

For the saved work IDs supplied by the user, collect only data actually present on each public work page:

- work ID
- title
- explicit `【作者】` value
- failures / pages where the author field was not found
- final deduplicated author list

No author is guessed or inferred when the site does not expose an author field.

## Why this design

The earlier iPhone Shortcuts approach could fetch an individual page, but a long 627-iteration Shortcut loop timed out. This repository moves the long-running work into GitHub Actions. The extractor checkpoints after every work, retries transient failures with exponential backoff, and produces artifacts after the run.

GitHub Actions artifacts are intended for retaining and sharing workflow output after a job completes.

## Input

Put the saved IDs in `data/ids.txt`, one per line. The parser also accepts arbitrary text containing `mo...` IDs and deduplicates them.

For the intended complete run, the workflow validates that there are exactly **627 unique IDs** before considering the run complete.

Important: the private saved-list page is not assumed to be accessible from GitHub Actions. The browser/session-dependent step is therefore separated from public-page metadata extraction.

## Outputs

- `output/works.csv` — ID, title, author for every processed ID
- `output/authors.txt` — deduplicated author list, preserving the site's displayed strings
- `output/failures.csv` — IDs for which author extraction failed or the author field was absent
- `output/summary.json` — counts and completion status
- `output/checkpoint.json` — resumable state

The workflow uploads `output/` as the `momon-results` artifact.

## Local run

```bash
python extractor.py --ids-file data/ids.txt --output-dir output --checkpoint output/checkpoint.json
```

The script uses only Python's standard library.

## External research / enrichment policy

Firecrawl, Tavily AI, and Parallel Search can be used to investigate site structure, public metadata conventions, or recovery strategies when needed. They are not used to invent missing author values.

Airtable is optional. No Airtable base is assumed or created automatically; this keeps the GitHub repository usable without requiring a separate database account.

Wolfram is optional for validation/statistical checks. It is not required for HTML metadata extraction.

## Completeness rule

A run is not treated as complete merely because 627 IDs were iterated. A successful complete result requires all expected IDs to have records and no unresolved failures. Records with no explicit author remain marked as authorless rather than being guessed.
