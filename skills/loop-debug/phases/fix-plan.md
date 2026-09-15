# Fix plan

Goal: three slices a fresh worker can execute, tied to the confirmed cause.

Use the task block from `../../loop-plan/phases/plan.md`. Exactly these tasks:

### T0a — regression
The red test from reproduce, already locked. `Done when`: it fails before the fix for the reported reason and passes after; the revert proof holds.

### T-fix — minimal fix
Files limited to the confirmed causal chain. Invariants: no behavior change outside the signature; no refactoring (report it). `Tests`: T0a plus the neighboring tests the audit named. Reviewer: spec (and quality at standard+, security at high-risk). Rollback: revert the commit. `Done when`: T0a green, neighbors green, impact-scope entry points re-checked.

### T0b — prevention guard
A runnable artifact, not prose: contract or property test for the invariant, type constraint that makes the bad state unrepresentable, lint rule, boundary validation, or fixture that reproduces the class. Include the similar cases marked "same defect". `Done when`: the guard fails when the defect is reintroduced (demonstrate by temporarily reverting T-fix or by a mutant) and passes on the fixed code. At `quick` tier, or when the user scoped prevention out, T0b is emitted as a recommendation only.

`must_haves` for the loop: truths = T0a green and the user's acceptance criterion; artifacts = test file, fixed file, guard; key_links = reproduction → cause → fix → green → guard.

Self-review once: the fix touches only files implicated by the confirmed hypothesis; T0a asserts the reported symptom, not "no crash"; the guard covers the class, not just the instance. Emit `current_high=<N>`.
