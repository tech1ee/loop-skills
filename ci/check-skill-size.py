#!/usr/bin/env python3
"""Fail when a skill file grows past the budget that keeps invocation cheap."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIMITS = {"SKILL.md": 25_000, "phases": 12_000, "references": 12_000}


def limit_for(path: Path) -> int:
    if path.name == "SKILL.md":
        return LIMITS["SKILL.md"]
    return LIMITS[path.parent.name] if path.parent.name in LIMITS else LIMITS["references"]


def main() -> int:
    failures = []
    for path in sorted((ROOT / "skills").rglob("*.md")):
        size = path.stat().st_size
        cap = limit_for(path)
        if size > cap:
            failures.append(f"{path.relative_to(ROOT)}: {size} bytes > {cap}")
    if failures:
        print("\n".join(failures))
        return 1
    total = sum(p.stat().st_size for p in (ROOT / "skills").rglob("*.md"))
    print(f"skill files within budget (total {total} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
