# QA Status v0.8.7

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Objective
Correct the course-list inventory that previously produced 86 candidates from nested clickable descendants although the visible list contained a much smaller number of course rows.

## Change
- Replaced generic clickable-control candidate extraction with the observed row selector `div.courseListItem`.
- Each row is independently inspected. A course label is resolved only when exactly one eligible visible text line matches the page's visible text.
- Ambiguous or unresolved rows remain review-required; they are not silently guessed.
- Excluded common UI labels/status badges such as 「提出済」 and the standalone 「自主学習」 item.
- Added explicit inventory diagnostics: selector, row element count, unique resolved label count, unresolved row count, duplicate labels, and inventory status.
- Bumped extension version and install/UI documentation to v0.8.7.

## Static verification
- `popup.js` parses with JavaScript syntax validation.
- The old generic `controls.filter(control => ...)` course candidate path is absent.
- The new candidate path queries only `div.courseListItem`.
- Manifest JSON parses and reports version 0.8.7.
- Popup, README, and INSTALL version labels report v0.8.7.

## Runtime verification required
- Reload the unpacked extension in Chrome.
- Capture the visible 「授業一覧」 page.
- Compare `courseRowElementCount` and `uniqueResolvedCount` against the actual visible course rows. Do not assume the expected count is 18 unless the current complete list is verified.
- Check unresolved rows and duplicate labels. Any nonzero value requires inspection.
- Confirm the standalone 「自主学習」 entry is absent from the candidate inventory.
- Confirm the visible excluded parallel-self-study marker blocks collection when present.

## Known limitations
- No live Chrome runtime test has been performed for v0.8.7.
- The row selector is grounded in the supplied live DOM diagnostic but can change if LoiLoNote changes its markup.
- Visible DOM text cannot independently prove the internal normal-class/parallel-self-study metadata. Uncertain courses must remain unscanned.
- No automatic traversal across all normal classes, full note/material body extraction, complete image/handwriting/formula/PDF/attachment capture, persistent queue/resume, or automatic start after login is implemented.
- Folder traversal remains experimental and user-initiated.

## Safety
- No form submission, sending, sharing, editing, deleting, or moving is added.
- No cookies, credentials, tokens, hidden application state, or external uploads are used.
- School data remains local.

## Status
**SOURCE-VERIFIED / RUNTIME-PENDING.** The duplicate candidate source has been replaced and static checks are ready; actual row counts and capture/download behavior still require a live Chrome test.
