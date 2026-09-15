# Plan

Goal: a dependency-ordered task list that a fresh worker can execute without the conversation.

## Before writing

Reconcile the evidence ledger, record `stopping_reason` for exploration and research, and check `must_haves.truths` is non-empty. If a truth has no evidence-backed path to implementation, go back to explore or clarify.

## Task block

Every task uses this shape; placeholders (`TBD`, `add appropriate handling`, `similar to task N`) are plan failures.

```
### T<n> — <verb phrase>
Files: <exact paths to create or modify>
Depends on: <task ids or none>
Invariants: <what must remain true>
Tests: <test file(s)>; expected values derived independently of the implementation; validation command
Reviewer: spec | spec + quality | spec + quality + security
Rollback: <how to undo if verification fails>
Done when: <observable outcome, tied to a must_haves truth or key_link>
```

Tasks that legitimately need no tests (config-only, docs-only, generated code, formatter-only) say `Tests: none — <reason>`.

## Sections

`## Plan` in the plan file contains, in order:

1. Goal and `must_haves` (verbatim from state).
2. Architecture: layering and dependency direction in one line, state and error-handling pattern, new public interfaces sketched with params, invariants, and error modes. Prefer the repository's existing conventions; add no speculative abstraction.
3. Tasks (blocks above), then a stage boundary after any group whose truths can be verified independently.
4. Execution map: for each task, worker scope, reviewers, and whether it may run in parallel with another. Two tasks may run in parallel only if their `Files:` sets do not overlap and each gets its own worktree.
5. Rejected alternatives, only where they explain a consequential choice.
6. Residual unknowns and risks.

If the project keeps ADRs, write one per architecture decision from clarify in the project's convention (`new-adr.py` helps when `.claude/decisions/` exists).

## Self-review (one pass)

Check every task against `must_haves`: each truth has at least one task whose `Done when` demonstrates it; every `Files:` path exists or is created by an earlier task; no placeholder text; parallel pairs have disjoint files. Fix inline. Do not loop on self-review; the gate and the verifier are the next checks.

Emit `current_high=<N>` as the last line of the review: N is the count of unresolved items that would block execution.
