# Security

## What installation does

Loop Skills is installed by your agent's plugin manager (`claude plugin`, `codex plugin`, `pi install`). The repository is the plugin: the manager clones or copies it and reads the manifests. Nothing in this package runs on `npm install`; there is no `postinstall`.

`npx loop-skills` only runs those plugin-manager commands and, with your confirmation, deletes the copied files left by releases up to 0.6 (`~/.claude/skills/loop-plan`, `~/.claude/skills/loop-debug`, the copied agents, and the receipt file). It writes nothing else.

## What runs at session time

- `hooks/test-lock.py` (Claude Code only) runs before `Edit`/`Write`. It reads `~/.claude/projects/*/tdd-snapshots/_active_task_files.txt`, compares paths, and exits 2 to block an edit to a locked test file. It never writes and never reaches the network.
- Scripts in `bin/` run only when a skill asks for them and only against the repository you are working in. None of them contact the network except `verify-internet-research.py`, which fetches the URLs a research report cites in order to check them.
- The Pi extensions read Pi session state and write loop state files under `.pi/plans/`.

## Verifying a release

Each GitHub release attaches `checksums.txt` (SHA-256 of every shipped file). Compare against the installed plugin root reported by `claude plugin list` or `codex plugin list`.

## Reporting

Open a private security advisory on the GitHub repository. In scope: skill text that could instruct an agent to perform unsafe actions, hook or script behavior, CI gates (`ci/check-unicode.py`, `ci/check-skill-safety.py`, `ci/generate-checksums.py`, `ci/version-sync.py`).
