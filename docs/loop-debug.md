# loop-debug

Invoke: `/loop-skills:loop-debug <bug report>` (Claude Code), `$loop-debug <bug report>` (Codex), `loop-debug` (Pi).

## Contract

1. **Red first.** The bug is reproduced with the strongest available feedback loop (test, CLI or HTTP call, trace replay, harness, bounded repetition for flaky bugs, bisection, differential run). The failure must match the reported symptom. No red, no fix.
2. **Cause, not symptom.** Parallel read-only investigators trace the causal chain, map the impact scope, and audit the tests that should have failed. Hypotheses carry a cheap discriminator and are proven or disproven by probes, not by asking.
3. **Same class elsewhere.** The confirmed cause is searched across the codebase; every hit is dispositioned.
4. **Three slices.** Regression test (locked), minimal fix (only the causal chain), prevention guard (a runnable artifact: contract or property test, type constraint, lint rule, boundary validation, fixture).
5. **Proof.** After the fix: regression green, revert-the-fix check red, neighbors green, the guard fails when the defect is reintroduced, the original reproduction re-run on the user-visible path.
6. **Three failed fixes stop the loop.** The design is questioned with the user before a fourth attempt.

## Phases

Reproduce → Investigate → Clarify (only acceptance, fix boundary, hotfix vs durable, prevention scope) → Research (only if it changes the fix) → Fix plan → Gate → Execute → Verify. Shares tiers, state, execution, and verification with loop-plan; see `skills/loop-debug/SKILL.md`.

## When not to use it

A typo, a one-line local fix with an obvious cause: fix it directly and run the focused test.
