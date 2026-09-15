# Verify

Goal: prove the goal, not the task list.

## Verifier

Delegate a fresh, read-only verifier (the `loop-verifier` agent where available, otherwise a reviewer with Bash) that receives `must_haves` by value and the repository path. It starts from "not achieved" and returns `passed`, `gaps_found <list>`, or `human_needed <reason>`.

## Four-level artifact check

For every `artifacts[]` entry and every `key_links[]` entry:

1. Exists.
2. Substantive: not a stub, placeholder, or tautology.
3. Wired: callers, exports, configuration, and runtime entry points reach it.
4. Observed: a behavioral probe shows real data or user-visible behavior crossing the link.

## Behavioral probes

For every `truths[]` entry, run the cheapest command that could falsify it: the focused test, an HTTP call, a CLI invocation, a script. For regression tests, apply the revert proof: revert the fix, the test must fail; restore, it must pass. A green suite is evidence, not proof.

## Verdict handling

- `passed` → set `status: shipped`, append `## Verification` with commands and results.
- `gaps_found` → append the gaps, generate one closure task per gap, execute them, re-run the verifier once. A second `gaps_found` surfaces to the user.
- `human_needed` → surface with the exact question; never set `shipped` unilaterally.

Then inspect the final diff for scope creep, secrets, and unrelated changes, run the broader suite proportionate to blast radius, and write the final response per `SKILL.md`.
