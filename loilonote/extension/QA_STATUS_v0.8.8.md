# QA Status v0.8.8

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Scope
This release hardens the local diagnostic output and retains the v0.8.7 course-row inventory correction.

## Changes
- Removed raw `data-*` attribute values from visible-control diagnostics.
- Removed raw `outerHTML` snapshots from visible-control diagnostics.
- Removed `data-*` attribute values from folder traversal records.
- Retained visible text, tag, class name, screen bounds, and same-origin path data needed for diagnostics.
- Bumped extension version and updated UI/install documentation.

## Static verification
- `popup.js` passes JavaScript syntax parsing.
- `manifest.json` parses and reports version 0.8.8.
- Source no longer contains the diagnostic `dataAttributes` or `outerHTML` output fields.
- Folder records no longer serialize raw `data-*` attributes.
- Course-row inventory still uses only `div.courseListItem` and retains deduplication and unresolved-row diagnostics.

## Runtime verification required
- Reload the extension in Chrome.
- Capture the current LoiLoNote course list and verify the row count, unique labels, unresolved rows, and duplicate labels against the visible UI.
- Confirm the JSON no longer contains `dataAttributes` or `outerHTML`.
- Test one explicitly confirmed normal class with a small folder tree before any broader traversal.
- Do not mark any class as eligible unless the user can independently confirm it is not a parallel self-study class.

## Known limitations
- No live Chrome runtime test has been performed for v0.8.8.
- The live page text confirms the visible course list, but does not reveal which courses are parallel self-study classes.
- No automatic all-class traversal, full note/material body capture, complete image/handwriting/formula/PDF/attachment capture, persistent queue/resume, or automatic start after login is implemented.
- Folder traversal remains experimental and user-initiated.
- Visible page text and screenshots may contain personal information; files remain local and should not be uploaded publicly.

## Safety
- No form submission, sending, sharing, editing, deleting, or moving is added.
- No cookies, credentials, session tokens, hidden application state, or raw DOM attributes are exported.
- No external upload or remote-control operation is used.

## Status
**SOURCE-VERIFIED / RUNTIME-PENDING.** Source-level privacy reduction and syntax checks are complete; Chrome runtime behavior and real-world extraction completeness remain unverified.
