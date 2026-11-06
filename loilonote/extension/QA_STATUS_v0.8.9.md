# QA Status v0.8.9

Date: 2026-11-07

## Changes
- Added a fixed allowlist of the 18 normal classes explicitly confirmed by the user: LHR, 英語コミュニケーションI, 化学基礎, 家庭基礎, 現代の国語, 言語文化, 公共, 情報I, 数学A, 数学Ⅰ, 生物基礎, 地理総合, 美術, 物理基礎, 保健, 保健体育, 歴史総合, 論理・表現I.
- Replaced free-text class name and per-run checkbox with a dropdown.
- Folder scan rejects names outside the allowlist and still checks exact visible class-name match and the explicit parallel-self-study exclusion marker.
- Updated extension version and documentation to 0.8.9.

## Static verification
- popup.js parses with JavaScript syntax validation.
- Dropdown contains 18 classes.
- Old checkbox reference is absent from popup.js.
- manifest version is 0.8.9.

## Not verified / limitations
- No live Chrome runtime test of v0.8.9 has been performed.
- This is a class-scope allowlist, not an automatic 18-class traversal engine.
- Folder traversal remains user-initiated and one selected class at a time.
- Complete note/material body, original image, PDF, attachment, handwriting and formula capture is not implemented or verified.
- Resume queue, incremental sync and automatic start after login are not implemented.
- A visible exclusion phrase can stop a scan, but the absence of that phrase alone cannot prove platform-side class metadata. The user-confirmed allowlist is the scope authority.

## Safety
- Read-only visible page inspection; no form submission, sending, sharing, editing, deleting or moving.
- No cookies, credentials, session tokens or external uploads.

## Status
**SOURCE-VERIFIED / RUNTIME-PENDING.**
