# loop-plan

Invoke: `/loop-skills:loop-plan <task>` (Claude Code), `$loop-plan <task>` (Codex), `loop-plan` (Pi), or describe the task and let the agent pick it.

## Phases

| phase | what happens | exit |
|---|---|---|
| Seed | slug, state files, tier, success criteria, repository instructions read | state written |
| Explore | read-only explorers per tier; evidence ledger; impact-closure checklist | closure true, two empty rounds, or budget |
| Clarify | ≤ 4 questions the code cannot answer → `must_haves` | truths non-empty |
| Research | only for design-changing external facts; dated primary sources | budget or closure |
| Plan | task blocks with files, invariants, independent tests, reviewer, rollback | self-review `current_high=0` |
| Gate | summary, risks, next action; approve with `ship it` / `go` | explicit approval |
| Execute | fresh worker per task; reviewers by tier; checkpoint per task | all tasks done |
| Verify | four-level artifact check, behavioral probes, revert proof | `passed` |

## Tiers

`quick` for small, well-understood changes; `standard` for most feature work; `high-risk` for auth, payments, data migrations, concurrency, or load-bearing modules. Tier sets fan-out, research budget, and execution gates (see the table in `skills/loop-plan/SKILL.md`). Changing tier mid-loop requires a written reason.

## State

`<plan dir>/<slug>.md` and `<slug>.state.json`; plan dir is `~/.claude/plans/` on Claude Code, `.codex/loop/` on Codex, `.pi/plans/` on Pi. Re-invoke with the same slug to resume. Field reference: `skills/loop-plan/references/state.md`.

## Tips

- Give the goal as an outcome ("orders with an expired card are rejected with 402"), not a solution.
- If the loop asks a question you think the code answers, say "look it up" and it must.
- Say "plan only" to stop at the gate.
- Use `bin/loop-plan-audit.py` to see shipped / stalled / abandoned rates across your state files.
