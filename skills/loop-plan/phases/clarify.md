# Clarify

Goal: turn the irreducible decisions into an observable contract.

## Questions

Ask at most four, in one message, only about what the repository and current sources cannot answer: product scope, compatibility promise, externally owned behavior, persistence policy, risk tolerance, quality bar. Multiple choice with the recommended option first; free-form is accepted. Never ask whether to inspect a file, never ask "does the plan look good" (that is the gate), never reference plan content the user has not seen.

Skip this phase entirely when the task statement plus exploration already answer everything. Record `stopping_reason: "no irreducible questions"`.

## must_haves

Convert answers and the task statement into `must_haves`:

```
truths:    observable statements that can be checked ("POST /orders with an expired card returns 402 and no order row")
artifacts: files or outputs that must exist and be substantive ({path, provides})
key_links: wiring that must carry real data ({from, to, via})
```

Rewrite any vague criterion ("better", "robust", "works") into an observable one, or ask the user to define it. Do not leave this phase with an empty `truths` list.

If the project keeps architecture decision records (`.claude/decisions/`, `docs/adr/`, `docs/decisions/`), note which answers are architecture decisions; the plan phase writes them as ADRs in that convention. Do not invent a convention.

Write answers verbatim under `## Clarifications` in the plan file.
