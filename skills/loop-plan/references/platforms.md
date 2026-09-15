# Platform mapping

The loop text uses generic actions. Map them once per session.

| action | Claude Code | Codex | Pi |
|---|---|---|---|
| ask the user | `AskUserQuestion` (≤ 4 questions, options with the recommended first) | plain question in the reply, options listed | plain question in the reply |
| delegate read-only | `Agent` with an explorer or the generic explore agent | `spawn_agent` with `explorer` | `subagent` with `scout` |
| delegate a worker | `Agent` general-purpose with Write/Edit/Bash | `spawn_agent` with `worker` | `subagent` with `worker` |
| delegate a reviewer | `Agent` `spec-reviewer` / `code-quality-reviewer` / `security-reviewer` / `loop-verifier` | fresh `spawn_agent` `default` with a review brief | `subagent` `reviewer` |
| test author | `Agent` `test-writer` | fresh `worker` restricted to test files by instruction | `worker` restricted by instruction |
| plan dir (unless the invoker names another) | `~/.claude/plans/` | `.codex/loop/` in the repo | `.pi/plans/` in the repo |
| helper scripts | `${CLAUDE_PLUGIN_ROOT}/bin/` | `<plugin root>/bin/` (the directory holding `.codex-plugin/`) | `<package root>/bin/` |
| approval | `ExitPlanMode` after the gate when plan mode is active; otherwise the gate answer | the gate answer | the gate answer |
| cross-vendor review | Codex plugin `/codex:review` or `/codex:adversarial-review` when installed | ask a Claude reviewer through an installed connector, otherwise skip and record | skip and record |
| test-file lock | `hooks/test-lock.py` blocks edits to files listed by `test-integrity.py snapshot` | no hook; `test-integrity.py verify` detects tampering after the worker | same as Codex |

Stack explorers shipped with the plugin for Claude Code appear namespaced in the agent list: `loop-skills:android-kmp-explorer`, `loop-skills:swiftui-explorer`, `loop-skills:react-nextjs-explorer`; the same applies to the reviewer, test-writer, test-runner, and verifier agents. Run the tier's single explorer in the foreground; run parallel explorers in one message and wait for all. Other agents the user has installed may be used when their description matches the scope; never assume an agent exists without checking the platform's agent list.

Skill names on Claude Code are namespaced: `/loop-skills:loop-plan`, `/loop-skills:loop-debug`, `/loop-skills:loop-audit`. On Codex: `$loop-plan`, `$loop-debug`, `$loop-audit`.

Helpers in `bin/` (all optional; the loop works without them):

- `test-integrity.py` — snapshot, verify, lock and unlock test files; `guard-mutation` proves a test can fail.
- `detect-test-gaming.py`, `detect-tautological-tests.py` — static scans of a worker's diff and of test files.
- `verify-code-research.py`, `verify-internet-research.py` — citation checks for explorer and research reports.
- `new-adr.py` — create, list, confirm ADRs under `.claude/decisions/`.
- `loop-plan-audit.py` — shipped / stalled / abandoned rates across state files.
