# QA Status v0.8.5

Date: 2026-11-07
Branch: `feature/loilonote-extractor`

## Changes
- Improved the page-capture failure diagnostics.
- The capture routine now explicitly targets the top frame (`frameIds: [0]`) in the isolated execution world.
- Distinguishes injection exceptions, zero returned frames, missing/null execution results, and a failed lightweight diagnostic probe.
- If the main extraction result is empty, a minimal read-only probe reports document readiness, title, body presence, visible-text length, and origin/path only.
- No page data is sent externally by the extension.
- Bumped manifest and popup display version to 0.8.5.

## Static checks
- `popup.js` passes JavaScript syntax validation using `new Function(...)`.
- `manifest.json` parses as JSON and reports version 0.8.5.
- Popup HTML and manifest versions agree.

## Runtime verification
- **NOT PERFORMED.** The updated extension has not yet been reloaded and run in the user's Chrome session.
- The previously observed error was `ページ内容を読み取れませんでした。`; its precise underlying cause is not yet known.
- The updated diagnostics are intended to expose that cause on the next attempt.

## Known limitations
- A successful page capture is not proof of complete archival.
- The visible course list currently includes a separate 「自主学習」 entry, but does not prove which other classes are parallel self-study classes.
- Class scope identification remains fail-closed; uncertain classes must not be traversed.
- Automatic traversal of all normal classes, full note/card content, images, handwriting, equations, PDFs, and attachments is not implemented.
- Persistent resume, incremental sync, and unattended startup after login are not implemented.
- Folder traversal remains experimental and is not certified by live runtime testing.

## Safety
- Read-only visible DOM extraction only.
- No form submission, sending, sharing, editing, deleting, moving, copying, or content mutation.
- No cookies, credentials, session tokens, hidden app state, or external uploads.
- The extension must not bypass LoiLoNote login or access controls.

## Status
**NOT COMPLETE.** Static validation passed. Live Chrome execution and end-to-end local file verification remain outstanding.
