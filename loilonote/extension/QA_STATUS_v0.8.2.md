# QA Status v0.8.2

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Public official documentation reviewed
- New note list and its four tabs: https://help.loilonote.app/--639a8dc295d052001e1c8e5f
- Timeline visibility and self-study limitation: https://help.loilonote.app/--5db137b424a5a40017bc6948
- Submission box collection and student/teacher visibility: https://help.loilonote.app/--5d3ab50d5cc14a00173c4159
- Submission box history and available operations: https://help.loilonote.app/--64f0354011716b001b8dae58
- Material export format and My Folder limitation: https://help.loilonote.app/--675bcebab7c72acff973cbf5

## v0.8.2 changes
- Recognizes the top-level `https://loilonote.app/_/` course-home page as `授業一覧` when visible text supports it.
- Adds a non-invasive inventory of clickable labels that also appear as exact visible body lines. These are candidates only, not verified course records.
- Candidate records include visible label, tag, role, sanitized same-origin href, class name and bounds.
- No candidate is clicked. No course ID is inferred.
- Archive schema advanced to `loilonote-local-archive-v7`; local archive reader accepts v7.

## Checks performed
- `popup.js`: JavaScript syntax parse PASS using `new Function`.
- `archive.js`: JavaScript syntax parse PASS using `new Function`.
- `manifest.json`: JSON parse PASS.
- GitHub updates returned commit SHAs.

## Not implemented / not verified
- The current browser context is the course-home page. No actual course was opened by the assistant; Browser integration is read-only.
- Candidate inventory has not been runtime-tested in Chrome and may include non-course clickable labels or omit course cards.
- No automatic course traversal, tab switching, note/card traversal, or full payload capture.
- No complete extraction of handwriting, formulas, images, PDFs, attachments or proprietary export formats.
- No durable crawl queue/resume, incremental sync, or scheduled unattended operation.
- Timeline visibility depends on role and whether the student was enrolled at the time.
- Timeline is unavailable in self-study notebooks according to official help.
- Official material-box export is limited to My Folder; other folders may require user-authorized copying and cannot be assumed exportable.
- Shared-note access depends on assigned permissions.
- Submission-box content can contain other students' work and must be handled under school policy; this extension does not mass-select, copy, use, submit or share answers.

## Safety
- No Cookie, credentials, tokens, hidden app state or external uploads.
- No submission, send, share, edit, delete, move, copy or "use" action.
- Course candidates are diagnostic only; no navigation is automated by this revision.

## Status
**NOT COMPLETE.** This release only inventories likely course links on the course-home page. Real Chrome runtime evidence is required before safe automated course traversal can be implemented.
