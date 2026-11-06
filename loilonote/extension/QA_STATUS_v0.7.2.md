# QA status — LoiLoNote Local Reader v0.7.2

Date: 2026-11-07
Branch: feature/loilonote-extractor

## Change in this version

- The live Math I materials page exposed eight visible folder entries plus one folder-style icon in the subject/breadcrumb area ("数学(辻)").
- v0.7.1 counted all nine icons as folder icons and stopped because only eight clickable folder rows were recognized.
- v0.7.2 excludes folder-style icons that occur before the visible "資料を検索"/search input in document order. These are recorded as navigation/breadcrumb icons, not silently discarded.
- Folder icons after the search field must still resolve to a unique clickable ancestor and a readable label. Any unclassified or duplicate list icon stops the scan.
- If a page contains folder icons but no recognizable search field, the scan stops because navigation chrome and list entries cannot be distinguished safely.
- Each page records total icon count, detected folder count, excluded navigation icon count, unclassified icon count, search-field detection, and per-icon diagnostics.

## Static checks performed

- popup.js passed JavaScript syntax parsing with new Function.
- manifest.json updated to version 0.7.2.
- Popup, README, and INSTALL updated to describe the new behavior.
- GitHub updates returned commit SHAs.

## Runtime checks not performed

- v0.7.2 has not yet been reloaded or executed in the user's Chrome.
- The breadcrumb exclusion heuristic has not yet been verified against the live DOM through extension execution.
- Recursive navigation, history.back restoration, and full traversal remain unverified.
- Material-level content capture, images/files/PDF extraction, durable resume, incremental sync, and scheduled unattended execution remain unimplemented or unverified.

## Current status

**NOT COMPLETE.** This release fixes the known false-positive classification path at code level, but the runtime behavior still requires a test in the user's signed-in LoiLoNote Chrome session. It does not yet collect the contents of individual materials.
