# QA Status v0.8.3

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Scope change implemented
- Only normal classes are in scope.
- Classes explicitly labelled 「自主学習と並行した授業」 are out of scope.
- Course candidates that cannot be positively verified as normal classes are marked 「判定保留」 and are not automatically clicked or traversed.
- If the exact exclusion phrase is visible in the page body, manual page capture is blocked and folder scanning is blocked.
- No class candidate is clicked by the course-home inventory.

## Static implementation checks
- Added visible ancestor-context text to candidate diagnostics (bounded to four ancestors / 1,200 chars).
- Added per-candidate `scopeStatus` and `scopeReason`.
- Added `view.courseScope` summary counts.
- Added fail-closed block for the exact visible exclusion phrase in page capture and folder scan.
- Manifest version updated to 0.8.3.

## Current read-only browser observation
- The visible course-home text contains ordinary course names and a separate 「自主学習」 entry, but does not show the exact phrase 「自主学習と並行した授業」.
- This text-only observation does not establish which lesson, if any, is conducted concurrently with self-study. No course was opened or clicked. The DOM relationship and reliable exclusion marker remain unverified.

## Important limits / not verified
- The actual UI wording and DOM placement of the label 「自主学習と並行した授業」 have not been confirmed in a live Chrome capture.
- Exact-phrase detection can miss alternate wording, icons, badges outside the inspected ancestor chain, or labels rendered in another screen.
- Candidates not positively identified as excluded remain 「判定保留」; they are not proven normal classes.
- No automatic course navigation or class traversal is implemented.
- No Chrome runtime test has been performed for v0.8.3.
- No full note/card, image, handwriting, formula, PDF or attachment extraction.
- No persistent crawl queue/resume, incremental sync, or scheduled unattended operation.
- Existing folder crawler remains experimental and must be tested on a small, confirmed normal-class scope first.

## Safety
- Read-only archive behavior remains; no submit/send/share/edit/delete/move/copy/use action is introduced.
- No cookies, credentials, tokens, hidden app state or external uploads.
- Self-study-parallel lessons are explicitly out of scope; ambiguous class identity fails closed.

## Status
**NOT COMPLETE.** The scope policy is implemented in code, but real UI marker detection and runtime behavior are unverified. Do not claim all normal classes have been archived.
