import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('package declares the shared skills for Pi', async () => {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as {
    name?: string;
    bin?: Record<string, string>;
    keywords?: string[];
    pi?: { skills?: string[] };
  };
  assert.equal(pkg.name, 'loop-skills');
  assert.equal(pkg.bin?.['loop-skills'], 'dist/src/install.js');
  assert.ok(pkg.keywords?.includes('pi-package'));
  assert.deepEqual(pkg.pi?.skills, ['./skills']);
});

test('Pi manifest exposes the loop extensions', async () => {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as {
    pi?: { extensions?: string[] };
  };
  assert.deepEqual(pkg.pi?.extensions, [
    './extensions/loop-progress.ts',
    './extensions/loop-inventory.ts',
    './extensions/loop-evidence.ts',
    './extensions/loop-context.ts',
  ]);
  for (const [file, tool] of [
    ['loop-progress.ts', 'loop_progress'],
    ['loop-inventory.ts', 'loop_inventory'],
    ['loop-evidence.ts', 'loop_evidence'],
    ['loop-context.ts', 'loop_context'],
  ]) {
    const text = await readFile(join(root, 'extensions', file), 'utf8');
    assert.match(text, new RegExp(`name: "${tool}"`));
  }
});

test('skills do not hard-require Claude-only tools', async () => {
  for (const name of ['loop-plan', 'loop-debug', 'loop-audit']) {
    const text = await readFile(join(root, 'skills', name, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`name: ${name}`));
    assert.doesNotMatch(text, /allowed-tools:|ExitPlanMode|subagent-driven-development/);
  }
});
