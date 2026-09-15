# Execute

Goal: ship each task in a fresh context, keep the controller small, keep the tests honest.

## Controller loop

For each task in dependency order whose status is not `done`:

1. Mark `running`, write the checkpoint (task id, attempt, started_at).
2. **Test author (standard and high-risk):** delegate a test author that receives the task's `Tests:` line and behaviors by value, writes only test files, and proves them red with the validation command. Lock those files (`test-integrity.py snapshot --task <id> --files <paths>` when available; on platforms without the hook, the post-check below still detects tampering).
3. **Worker:** delegate one worker with the task block by value, the repository conventions, and the prohibition on unrelated cleanup. The worker returns one of `DONE`, `DONE_WITH_CONCERNS <text>`, `NEEDS_CONTEXT <question>`, `BLOCKED <reason>`. `NEEDS_CONTEXT` is answered from the plan or state, never by guessing; `BLOCKED` twice stops the loop and surfaces to the user.
4. **Checks:** run the validation command; `test-integrity.py verify --task <id>` when locked; on any red, redispatch the worker once with the failure output, then stop and surface.
5. **Reviewers (fresh contexts, read-only):** spec reviewer confirms the diff matches the task and the related truths, rejecting extras as well as gaps; quality reviewer (standard+) checks naming, duplication, dead code, tautological tests, mock-heavy tests; security reviewer (high-risk) on auth, secrets, data handling. Findings with a concrete location are fixed by a redispatched worker; the same reviewer re-checks once.
6. **Mutation (standard+ when a mutation tool exists for the stack):** run it on the touched tests; the post-change score must be ≥ the pre-change baseline recorded at task start. Below baseline is a hard stop.
7. **Cross-vendor review (high-risk):** ask a second model or vendor reviewer to review the task diff (whatever the platform offers, e.g. a Codex review command in Claude Code). Advisory; disagreement is the signal, agreement proves nothing.
8. Mark `done`, write the checkpoint, append a one-line entry to `## Execution log` in the plan file.

Parallel tasks are allowed only for pairs the plan marked parallel, each in its own worktree; the controller merges sequentially. The controller is the only writer of state and plan files.

## Stage boundaries

At each stage boundary in the plan (and at the end), run `phases/verify.md` for the truths assigned to that stage before starting the next.

## Context discipline

Workers and reviewers never receive the conversation; they receive the task block, file list, and conventions by value. The controller keeps only state, the task list, and one-line results. If the controller's context is near its limit, write the checkpoint and tell the user to resume in a fresh session with the same slug.

## Prohibitions for workers (pass verbatim)

No edits to locked test files. No hardcoded returns for test inputs. No branching on fixture values. No test edits to fit wrong code. No unrelated refactoring; report it as a concern instead. Report `DONE_WITH_CONCERNS` rather than silently narrowing scope.
