# QA status — LoiLoNote Local Reader v0.7.3

Date: 2026-11-07
Branch: feature/loilonote-extractor

## v0.7.3 changes

- Replaced the DOM-order-only breadcrumb heuristic with a visible-screen geometry check: folder-style icons at or above the unique visible search field are classified as navigation/breadcrumb candidates, not list folders.
- Require exactly one visible search field when folder icons are present. Zero or multiple matches fail closed.
- Record search-field count and bounds, plus per-icon classification reason and coordinates.
- Before each folder click, re-read the current list and require the target at the same index to retain the expected label and href.
- Require the click target to remain connected and visible. Stop without clicking if the page structure or target identity changes.

## Static checks performed

- Source anchors for geometry-based classification, unique search field, pre-click identity comparison, and connected/visible target checks are present in the committed source.
- Manifest and user-facing documentation version strings updated to 0.7.3.
- GitHub writes returned commit and content SHAs.

## Runtime checks not performed

- The extension has not been reloaded or executed in the user's Chrome after this change.
- The geometry threshold has not been tested against all LoiLoNote screen sizes or responsive layouts.
- The current live page text confirms the subject/breadcrumb label 数学(辻) and its folder icon appear before the search field, while eight folder entries appear below it. This supports the intended classification for the observed page, but does not prove the injected extension will identify every DOM node correctly.
- Recursive navigation, back restoration, all-subject traversal, material-level capture, file/PDF/image extraction, durable resume, incremental sync, and scheduled unattended execution remain unimplemented or unverified.

## Current status

**NOT COMPLETE.** v0.7.3 hardens folder-vs-breadcrumb classification and prevents a click when the folder identity changes between discovery and execution. Runtime verification in the user's signed-in Chrome session is still required. 数学(辻) is not excluded as a subject: only its breadcrumb representation is excluded from folder traversal.
