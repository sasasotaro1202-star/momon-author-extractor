# LoiLoNote Auto-Crawler Architecture Research

Status: design research only. This document does not claim that automated collection is implemented or tested.

## Goal

After one-time installation and user-initiated start, enumerate the user's accessible LoiLoNote subject folders and nested material folders, capture material metadata/content where available, maintain versioned local archives, and support a daily refresh while Chrome is running and the user remains signed in.

## External implementation references reviewed

- `VorticonCmdr/dragon` (Apache-2.0): separates crawl queue/orchestration from extraction, supports autonomous recursive discovery, bounded page limits, retry/delay controls, saved crawl state, and scheduled work via `chrome.alarms`. Useful architectural pattern; its generic URL-fetch crawler is not directly suitable for a JavaScript-rendered authenticated learning app.
  - https://github.com/VorticonCmdr/dragon
- `shahriar-ahmed-seam/SiteBlueprint-Chrome-Extension` (MIT): demonstrates a full-tab dashboard, bounded recursive traversal, explicit crawl limits/delays, and a rendered-page capture mode for SPAs. Its cookie/session forwarding and broad website mirroring behavior are intentionally NOT adopted.
  - https://github.com/shahriar-ahmed-seam/SiteBlueprint-Chrome-Extension
- `fcavallarin/htcrawl`: demonstrates headless-Chrome-driven recursive SPA crawling. Its Puppeteer architecture is a reference only; it cannot be assumed available in the user's local Chrome extension environment.
  - https://github.com/fcavallarin/htcrawl
- Chrome Extensions documentation: Manifest V3 content scripts are the supported mechanism for observing/manipulating matched page DOM; a service worker handles extension background events.
  - https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts
  - https://developer.chrome.com/docs/extensions/develop/migrate/manifest

## Required architecture for this project

1. **LoiLo adapter (site-specific):** detect the material-box page, extract the current folder's visible child entries, distinguish folders from materials, preserve folder names and available IDs/paths, and report ambiguous entries rather than guessing.
2. **Bounded traversal engine:** breadth-first queue, visited-key deduplication, maximum folder/material counts, per-navigation timeout, retry budget, polite delay, pause/resume, and explicit stop. Never click submit/share/delete/edit/send controls.
3. **SPA navigation controller:** observe URL and DOM changes; use only confirmed folder-entry controls from diagnostic evidence. After each visit, return to the parent and verify the expected parent identity before continuing. If navigation state cannot be verified, stop that branch.
4. **Material capture pipeline:** metadata, rendered text, images, attachments, and screenshots recorded as separate capture dimensions. A text-only or thumbnail-only capture must not be labeled a complete material capture.
5. **Local archive/index:** stable item key, subject/folder ancestry, source URL path, observed update time, capture time, content hash, version history, extraction warnings, and retry state. Store large blobs separately from the index.
6. **Daily scheduler:** `chrome.alarms` may schedule a local extension job, but execution requires Chrome to be running, the extension enabled, and a valid signed-in LoiLoNote tab/session. Missed runs must be reported, not fabricated.
7. **Audit/reporting:** subject-level coverage states: confirmed-empty, captured, partial, failed, and not-visited. Report discovered vs captured counts and exact failure reasons.

## Safety and privacy constraints

- Operate only in the user's already authenticated, ordinary browser session; do not request or export passwords, cookies, auth tokens, or local storage secrets.
- Do not bypass login, CAPTCHA, access controls, school restrictions, or platform safeguards.
- Do not use hidden/private API endpoints unless their use is explicitly documented and authorized for this purpose.
- Read-only operations only. Never submit, send, share, edit, move, or delete LoiLoNote content.
- Local-first storage. No cloud upload unless the user explicitly authorizes a specific destination and upload scope.
- Respect platform usage rules; use sequential, rate-limited navigation rather than parallel requests against the learning service.

## Evidence needed before enabling traversal

The current v0.6.0 diagnostic capture records visible controls' text, role, class, data attributes, and sanitized outerHTML. That evidence must be collected from a real LoiLoNote folder page before writing site-specific selectors or click logic. The current browser connector is read-only and cannot provide those DOM attributes; no connected desktop device is currently available.

## Acceptance tests

- Folder traversal visits every discovered child folder exactly once and verifies parent/child identity on return.
- Materials are deduplicated by stable key; changed content creates a new revision, unchanged content does not.
- Navigation timeout, login redirect, unexpected modal, unknown control, and quota/storage errors stop safely and are visible in the report.
- No non-folder action is clicked.
- Restart/resume continues from persisted queue state without repeating completed work.
- Scheduled run records success only after an actual completed run; unavailable browser/session is recorded as skipped/unavailable.
- Test with a small explicitly bounded sample before enabling all-subject traversal.

## Current implementation gap

The repository's v0.6.0 extension still captures only the currently displayed page after a manual click. It does not yet implement this architecture. In particular, the exact LoiLoNote folder-entry DOM structure and material download behavior remain unverified.
