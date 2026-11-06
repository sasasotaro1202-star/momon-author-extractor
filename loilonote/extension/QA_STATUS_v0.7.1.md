# v0.7.1 QA status and known blockers

Date: 2026-11-07
Branch: feature/loilonote-extractor

## Code-side checks completed

- `popup.js` parses with JavaScript syntax validation.
- `manifest.json` parses as JSON and reports version 0.7.1.
- The popup includes the folder scan control.
- The folder scan records folder icon count, detected folder count, and folder element diagnostics.
- If the detected folder count differs from the visible folder icon count, traversal stops and marks the scan incomplete.
- Traversal refuses to continue outside `/material-box/`.
- README and INSTALL identify v0.7.1 and retain the unverified-runtime limitation.

## Not verified

- Chrome extension installation or execution on the user's Mac.
- Actual LoiLoNote folder click targets and SPA navigation behavior.
- Whether all folder types use the `MaterialFolder` image naming convention.
- Whether `history.back()` reliably restores each folder list in the current LoiLoNote release.
- Whether the popup remains alive for a long traversal.
- Full subject enumeration from the account's true top-level materials page.
- Material body, image, attachment, PDF, handwriting, formula, and embedded content extraction.
- Restart/resume, reliable incremental sync, cloud backup, and 20:00 unattended execution.

## Operational blockers observed

- ChatGPT's connected Browser integration can read tabs but cannot click or navigate them.
- No Desktop Commander device is connected.
- TinyFish browser profiles currently have no `loilonote.app` sign-in recorded. TinyFish also has metered Agent and Browser usage; do not run it without explicit cost approval and a valid user-authorized signed-in profile.
- The existing 20:00 automation is enabled but has null next_run_time, null last_run_time, and no run history. Do not claim that scheduled collection is running.

## Acceptance criteria before calling the system complete

1. Install v0.7.1 in the user's actual Chrome and run a bounded test against one small folder tree.
2. Verify every visible folder icon is either identified exactly once or causes an explicit incomplete stop.
3. Verify no material, submit, send, share, edit, or delete control is activated.
4. Compare discovered folder names and counts against the live LoiLoNote UI.
5. Add and test material-level capture for text, images, files, and embedded content separately.
6. Verify stable IDs, deduplication, content hashes, revisions, retry/resume, and a complete coverage report.
7. Implement a background/service-worker based scheduler that can run without an open popup, and test its actual lifecycle. Chrome must be running and the LoiLoNote session valid.
8. Demonstrate a successful scheduled run with recorded evidence before reporting 20:00 automation as operational.

## Completion state

**NOT COMPLETE.** v0.7.1 adds bounded folder-map scanning and stronger incomplete-detection safeguards, but is not yet runtime-verified and does not collect each material's contents.
