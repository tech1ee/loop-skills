import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const hook = join(root, 'hooks', 'test-lock.py');

let tmp: string;
let lockRoot: string;

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), 'loop-skills-hook-'));
  lockRoot = join(tmp, 'projects');
  await mkdir(join(lockRoot, 'abc', 'tdd-snapshots'), { recursive: true });
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

function runHook(filePath: string): Promise<{ code: number; stderr: string }> {
  return new Promise(resolve => {
    const child = spawn('python3', [hook], { env: { ...process.env, LOOP_SKILLS_LOCK_ROOT: lockRoot } });
    let stderr = '';
    child.stderr.on('data', d => { stderr += String(d); });
    child.on('close', code => resolve({ code: code ?? 1, stderr }));
    child.stdin.end(JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: filePath } }));
  });
}

test('blocks an edit to a locked test file with exit 2', async () => {
  const locked = join(tmp, 'test_feature.py');
  await writeFile(locked, '');
  await writeFile(join(lockRoot, 'abc', 'tdd-snapshots', '_active_task_files.txt'), `${locked}:T3\n`);
  const { code, stderr } = await runHook(locked);
  assert.equal(code, 2);
  assert.match(stderr, /BLOCKED/);
  assert.match(stderr, /task T3/);
});

test('allows edits to unlocked files', async () => {
  const other = join(tmp, 'src.py');
  await writeFile(other, '');
  await writeFile(join(lockRoot, 'abc', 'tdd-snapshots', '_active_task_files.txt'), `${join(tmp, 'test_feature.py')}:T3\n`);
  const { code } = await runHook(other);
  assert.equal(code, 0);
});

test('allows everything when no lock list exists', async () => {
  const { code } = await runHook(join(tmp, 'anything.ts'));
  assert.equal(code, 0);
});

test('tolerates malformed hook input', async () => {
  const result = await new Promise<number>(resolve => {
    const child = spawn('python3', [hook], { env: { ...process.env, LOOP_SKILLS_LOCK_ROOT: lockRoot } });
    child.on('close', code => resolve(code ?? 1));
    child.stdin.end('not json');
  });
  assert.equal(result, 0);
});
