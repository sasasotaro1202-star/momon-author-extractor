# QA Status v0.8.4

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Changes
- Added a required normal-class name field to the popup.
- The user must check that the class is not 「自主学習と並行した授業」 and accept a final confirmation dialog.
- Folder traversal requires the entered class name to match one complete visible text line on the current material-box page.
- Traversal is blocked if the exact exclusion phrase is visible on the current page.
- The resulting folder-map JSON records the entered class name, user-confirmation flag, verification method, and limitation.
- Course-list diagnostics now retain bounded visible ancestor context per candidate and separately report whether a standalone 「自主学習」 entry is visible.
- Updated popup title, manifest version, README, and INSTALL to v0.8.4.

## Static checks
- `popup.js` parses with JavaScript syntax validation.
- `manifest.json` parses as JSON and reports version 0.8.4.
- Popup HTML and manifest versions agree.
- Required class-name field and confirmation checkbox are present.
- The folder-scan path passes the class name as an executeScript argument.
- The scanner requires an exact complete visible text-line match, not a substring match.
- The scanner rejects the exact visible phrase 「自主学習と並行した授業」.
- Result validation requires `scopeVerification.userConfirmedNormalClass` and the same class name.

## Limitations
- The user confirmation is an attestation, not an independent read of LoiLoNote's internal class attributes.
- The exact exclusion label may be represented differently in the real UI; the phrase check cannot detect alternate wording or icon-only labels.
- No course is automatically opened from the course list.
- The current browser course-list observation showed a separate 「自主学習」 entry, but did not establish the identity of any parallel self-study class.
- No live Chrome runtime test of v0.8.4 has been performed.
- Folder traversal still uses visible DOM folder-icon heuristics and URL-changing navigation; it is experimental.
- No note/card content, full images, handwriting, equations, PDFs, or attachments are extracted by the folder-map crawler.
- No persistent crawl queue/resume, incremental sync, or scheduled unattended operation is implemented.

## Safety
- No form submission, sending, sharing, editing, deleting, moving, copying, or other content mutation is added.
- No cookies, credentials, tokens, hidden application state, or external uploads are used.
- The user must not confirm a class if its normal-class status is uncertain. Leave it unscanned.

## Status
**NOT COMPLETE.** The explicit scope gate is implemented and statically checked. Live UI classification and runtime behavior remain unverified; do not claim complete class coverage.
