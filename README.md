# LoiLoNote study-material reader

This repository is dedicated to a free, local-first reader for the user's LoiLoNote study materials.

The Chrome extension prototype is in `loilonote/extension/`. It captures visible text and same-origin links from the currently open LoiLoNote page and saves them as a local JSON file.

## Current limitations

- No automatic recursive traversal of every folder or material yet.
- Image, handwriting, attachment, and mathematical-expression extraction are not verified.
- The extension has not yet been tested in the user's Chrome installation.

## Privacy and safety

- Do not commit school materials, exported JSON, images, student information, passwords, cookies, or session tokens.
- Authentication stays in the user's normal browser session.
- Captured material remains local; this prototype does not upload it to a remote service.
- Read only content available through the normal user interface and follow school rules and LoiLoNote terms.

See `loilonote/README.md` for installation steps and implementation details.
