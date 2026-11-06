# LoiLoNote study-material reader

This repository is being repurposed for a free, local-first LoiLoNote study-material reader.

The current prototype is developed on the `feature/loilonote-extractor` branch in `loilonote/`. It reads visible page text and same-origin links from the currently open LoiLoNote page and saves a local JSON file.

It does not yet crawl all folders or extract all cards, images, handwriting, attachments, or mathematical notation. Those capabilities require testing against the actual LoiLoNote UI.

## Privacy and safety

- Never commit school materials, exported JSON, images, student data, passwords, cookies, or session tokens.
- Authentication remains in the user's normal browser session.
- The prototype reads visible page content only and does not upload captured material to an external server.
- Follow school rules and LoiLoNote terms; do not bypass access controls.

See [`loilonote/README.md`](loilonote/README.md) on the development branch for installation and current limitations.
