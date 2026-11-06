# QA Status v0.8.1

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Public documentation research
Official LoiLoNote support pages reviewed:
- New note list: four tabs are ノート / 共有ノート / 提出箱 / タイムライン.
- Shared notes have permission levels; viewing and writing are distinct.
- Submission boxes contain submitted answers and may include history, sharing and teacher feedback.
- Timeline content differs by role: teachers may see all class exchanges; students see items addressed to them. Students who joined later may not see earlier history.
- Official note export uses `.loilonote`; material-box export uses `.loilomaterials`. These are distinct formats. The help page says exported data cannot be inspected simply by opening the downloaded file.
- Material-box folders include different visibility scopes (e.g. personal, teacher-only, school-shared); recursive visibility cannot be assumed.

## Changes in v0.8.1
- Capture classification now reconciles visible active-tab signals, title/heading signals and URL tab hint.
- If signals conflict, category is set to `判定保留` instead of trusting URL query alone.
- Query parameter is used only as a weak classification hint and is not stored in saved URL.
- Popup and docs version updated.

## Static checks performed
- `popup.js`: JavaScript syntax parse PASS using `new Function`.
- `archive.js`: JavaScript syntax parse PASS using `new Function`.
- `manifest.json`: JSON parse PASS.
- GitHub update calls returned commit SHAs.

## Not implemented / not verified
- No runtime test of v0.8.1 in user's Chrome.
- No verified mapping of the app's actual active-tab DOM across all four tabs and all courses.
- No automatic traversal across courses or across the four tabs.
- No permission-aware traversal of shared notes.
- No submission-box history/card payload extraction.
- No complete timeline extraction; account role and late-join visibility limit what exists in the user's view.
- No parsing of proprietary `.loilonote` / `.loilomaterials` export files. Preserve originals; do not claim JSON capture equals official export.
- No full card-level extraction of handwriting, equations, embedded media, PDFs, or attachments.
- No durable queue/resume, incremental synchronization, or scheduled unattended collection.
- No confirmation that the user account is allowed to export all relevant course content.

## Safety
- No Cookie, credentials, token, hidden application state or external upload added.
- No submit/send/share/edit/delete/move action added.
- Automated folder navigation remains bounded and user-started.
- Do not scrape inaccessible data or bypass permission restrictions.

## Status
**NOT COMPLETE.** This revision improves classification safety and documents the official export route. The full all-course/all-section archive requires observed Chrome DOM evidence, account permission checks, and runtime verification.
