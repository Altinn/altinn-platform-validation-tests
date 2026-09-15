import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { test } from 'node:test';

function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'run-k6-test-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'hack'));
  mkdirSync(join(root, 'bin'));
  copyFileSync(new URL('./run-k6.mjs', import.meta.url), join(root, 'hack/run-k6.mjs'));
  writeFileSync(join(root, '.env.at23'), 'ENVIRONMENT=at23\nK6_VUS=1\n');
  writeFileSync(join(root, 'test.js'), 'export default function () {}\n');
  writeFileSync(join(root, 'bin/k6'), `#!${process.execPath}
console.log(JSON.stringify({ args: process.argv.slice(2), vus: process.env.K6_VUS }));
process.exit(7);
`, { mode: 0o755 });
  return {
    root,
    run: (...args) => spawnSync(process.execPath, [join(root, 'hack/run-k6.mjs'), ...args], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${join(root, 'bin')}${delimiter}${process.env.PATH}`, K6_VUS: '99' },
    }),
  };
}

test('inspect rejects extra arguments before loading configuration or starting k6', t => {
  const { root, run } = fixture(t);
  rmSync(join(root, '.env.at23'));
  for (const flags of [
    ['--inspect', '--vus', '1'],
    ['--vus=1', '--inspect'],
    ['--inspect', '-i', '1'],
    ['--inspect', 'extra.js'],
    ['--inspect', '--inspect'],
  ]) {
    const result = run('at23', 'test.js', ...flags);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /runner accepts --inspect only on its own/);
    assert.match(result.stderr, /remove --inspect to run the test/i);
    assert.equal(result.stdout, '');
  }
});

test('inspect forwards the environment and preserves the k6 exit status', t => {
  const { root, run } = fixture(t);
  const result = run('at23', 'test.js', '--inspect');
  assert.equal(result.status, 7, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout.trim().split('\n').at(-1)), {
    args: ['inspect', '--include-system-env-vars', join(root, 'test.js')], vus: '1',
  });
});

test('run forwards k6 flags unchanged', t => {
  const { root, run } = fixture(t);
  const flags = ['--vus', '2', '--iterations=3', '-e', 'LABEL=two words'];
  const result = run('at23', 'test.js', ...flags);
  assert.equal(result.status, 7, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout.trim().split('\n').at(-1)), {
    args: ['run', ...flags, join(root, 'test.js')], vus: '1',
  });
});

test('Git allows both template names while ignoring local environment files', t => {
  const { root } = fixture(t);
  writeFileSync(join(root, '.gitignore'), readFileSync(new URL('../.gitignore', import.meta.url)));
  assert.equal(spawnSync('git', ['init', '--quiet', root]).status, 0);
  for (const path of ['.env.example', '.env.at23.example', 'playwright/example_env/.env.example']) {
    assert.equal(spawnSync('git', ['check-ignore', '--quiet', path], { cwd: root }).status, 1, path);
  }
  for (const path of ['.env', '.env.at23', '.env.local', '.env.at23.local']) {
    assert.equal(spawnSync('git', ['check-ignore', '--quiet', path], { cwd: root }).status, 0, path);
  }
});
