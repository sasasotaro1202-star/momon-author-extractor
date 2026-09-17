#!/usr/bin/env python3
"""Resumable momon:GA metadata extractor.

Input: data/ids.txt (one moXXXXXXXX ID per line) or --ids-file.
Output: output/works.csv, output/authors.txt, output/failures.csv, output/summary.json.

The private mylist is used only to obtain saved IDs. Individual work pages are fetched
from the public site. No author value is guessed when the site does not expose one.
"""
from __future__ import annotations

import argparse
import csv
import html as html_lib
import json
import random
import re
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ID_RE = re.compile(r"\bmo\d{5,}\b", re.I)
AUTHOR_RE = re.compile(r"【作者】\s*(.*?)\s*【タグ】", re.S)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)


def clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = html_lib.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def fetch(url: str, timeout: float, retries: int, base_delay: float) -> str:
    last = None
    for attempt in range(retries + 1):
        try:
            req = Request(url, headers={"User-Agent": "momon-author-extractor/1.0"})
            with urlopen(req, timeout=timeout) as r:
                return r.read().decode("utf-8", "replace")
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            last = exc
            if attempt >= retries:
                break
            delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
            time.sleep(min(delay, 30.0))
    raise RuntimeError(str(last))


def parse_page(page: str) -> tuple[str, str]:
    tm = TITLE_RE.search(page)
    am = AUTHOR_RE.search(page)
    title = clean(tm.group(1)) if tm else ""
    author = clean(am.group(1)) if am else ""
    return title, author


def load_ids(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    ids = list(dict.fromkeys(ID_RE.findall(text)))
    if not ids:
        raise SystemExit(f"No momon IDs found in {path}")
    return ids


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids-file", default="data/ids.txt")
    ap.add_argument("--output-dir", default="output")
    ap.add_argument("--checkpoint", default="output/checkpoint.json")
    ap.add_argument("--timeout", type=float, default=20)
    ap.add_argument("--retries", type=int, default=5)
    ap.add_argument("--delay", type=float, default=0.35)
    ap.add_argument("--limit", type=int, default=0, help="0 = all")
    args = ap.parse_args()

    ids = load_ids(Path(args.ids_file))
    if args.limit:
        ids = ids[:args.limit]

    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    checkpoint_path = Path(args.checkpoint)
    checkpoint_path.parent.mkdir(parents=True, exist_ok=True)

    if checkpoint_path.exists():
        try:
            checkpoint = json.loads(checkpoint_path.read_text(encoding="utf-8"))
        except Exception:
            checkpoint = {}
    else:
        checkpoint = {}
    records = checkpoint.get("records", {})
    failures = checkpoint.get("failures", {})

    for pos, work_id in enumerate(ids, 1):
        if work_id in records:
            continue
        title = author = ""
        errors = []
        # Try both known page families. We continue to the fallback whenever the
        # primary page has no explicit author field, even if it has a title.
        for kind in ("fanzine", "magazine"):
            url = f"https://momon-ga.com/{kind}/{work_id}/"
            try:
                page = fetch(url, args.timeout, args.retries, args.delay)
                t, a = parse_page(page)
                if not title and t:
                    title = t
                if a:
                    author = a
                    break
            except Exception as exc:
                errors.append(f"{kind}: {exc}")

        records[work_id] = {"id": work_id, "title": title, "author": author}
        if not author:
            failures[work_id] = {
                "id": work_id,
                "title": title,
                "error": "; ".join(errors) or "author field not found",
            }
        else:
            failures.pop(work_id, None)

        checkpoint = {"version": 1, "total": len(ids), "records": records, "failures": failures}
        checkpoint_path.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[{pos}/{len(ids)}] {work_id} author={author or '(not found)'}", flush=True)
        time.sleep(args.delay)

    ordered = [records[x] for x in ids if x in records]
    with (out / "works.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "title", "author"])
        w.writeheader()
        w.writerows(ordered)

    authors = []
    for r in ordered:
        a = r["author"].strip()
        if a and a not in authors:
            authors.append(a)
    (out / "authors.txt").write_text(
        "\n".join(f"{i}. {a}" for i, a in enumerate(authors, 1)) + "\n",
        encoding="utf-8",
    )

    with (out / "failures.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "title", "error"])
        w.writeheader()
        w.writerows(failures.values())

    summary = {
        "expected": len(ids),
        "records": len(ordered),
        "authors_unique": len(authors),
        "failures": len(failures),
        "authorless": sum(not r["author"] for r in ordered),
        "complete": len(ordered) == len(ids) and not failures,
    }
    (out / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
