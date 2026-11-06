# QA Status v0.8.11

## Checks performed
- Manifest version is 0.8.11.
- popup.js passed a JavaScript syntax check using the Function constructor.
- Popup has a fixed selection list of 18 confirmed normal classes.
- Manifest has no background service worker and no content scripts.
- Current permissions: activeTab, scripting, downloads, storage; host permission: https://loilonote.app/*.
- README has been reconciled with the actual feature boundaries.

## Not verified
- Chrome installation and runtime execution.
- Actual folder traversal in the user's LoiLoNote account.
- Material-body, image, PDF, or attachment extraction.
- Automatic traversal of all 18 classes.
- Automatic start after Chrome launch or LoiLoNote login.
- Resume after browser restart.
- Storage quota behavior for a full archive.

## Release assessment
NOT COMPLETE / NOT PRODUCTION-VERIFIED.

v0.8.11 includes release metadata and documentation corrections. It does not implement full automatic archiving. The manifest has no service worker or content scripts, so automatic post-login operation cannot occur in this version. Do not represent full automatic traversal as implemented until real page behavior is inspected and tested.

## Safety invariants
- No credential, cookie, session-token, or hidden application-state extraction.
- No external transmission of school materials.
- No submit, send, share, edit, or delete actions.
