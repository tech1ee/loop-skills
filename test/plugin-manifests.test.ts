import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

async function json(rel: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(join(root, rel), 'utf8')) as Record<string, unknown>;
}

async function exists(rel: string): Promise<boolean> {
  try { await access(join(root, rel)); return true; } catch { return false; }
}

test('every manifest carries the VERSION file value', async () => {
  const version = (await readFile(join(root, 'VERSION'), 'utf8')).trim();
  assert.match(version, /^\d+\.\d+\.\d+$/);
  assert.equal((await json('package.json'))['version'], version);
  assert.equal((await json('.claude-plugin/plugin.json'))['version'], version);
  assert.equal((await json('.codex-plugin/plugin.json'))['version'], version);
  const marketplace = await json('.claude-plugin/marketplace.json') as { plugins: Array<{ version: string }> };
  assert.equal(marketplace.plugins[0].version, version);
});

test('Claude marketplace points at the repository root plugin', async () => {
  const marketplace = await json('.claude-plugin/marketplace.json') as { name: string; plugins: Array<{ name: string; source: string }> };
  assert.equal(marketplace.name, 'loop-skills');
  assert.equal(marketplace.plugins[0].name, 'loop-skills');
  assert.equal(marketplace.plugins[0].source, './');
  assert.equal((await json('.claude-plugin/plugin.json'))['name'], 'loop-skills');
});

test('Codex marketplace points at the repository root plugin', async () => {
  const marketplace = await json('.agents/plugins/marketplace.json') as { name: string; plugins: Array<{ name: string; source: { source: string; path: string } }> };
  assert.equal(marketplace.name, 'loop-skills');
  assert.deepEqual(marketplace.plugins[0].source, { source: 'local', path: './' });
  const plugin = await json('.codex-plugin/plugin.json') as { name: string; skills: string };
  assert.equal(plugin.name, 'loop-skills');
  assert.equal(plugin.skills, './skills/');
});

test('shared skills exist once and are platform-neutral', async () => {
  for (const name of ['loop-plan', 'loop-debug', 'loop-audit']) {
    const text = await readFile(join(root, 'skills', name, 'SKILL.md'), 'utf8');
    assert.match(text, new RegExp(`^name: ${name}$`, 'm'));
    assert.match(text, /^description: .{80,}$/m);
    assert.doesNotMatch(text, /allowed-tools:|~\/Documents|superpowers:|ADR-\d{4}|ADR-NEW/);
  }
  assert.equal(await exists('skills/pi'), false);
  assert.equal(await exists('plugins'), false);
});

test('phase files referenced by the skills exist', async () => {
  for (const name of ['loop-plan', 'loop-debug']) {
    const text = await readFile(join(root, 'skills', name, 'SKILL.md'), 'utf8');
    for (const match of text.matchAll(/`((?:\.\.\/loop-plan\/)?(?:phases|references)\/[a-z-]+\.md)`/g)) {
      assert.equal(await exists(join('skills', name, match[1])), true, `${name}: ${match[1]} missing`);
    }
  }
});

test('hook manifest wires the test-lock script through the plugin root', async () => {
  const hooks = await json('hooks/hooks.json') as { hooks: { PreToolUse: Array<{ matcher: string; hooks: Array<{ command: string }> }> } };
  const entry = hooks.hooks.PreToolUse[0];
  assert.match(entry.matcher, /Edit\|Write/);
  assert.match(entry.hooks[0].command, /\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/test-lock\.py/);
  assert.equal(await exists('hooks/test-lock.py'), true);
});

test('package ships plugin manifests, hooks and skills', async () => {
  const pkg = await json('package.json') as { files: string[] };
  for (const entry of ['.claude-plugin/', '.codex-plugin/', '.agents/', 'hooks/', 'skills/', 'agents/', 'bin/', 'VERSION']) {
    assert.ok(pkg.files.includes(entry), `package.json files missing ${entry}`);
  }
});
