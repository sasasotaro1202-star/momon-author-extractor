# QA Status v0.8.6

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Root cause found from user runtime diagnostics
- The page-read result was empty, while a separate diagnostic probe confirmed a complete document, an existing body, title 「授業一覧」, and 214 characters of body text.
- The injected page function in `popup.js` called `clean()` while mapping course candidates. `clean()` was defined in the popup execution context and was unavailable in the isolated page execution context.
- Replaced that cross-context call with a `normalize()` helper defined inside the injected function.

## Changes
- Added the execution-context-local text normalizer inside the injected page function.
- Updated manifest, README, and INSTALL version labels to v0.8.6.

## Static checks
- `popup.js` passed JavaScript syntax validation with `new Function(...)`.
- `manifest.json` parsed successfully and reports version 0.8.6.
- The injected function defines its own `normalize()` helper; both course-candidate label call sites use it, and no `clean(control.text...)` call remains in the injected function.
- README and INSTALL version labels match v0.8.6.
- A live Chrome capture test is still required after reloading the unpacked extension.

## Limitations
- This patch addresses the specific cross-context helper defect identified from the diagnostic result; it does not prove all DOM extraction paths work at runtime.
- No live Chrome runtime test has been performed.
- No automatic course navigation/traversal across courses is implemented.
- Parallel self-study classification is not independently proven by LoiLoNote metadata; ambiguous courses must remain unscanned.
- Folder traversal remains experimental and does not retrieve full note/material bodies, images, handwriting, equations, PDFs, or attachments.
- No persistent queue/resume, incremental sync, or scheduled automatic start at login is implemented.

## Safety
- No form submission, sending, sharing, editing, deleting, moving, or other content mutation is added.
- No cookies, credentials, tokens, hidden application state, or external uploads are used.
- Only visible page content is read; downloaded data remains local.

## Status
**PARTIALLY VERIFIED.** The source-level defect is patched and static checks pass. A live Chrome capture is still required; full automatic class collection is not implemented.