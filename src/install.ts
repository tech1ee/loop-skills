#!/usr/bin/env node
import * as p from '@clack/prompts';
import { readFile, rm, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = 'tech1ee/loop-skills';
const MARKETPLACE = 'loop-skills';
const PLUGIN = 'loop-skills';
const CLAUDE_DIR = join(homedir(), '.claude');
const LEGACY_RECEIPT = join(CLAUDE_DIR, 'skills', '.install-receipt.json');

type Platform = 'claude' | 'codex' | 'pi';

const PLATFORMS: Array<{ value: Platform; label: string; hint: string }> = [
  { value: 'claude', label: 'Claude Code', hint: `claude plugin marketplace add ${REPO} && claude plugin install ${PLUGIN}@${MARKETPLACE}` },
  { value: 'codex', label: 'Codex', hint: `codex plugin marketplace add ${REPO} && codex plugin add ${PLUGIN}@${MARKETPLACE}` },
  { value: 'pi', label: 'Pi', hint: 'pi install npm:loop-skills' },
];

const COMMANDS: Record<Platform, string[][]> = {
  claude: [
    ['claude', 'plugin', 'marketplace', 'add', REPO],
    ['claude', 'plugin', 'install', `${PLUGIN}@${MARKETPLACE}`],
  ],
  codex: [
    ['codex', 'plugin', 'marketplace', 'add', REPO],
    ['codex', 'plugin', 'add', `${PLUGIN}@${MARKETPLACE}`],
  ],
  pi: [['pi', 'install', 'npm:loop-skills']],
};

const UPDATE_HINT: Record<Platform, string> = {
  claude: 'Claude Code checks the marketplace on startup; run /reload-plugins when prompted, or `claude plugin update loop-skills`.',
  codex: 'Run `codex plugin marketplace upgrade loop-skills` to pull a new release.',
  pi: 'Run `pi update --extensions` to pull a new release.',
};

async function exists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

function render(cmd: string[]): string {
  return cmd.map(part => (/\s/.test(part) ? JSON.stringify(part) : part)).join(' ');
}

function parsePlatforms(args: string[]): Platform[] | null {
  const index = args.indexOf('--platforms');
  if (index < 0 || !args[index + 1]) return null;
  const names = args[index + 1].split(',').map(s => s.trim()).filter(Boolean);
  const valid = new Set(PLATFORMS.map(x => x.value));
  const invalid = names.filter(n => !valid.has(n as Platform));
  if (invalid.length > 0) {
    console.error(`Unknown platform(s): ${invalid.join(', ')}. Available: ${[...valid].join(', ')}`);
    process.exit(1);
  }
  return names as Platform[];
}

async function selectPlatforms(all: boolean, explicit: Platform[] | null): Promise<Platform[]> {
  if (explicit) return explicit;
  if (all || !process.stdin.isTTY) return PLATFORMS.map(x => x.value);
  const answer = await p.multiselect({
    message: 'Install Loop Skills for which agents?',
    options: PLATFORMS,
    initialValues: ['claude'],
    required: true,
  });
  if (p.isCancel(answer)) { p.cancel('Cancelled.'); process.exit(0); }
  return answer as Platform[];
}

async function removeLegacyInstall(dryRun: boolean, yes: boolean): Promise<void> {
  if (!(await exists(LEGACY_RECEIPT))) return;
  const receipt = JSON.parse(await readFile(LEGACY_RECEIPT, 'utf8')) as { skills?: string[]; agents?: string[]; version?: string };
  const targets = [
    ...(receipt.skills ?? []).map(s => join(CLAUDE_DIR, 'skills', s)),
    ...(receipt.agents ?? []).map(a => join(CLAUDE_DIR, 'agents', `${a}.md`)),
    LEGACY_RECEIPT,
  ];
  p.note(targets.join('\n'), `Legacy copy-install found (v${receipt.version ?? '?'}). These files would shadow the plugin.`);
  if (dryRun) return;
  const proceed = yes ? true : await p.confirm({ message: 'Remove the legacy copies?' });
  if (p.isCancel(proceed) || !proceed) return;
  for (const t of targets) await rm(t, { recursive: true, force: true });
  p.log.success('Legacy copies removed.');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const yes = args.includes('--yes') || args.includes('-y');
  const all = args.includes('--all');

  p.intro('Loop Skills');
  const platforms = await selectPlatforms(all, parsePlatforms(args));
  await removeLegacyInstall(dryRun, yes);

  for (const platform of platforms) {
    const cmds = COMMANDS[platform];
    if (dryRun) {
      p.note(cmds.map(render).join('\n'), `${PLATFORMS.find(x => x.value === platform)!.label} (dry-run)`);
      continue;
    }
    for (const cmd of cmds) {
      p.log.step(render(cmd));
      try {
        execFileSync(cmd[0], cmd.slice(1), { stdio: 'inherit' });
      } catch {
        p.log.error(`Command failed. Finish manually:\n  ${cmds.map(render).join('\n  ')}`);
        break;
      }
    }
    p.log.info(UPDATE_HINT[platform]);
  }
  p.outro(dryRun ? 'Dry-run complete.' : 'Done. Start a new session to load the skills.');
}

await main();
