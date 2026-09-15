#!/usr/bin/env python3
"""Keep VERSION and every manifest in agreement.

  version-sync.py --check   exit 1 when any manifest disagrees with VERSION
  version-sync.py --write   rewrite every manifest version from VERSION
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION = (ROOT / "VERSION").read_text().strip()

MANIFESTS = {
    "package.json": ("version",),
    ".claude-plugin/plugin.json": ("version",),
    ".codex-plugin/plugin.json": ("version",),
    ".claude-plugin/marketplace.json": ("plugins", 0, "version"),
}


def read(path: Path) -> dict:
    return json.loads(path.read_text())


def get(doc: dict, keys: tuple) -> str:
    node = doc
    for key in keys:
        node = node[key]
    return node


def put(doc: dict, keys: tuple, value: str) -> None:
    node = doc
    for key in keys[:-1]:
        node = node[key]
    node[keys[-1]] = value


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else "--check"
    drift: list[str] = []
    for rel, keys in MANIFESTS.items():
        path = ROOT / rel
        doc = read(path)
        current = get(doc, keys)
        if current == VERSION:
            continue
        if mode == "--write":
            put(doc, keys, VERSION)
            path.write_text(json.dumps(doc, indent=2) + "\n")
            print(f"updated {rel}: {current} -> {VERSION}")
        else:
            drift.append(f"{rel}: {current} != {VERSION}")
    if drift:
        print("\n".join(drift))
        return 1
    print(f"all manifests at {VERSION}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
