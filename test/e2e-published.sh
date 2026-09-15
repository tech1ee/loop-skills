#!/usr/bin/env bash
# E2E against the published npm tarball. Never touches the real ~/.claude.
# Usage: test/e2e-published.sh [version]   (default: version from VERSION)
set -uo pipefail

VERSION="${1:-$(cat "$(dirname "$0")/../VERSION")}"
PKG="loop-skills@$VERSION"
PASS=0; FAIL=0
pass() { PASS=$((PASS+1)); echo "  ✓ $*"; }
fail() { FAIL=$((FAIL+1)); echo "  ✗ $*"; }

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
export HOME="$WORK/home"; mkdir -p "$HOME"

echo "=== install $PKG into temp prefix ==="
npm install --prefix "$WORK" "$PKG" --silent >/dev/null 2>&1 && pass "npm install $PKG" || { fail "npm install $PKG"; exit 1; }
ROOT="$WORK/node_modules/loop-skills"
BIN="$ROOT/dist/src/install.js"

echo "=== package contents ==="
for f in VERSION .claude-plugin/plugin.json .claude-plugin/marketplace.json .codex-plugin/plugin.json .agents/plugins/marketplace.json hooks/hooks.json hooks/test-lock.py skills/loop-plan/SKILL.md skills/loop-debug/SKILL.md skills/loop-audit/SKILL.md agents/loop-verifier.md bin/test-integrity.py; do
  [ -f "$ROOT/$f" ] && pass "ships $f" || fail "missing $f"
done
[ -d "$ROOT/skills/pi" ] && fail "legacy skills/pi shipped" || pass "no legacy skills/pi"
[ -d "$ROOT/plugins" ] && fail "legacy plugins/ shipped" || pass "no legacy plugins/"
[ "$(cat "$ROOT/VERSION")" = "$VERSION" ] && pass "VERSION matches $VERSION" || fail "VERSION mismatch"

echo "=== bootstrap dry-run ==="
OUT=$(node "$BIN" --dry-run --all 2>&1)
for needle in "claude plugin marketplace add tech1ee/loop-skills" "claude plugin install loop-skills@loop-skills" "codex plugin marketplace add tech1ee/loop-skills" "codex plugin add loop-skills@loop-skills" "pi install npm:loop-skills"; do
  echo "$OUT" | grep -q "$needle" && pass "dry-run prints: $needle" || fail "dry-run missing: $needle"
done
[ -e "$HOME/.claude" ] && fail "dry-run wrote to ~/.claude" || pass "dry-run wrote nothing"

echo "=== bootstrap with fake CLIs ==="
mkdir -p "$WORK/fakebin"; LOG="$WORK/calls.log"
for cli in claude codex pi; do printf '#!/bin/sh\necho "%s $@" >> "%s"\n' "$cli" "$LOG" > "$WORK/fakebin/$cli"; chmod +x "$WORK/fakebin/$cli"; done
PATH="$WORK/fakebin:$PATH" node "$BIN" --platforms claude,codex --yes >/dev/null 2>&1 && pass "bootstrap exits 0" || fail "bootstrap failed"
grep -q "^claude plugin install loop-skills@loop-skills" "$LOG" && pass "ran claude install" || fail "claude install not run"
grep -q "^codex plugin add loop-skills@loop-skills" "$LOG" && pass "ran codex add" || fail "codex add not run"
grep -q "^pi " "$LOG" && fail "pi ran despite --platforms" || pass "pi skipped"

echo "=== hook ==="
mkdir -p "$WORK/locks/p/tdd-snapshots"; echo "$WORK/t.py:T1" > "$WORK/locks/p/tdd-snapshots/_active_task_files.txt"; touch "$WORK/t.py"
echo "{\"tool_input\":{\"file_path\":\"$WORK/t.py\"}}" | LOOP_SKILLS_LOCK_ROOT="$WORK/locks" python3 "$ROOT/hooks/test-lock.py" 2>/dev/null; [ $? -eq 2 ] && pass "hook blocks locked file" || fail "hook did not block"
echo "{\"tool_input\":{\"file_path\":\"$WORK/other.py\"}}" | LOOP_SKILLS_LOCK_ROOT="$WORK/locks" python3 "$ROOT/hooks/test-lock.py" 2>/dev/null; [ $? -eq 0 ] && pass "hook allows other file" || fail "hook blocked unlocked file"

echo; echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
