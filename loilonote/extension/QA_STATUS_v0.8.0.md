# QA Status v0.8.0

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Implemented in this revision
- Archive capture schema advanced to `loilonote-local-archive-v6`.
- Current view classification added:
  - `standardNoteList` -> ノート
  - `sharedNoteList` -> 共有ノート
  - `submitBox` -> 提出箱
  - `timeline` -> タイムライン
  - `/material-box/` path -> 資料箱
- Query parameters are inspected only to classify the view; saved URL remains same-origin origin+pathname with query and fragment removed.
- Captures include visible known-section labels and a best-effort course-context string.
- Local archive reader accepts schema v6.
- Manifest and popup version updated to 0.8.0.

## Checks performed
- `popup.js`: JavaScript syntax parse PASS using `new Function`.
- `archive.js`: JavaScript syntax parse PASS using `new Function`.
- `manifest.json`: JSON parse PASS.
- GitHub updates returned commit SHAs.

## Not verified / not implemented
- No execution of the extension in the user's Chrome after this update.
- No runtime verification that all four tab parameter values match every LoiLoNote account/course.
- No automated traversal across all courses.
- No automated switching/capture of all four course sections.
- No recursive note/page/material extraction.
- No complete image, handwriting, equation, PDF, attachment, or timeline payload capture.
- No durable crawl queue, restart/resume, incremental synchronization, or scheduled unattended collection.
- No permission or access validation for shared notes and submission areas.

## Safety
- No Cookie, credential, token, or hidden application state collection added.
- No submission, sharing, editing, deleting, or moving actions added.
- No external upload added.
- Query and fragment values are not stored in captured page URLs.

## Status
**NOT COMPLETE.** This revision adds view classification metadata only. It does not fulfill the requested all-course/all-section archive. A real Chrome run and observed DOM/navigation evidence are required before implementing safe automated traversal.
