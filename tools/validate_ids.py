#!/usr/bin/env python3
"""Strict, deterministic validation for the private-mylist ID export."""
from __future__ import annotations
import hashlib, json, re, sys
from pathlib import Path

ID_RE = re.compile(r"\bmo\d{5,}\b", re.I)
EXPECTED = 627

p = Path(sys.argv[1] if len(sys.argv) > 1 else "data/ids.txt")
text = p.read_text(encoding="utf-8", errors="strict")
ids = [x.lower() for x in ID_RE.findall(text)]
unique = list(dict.fromkeys(ids))
duplicates = sorted(set(x for x in ids if ids.count(x) > 1))

result = {
    "expected": EXPECTED,
    "raw_ids": len(ids),
    "unique_ids": len(unique),
    "duplicates": duplicates,
    "sha256": hashlib.sha256("\n".join(unique).encode()).hexdigest(),
    "valid": len(ids) == EXPECTED and len(unique) == EXPECTED and not duplicates,
}
Path("output").mkdir(exist_ok=True)
Path("output/input_manifest.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result, ensure_ascii=False, indent=2))
if not result["valid"]:
    raise SystemExit(1)
