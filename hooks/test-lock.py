#!/usr/bin/env python3
import glob
import json
import os
import sys

lock_root = os.environ.get("LOOP_SKILLS_LOCK_ROOT") or os.path.join(os.path.expanduser("~"), ".claude", "projects")
try:
    target = json.load(sys.stdin).get("tool_input", {}).get("file_path", "")
except Exception:
    sys.exit(0)
if not target:
    sys.exit(0)
target = os.path.realpath(target)

for lock_file in glob.glob(os.path.join(lock_root, "*", "tdd-snapshots", "_active_task_files.txt")):
    try:
        lines = open(lock_file, encoding="utf-8").read().splitlines()
    except OSError:
        continue
    for line in lines:
        if not line.strip():
            continue
        locked, _, task = line.rpartition(":")
        if not locked:
            locked, task = task, "unknown"
        if os.path.realpath(locked) == target:
            print(
                f"BLOCKED: {target} is locked during TDD implementation (task {task}). "
                f"Release with: test-integrity.py verify --task {task}",
                file=sys.stderr,
            )
            sys.exit(2)
sys.exit(0)
