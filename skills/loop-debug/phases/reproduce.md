# Reproduce

Goal: red evidence that fails for the reported reason.

## Signature

Extract `bug_signature` from the report: triggering inputs, precondition, expected result, actual result or error, environment (runtime, versions, data set), frequency, first known regression if any. If a field cannot be extracted and cannot be found in the repository or logs, ask the user once, for that field only.

## Feedback loop

Pick the strongest loop that exists; do not build a weaker one when a stronger seam is available:

1. deterministic failing test at a public seam;
2. CLI or HTTP invocation with a fixture and a known-bad input;
3. replay of a captured trace, log, or event sequence;
4. throwaway harness calling the broken unit directly;
5. bounded repetition (run N times) for flaky bugs, with the nondeterminism source controlled;
6. bisection between a known-good and known-bad commit;
7. differential run of two versions on the same input.

For a test, delegate the test author with the signature by value and this addendum: the test must fail with the reported symptom, not with an unrelated error; expected values are derived independently of the implementation; if it passes, report `BUG_NOT_REPRODUCED`. Inspect the oracle yourself before accepting it.

Run the loop. Record the exact command and the failure output as `red_evidence`. If it passes, stop: the report is stale, the environment differs, or the reproduction is wrong; surface which.

If no honest seam exists, record that as a structural finding (it becomes a prevention candidate) and proceed with the best available loop, labeling what remains unverified.

## Lock

Lock the regression test files (`test-integrity.py snapshot --task T0a --files <paths>` when available) so the worker cannot weaken them.
