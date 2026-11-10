import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), 'check-release.mjs');
const V = '1.2.3';
const EXE = `RoZze-Setup-${V}.exe`;
const BYTES = Buffer.from('MZ-falso-instalador');
const SHA = createHash('sha512').update(BYTES).digest('hex');

function build({ version = V, name = EXE, size = BYTES.length, sha = SHA, sums = SHA, extra = false, drop = null } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'rel-'));
  const payload = { version, installer: { name, size, sha512: sha } };
  const files = {
    [EXE]: BYTES,
    'SHA512SUMS': `${sums}  ${EXE}\n`,
    'rozze-update.json': JSON.stringify({ format: 'rozze-update/1', kid: 'k1', payload: Buffer.from(JSON.stringify(payload)).toString('base64'), sig: 'relleno' }),
  };
  if (extra) files['notes.md'] = 'x';
  for (const [n, c] of Object.entries(files)) if (n !== drop) writeFileSync(join(dir, n), c);
  return dir;
}
const run = (dir, tag = `v${V}`) => spawnSync(process.execPath, [script, dir, tag], { encoding: 'utf8' });
function red(dir, re, tag) {
  const r = run(dir, tag);
  assert.notEqual(r.status, 0, 'debía fallar');
  assert.match(r.stderr, re);
  rmSync(dir, { recursive: true, force: true });
}

test('release válida => 0', () => {
  const d = build(); const r = run(d);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /NO se verifica/);
  rmSync(d, { recursive: true, force: true });
});
test('hash en mayúsculas en SHA512SUMS => 0', () => {
  const d = build({ sums: SHA.toUpperCase() }); assert.equal(run(d).status, 0); rmSync(d, { recursive: true, force: true });
});
test('falta un asset', () => { for (const n of [EXE, 'SHA512SUMS', 'rozze-update.json']) red(build({ drop: n }), /faltan assets/); });
test('sobra un asset', () => red(build({ extra: true }), /sobran assets/));
test('hash distinto en SHA512SUMS', () => red(build({ sums: 'a'.repeat(128) }), /SHA512SUMS no coincide/));
test('sha512 del payload distinto', () => red(build({ sha: 'b'.repeat(128) }), /installer\.sha512/));
test('size distinto', () => red(build({ size: 999 }), /installer\.size/));
test('version distinta del tag', () => red(build({ version: '9.9.9' }), /payload\.version/));
test('nombre del instalador distinto', () => red(build({ name: 'otro.exe' }), /installer\.name/));
test('tag mal formado', () => { for (const t of ['1.2.3', 'v1.2', 'v1.2.3-rc1']) red(build(), /tag mal formado/, t); });
test('directorio vacío', () => {
  const d = mkdtempSync(join(tmpdir(), 'rel-')); red(d, /vacío/);
});
test('directorio inexistente', () => {
  const r = run(join(tmpdir(), 'no-existe-xyz')); assert.notEqual(r.status, 0); assert.match(r.stderr, /no se puede leer/);
});
