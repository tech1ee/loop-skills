import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
const entryPoint = new URL('../src/install.js', import.meta.url).pathname;

let tmpHome: string;

beforeEach(async () => {
  tmpHome = await mkdtemp(join(tmpdir(), 'loop-skills-test-'));
});

afterEach(async () => {
  await rm(tmpHome, { recursive: true, force: true });
});

async function run(args: string[], env: Record<string, string> = {}) {
  try {
    const result = await execFileP('node', [entryPoint, ...args], {
      env: { ...process.env, HOME: tmpHome, PATH: join(tmpHome, 'bin') + ':' + process.env['PATH'], ...env },
      timeout: 10000,
    });
    return { stdout: result.stdout, stderr: result.stderr, code: 0 };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; code?: number };
    return { stdout: err.stdout ?? '', stderr: err.stderr ?? '', code: err.code ?? 1 };
  }
}

async function exists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

async function fakeCli(name: string, logFile: string): Promise<void> {
  await mkdir(join(tmpHome, 'bin'), { recursive: true });
  const script = `#!/bin/sh\necho "${name} $@" >> "${logFile}"\n`;
  await writeFile(join(tmpHome, 'bin', name), script, { mode: 0o755 });
}

describe('dry-run', () => {
  test('prints the native commands for every platform and writes nothing', async () => {
    const { stdout, code } = await run(['--dry-run', '--all']);
    assert.equal(code, 0);
    assert.match(stdout, /claude plugin marketplace add tech1ee\/loop-skills/);
    assert.match(stdout, /claude plugin install loop-skills@loop-skills/);
    assert.match(stdout, /codex plugin marketplace add tech1ee\/loop-skills/);
    assert.match(stdout, /codex plugin add loop-skills@loop-skills/);
    assert.match(stdout, /pi install npm:loop-skills/);
    assert.equal(await exists(join(tmpHome, '.claude')), false);
  });
});

describe('install', () => {
  test('runs the marketplace and install commands in order per platform', async () => {
    const log = join(tmpHome, 'calls.log');
    await fakeCli('claude', log);
    await fakeCli('codex', log);
    await fakeCli('pi', log);
    const { code, stdout } = await run(['--all', '--yes']);
    assert.equal(code, 0);
    const calls = (await import('node:fs/promises')).readFile(log, 'utf8');
    const lines = (await calls).trim().split('\n');
    assert.deepEqual(lines, [
      'claude plugin marketplace add tech1ee/loop-skills',
      'claude plugin install loop-skills@loop-skills',
      'codex plugin marketplace add tech1ee/loop-skills',
      'codex plugin add loop-skills@loop-skills',
      'pi install npm:loop-skills',
    ]);
    assert.match(stdout, /reload-plugins/);
    assert.match(stdout, /marketplace upgrade loop-skills/);
  });

  test('a failing CLI prints the manual commands and continues with the next platform', async () => {
    const log = join(tmpHome, 'calls.log');
    await mkdir(join(tmpHome, 'bin'), { recursive: true });
    await writeFile(join(tmpHome, 'bin', 'claude'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
    await fakeCli('codex', log);
    await fakeCli('pi', log);
    const { stdout, code } = await run(['--all', '--yes']);
    assert.equal(code, 0);
    assert.match(stdout, /Finish manually/);
    const lines = (await (await import('node:fs/promises')).readFile(log, 'utf8')).trim().split('\n');
    assert.equal(lines[0], 'codex plugin marketplace add tech1ee/loop-skills');
  });
});

describe('--platforms', () => {
  test('limits the run to the named platforms and rejects unknown names', async () => {
    const log = join(tmpHome, 'calls.log');
    await fakeCli('claude', log);
    await fakeCli('codex', log);
    const { code } = await run(['--platforms', 'codex', '--yes']);
    assert.equal(code, 0);
    const lines = (await (await import('node:fs/promises')).readFile(log, 'utf8')).trim().split('\n');
    assert.deepEqual(lines, ['codex plugin marketplace add tech1ee/loop-skills', 'codex plugin add loop-skills@loop-skills']);
    const bad = await run(['--platforms', 'cursor', '--yes']);
    assert.equal(bad.code, 1);
    assert.match(bad.stderr, /Unknown platform/);
  });
});

describe('legacy copy-install', () => {
  test('is detected from the 0.6 receipt and removed with --yes', async () => {
    const skills = join(tmpHome, '.claude', 'skills');
    const agents = join(tmpHome, '.claude', 'agents');
    await mkdir(join(skills, 'loop-plan'), { recursive: true });
    await mkdir(agents, { recursive: true });
    await writeFile(join(skills, 'loop-plan', 'SKILL.md'), 'old');
    await writeFile(join(agents, 'spec-reviewer.md'), 'old');
    await writeFile(join(skills, '.install-receipt.json'), JSON.stringify({ version: '0.6.0', skills: ['loop-plan'], agents: ['spec-reviewer'] }));
    const { stdout, code } = await run(['--dry-run', '--all']);
    assert.equal(code, 0);
    assert.match(stdout, /Legacy copy-install found \(v0\.6\.0\)/);
    assert.equal(await exists(join(skills, 'loop-plan')), true);

    await fakeCli('claude', join(tmpHome, 'calls.log'));
    await fakeCli('codex', join(tmpHome, 'calls.log'));
    await fakeCli('pi', join(tmpHome, 'calls.log'));
    const second = await run(['--all', '--yes']);
    assert.equal(second.code, 0);
    assert.equal(await exists(join(skills, 'loop-plan')), false);
    assert.equal(await exists(join(agents, 'spec-reviewer.md')), false);
    assert.equal(await exists(join(skills, '.install-receipt.json')), false);
  });
});
