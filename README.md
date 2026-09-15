<div align="center">

# 🔄 Loop Skills

[![CI](https://github.com/tech1ee/loop-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/tech1ee/loop-skills/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/loop-skills?color=brightgreen&label=npm)](https://www.npmjs.com/package/loop-skills)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

Research-driven planning and debugging loops for Claude Code, Codex, and Pi. One skill core, native plugin distribution, native updates.

</div>

## Install

Pick your agent. Each line is the whole install.

```bash
# Claude Code
claude plugin marketplace add tech1ee/loop-skills && claude plugin install loop-skills@loop-skills

# Codex
codex plugin marketplace add tech1ee/loop-skills && codex plugin add loop-skills@loop-skills

# Pi
pi install npm:loop-skills
```

Or let the bootstrap ask which agents you use and run the right lines:

```bash
npx loop-skills
```

Start a new session. Invoke `/loop-skills:loop-plan` (Claude Code), `$loop-plan` (Codex), or `loop-plan` (Pi). The skills also trigger from plain requests such as "plan this feature" or "find the root cause of this bug".

## Update

| Agent | How |
|---|---|
| Claude Code | checks the marketplace at startup and offers `/reload-plugins`; or `claude plugin update loop-skills` |
| Codex | `codex plugin marketplace upgrade loop-skills` |
| Pi | `pi update --extensions` |

Releases are git tags; nothing else to install.

## What you get

**`loop-plan`** — for features, refactors, migrations, architecture work.

1. Explore the repository to closure with read-only subagents; every claim carries `path:line`.
2. Ask at most four questions the code cannot answer; turn answers into observable must-haves.
3. Research only when a current external fact can change the design.
4. Write a dependency-ordered plan with independent tests per task.
5. Wait for explicit approval.
6. Execute one task per fresh worker with reviewers by tier; checkpoint after every task so a fresh session resumes where the last stopped.
7. Verify the goal against the real codebase, not the task list.

**`loop-debug`** — for regressions, flaky behavior, production failures.

1. Reproduce as a test that fails for the reported reason. No red, no fix.
2. Trace the causal chain with parallel investigators; discriminate hypotheses with cheap probes instead of asking.
3. Search the codebase for the same class of defect.
4. Ship the minimal fix plus a runnable prevention guard, then prove the fix with a revert check.

**`loop-audit`** — read-only review of skills, plugins, hooks, and agent workflows.

## Tiers, not ceremony

| tier | explorers | research calls | execution gates |
|---|---|---|---|
| quick | 1 | 0 | implementer + one reviewer |
| standard | 2 | 3 | + separate test author, spec and quality reviewers, mutation post ≥ pre |
| high-risk | 3 | 8 | + cross-vendor diff review, security reviewer, goal verifier per stage |

Exploration and research stop when the impact map is closed, when two rounds add no supported claim, or when the budget is spent. The stopping reason is always written.

## Why

Agents that code before understanding, guess instead of asking, patch symptoms, declare victory without checking, and write tests that cannot fail. The loops exist to make each of those a gate instead of a habit, and to do it without turning every task into a ritual. Measured on the previous design: five of the eight costliest sessions in a month were planning loops running at 250–565K tokens of context per turn. The current design loads about 1.7K tokens per session and reads phase instructions only when a phase starts.

## Layout

```
skills/loop-plan/      SKILL.md router, phases/*.md, references/{platforms,state}.md
skills/loop-debug/     SKILL.md router, phases/*.md (shares loop-plan phases and references)
skills/loop-audit/     SKILL.md
agents/                Claude Code subagents the loops dispatch (10); agents/optional/ holds stack-specific auditors
hooks/                 PreToolUse test-file lock for Claude Code
bin/                   optional helpers: test-integrity, gaming/tautology detectors, citation verifiers, ADR helper, audit
extensions/            Pi tools: loop_progress, loop_inventory, loop_evidence, loop_context
.claude-plugin/ .codex-plugin/ .agents/   plugin manifests and in-repo marketplaces
```

## Documentation

- [loop-plan guide](docs/loop-plan.md) · [loop-debug guide](docs/loop-debug.md) · [Agents](docs/agents.md) · [CLI](docs/cli.md) · [How it works](docs/how-it-works.md) · [Changelog](CHANGELOG.md)

## Security

No `postinstall`. The bootstrap only runs the marketplace commands shown above. The Claude Code hook reads a lock list and blocks edits to locked test files; it never writes. See [SECURITY.md](SECURITY.md).

## Contributing

```bash
git clone https://github.com/tech1ee/loop-skills && cd loop-skills
npm install && npm run build && npm test
```

Release: edit `VERSION`, `npm run version:sync`, commit, `claude plugin tag`, push the tag. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
