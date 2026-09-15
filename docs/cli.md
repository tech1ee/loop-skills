# CLI

Loop Skills installs through each agent's own plugin system. The npm package exists for Pi and for the bootstrap below.

## Native commands

```bash
# Claude Code
claude plugin marketplace add tech1ee/loop-skills
claude plugin install loop-skills@loop-skills
claude plugin update loop-skills            # manual update; startup check offers /reload-plugins

# Codex
codex plugin marketplace add tech1ee/loop-skills
codex plugin add loop-skills@loop-skills
codex plugin marketplace upgrade loop-skills   # pull a new release

# Pi
pi install npm:loop-skills
pi update --extensions
```

Uninstall with the same tools: `claude plugin uninstall loop-skills`, `codex plugin remove loop-skills@loop-skills`, `pi remove loop-skills`.

## `npx loop-skills`

Interactive picker that runs the native commands for the agents you select.

```
npx loop-skills                       # multiselect Claude Code / Codex / Pi
npx loop-skills --platforms claude    # comma-separated, no prompt
npx loop-skills --all                 # every platform
npx loop-skills --dry-run             # print the commands, run nothing
npx loop-skills --yes                 # accept legacy-cleanup prompts
```

If a 0.6 copy-install is present (`~/.claude/skills/.install-receipt.json`), the bootstrap lists the copied skills and agents and offers to remove them so they do not shadow the plugin.

## Pinning a version

Claude Code: `claude plugin install loop-skills@loop-skills` always resolves the marketplace's current version; pin by adding the marketplace from a tag (`claude plugin marketplace add https://github.com/tech1ee/loop-skills.git --ref v0.7.0`, when the ref flag is available in your CLI). Codex: `codex plugin marketplace add tech1ee/loop-skills --ref v0.7.0`. Pi: `pi install npm:loop-skills@0.7.0`.
