---
name: loop-debug
description: Research-driven debugging loop. Reproduces the bug as a failing test that fails for the reported reason, closes the causal chain with parallel read-only investigation, searches the codebase for the same class of defect, researches only when it changes the fix, then ships a minimal fix plus a runnable prevention guard after explicit approval. Use for regressions, flaky behavior, and production failures; fix trivial one-line bugs directly instead.
---

# loop-debug

Same controller model, state file, tier table, convergence rule, platform mapping, and final-response rule as `../loop-plan/SKILL.md`. Read that file first, then `../loop-plan/references/platforms.md`. This file lists only what differs.

## Contract

- No production change before a regression test or behavioral harness demonstrates the failure. If reproduction is impossible, say why and use the closest honest probe; never manufacture a red test.
- Every causal claim carries `path:line`, command output, a log, or a dated citation. Hypotheses are separate from evidence.
- The fix is the smallest coherent change that breaks the causal chain. Refactoring is reported, not done.
- Three failed fix attempts mean the design is wrong: stop, write what was learned, and ask the user before a fourth.

## State additions

`bug_signature` (inputs, precondition, expected, actual, environment, frequency, first known regression), `hypotheses[]`, `red_evidence`, `fix_attempts`. See `../loop-plan/references/state.md`.

## Phases

1. **Reproduce** → `phases/reproduce.md`. Signature, feedback loop, red evidence. Hard gate: no red, no phase 2.
2. **Investigate** → `phases/investigate.md`. Root-cause trace, impact scope, test audit, similar-case search; discriminating probes until one hypothesis explains the signature and the rest are disproven or recorded.
3. **Clarify** → `../loop-plan/phases/clarify.md`, limited to: user-visible acceptance beyond the red test, fix boundary, hotfix versus durable fix, whether prevention is in scope. Skip when inferable.
4. **Research** → `../loop-plan/phases/research.md`, scoped to: the fix idiom for this bug class, common false fixes, the cheapest prevention mechanism.
5. **Plan** → `phases/fix-plan.md`. Exactly three slices: regression, minimal fix, prevention guard.
6. **Gate** — show cause with evidence, red command and output, proposed diff boundary, prevention choice, risks. Approval words: `ship the fix`, `ship it`, `go`. If the user asked only for a diagnosis, stop here.
7. **Execute** → `../loop-plan/phases/execute.md` with the regression test locked before the worker starts and the revert proof mandatory.
8. **Verify** → `../loop-plan/phases/verify.md` plus: re-run the original reproduction on the user-visible path; confirm adjacent entry points from the impact scope still behave; confirm the prevention guard fails when the defect is reintroduced.

## Final response additions

Root cause with evidence, red and green commands with output, prevention added and what it catches, similar cases dispositioned, residual uncertainty. Never call a bug fixed because one unit test passes.
