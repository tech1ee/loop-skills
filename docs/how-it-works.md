# How it works

## One core, three hosts

`skills/` holds one copy of each skill. Claude Code loads it through `.claude-plugin/plugin.json`, Codex through `.codex-plugin/plugin.json`, Pi through the `pi.skills` field in `package.json`. The skill text uses generic actions (ask, delegate, plan dir, helper path) that `skills/loop-plan/references/platforms.md` maps to each host once per session.

Each `SKILL.md` is a router: contract, state, tier table, phase list, convergence rule. Phase instructions live in `phases/*.md` and are read when the phase starts. Claude Code's plugin inspector reports the always-on cost at about 1.7K tokens for the whole plugin.

## Marketplaces in the repository

`.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json` both list one plugin whose source is the repository root. Adding `tech1ee/loop-skills` as a marketplace on either CLI makes the repository the source of truth; a release is a version bump plus a git tag. `ci/version-sync.py` keeps `VERSION`, `package.json`, both plugin manifests, and the Claude marketplace entry equal.

Update detection is the host's job: Claude Code polls marketplaces after session start and asks for `/reload-plugins`; Codex refreshes git marketplaces on `codex plugin marketplace upgrade`; Pi on `pi update --extensions`.

## State and resume

Every loop keeps `<slug>.md` (the human plan, accumulated by iteration) and `<slug>.state.json` (schema in `skills/loop-plan/references/state.md`) in the host's plan directory. The state carries tier and budget, an evidence ledger, the impact-closure checklist, must-haves, per-task status with checkpoints, review counters, and stopping reasons. Re-invoking the skill with the same slug continues from the recorded phase; execution continues from the first task not marked done. Version 1 state files from releases up to 0.6 are read with a field mapping.

## Execution model

The controller never implements. One fresh worker per task receives the task block by value. Reviewers run in fresh read-only contexts. At standard tier a separate test author writes and locks the tests before the worker starts; on Claude Code `hooks/test-lock.py` blocks edits to locked files, on other hosts `bin/test-integrity.py verify` detects tampering afterwards. Mutation testing compares post-change to pre-change; cross-vendor review is advisory and only at high-risk tier.

## Pi extensions

`extensions/` ships `loop_progress` (checkpoint widget), `loop_inventory` (capability snapshot), `loop_evidence` (ledger writes), and `loop_context` (usage sampling, compaction-safe checkpoints, exactly-once continuation). They are optional; the skills work without them.
