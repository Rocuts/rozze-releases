#!/usr/bin/env node
// Comprobación de coherencia de una Release publicada.
//   node scripts/check-release.mjs <directorio-con-los-assets> <tag>
//
// Comprueba: tag vX.Y.Z; exactamente tres assets; SHA512SUMS coincide con el .exe;
// y el payload de rozze-update.json (base64 -> JSON) declara la misma version, nombre,
// tamaño y sha512 que el instalador real.
//
// NO verifica la firma Ed25519: eso lo hace la propia app antes de ofrecer la actualización
// y el verificador del repositorio de código. Este check solo detecta publicaciones incoherentes.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

class CheckError extends Error {}
const fail = (m) => { throw new CheckError(m); };

export function checkRelease(dir, tag) {
  if (typeof tag !== 'string' || !/^v\d+\.\d+\.\d+$/.test(tag)) fail(`tag mal formado: ${JSON.stringify(tag)} (se espera vX.Y.Z)`);
  const version = tag.slice(1);
  let entries;
  try { entries = readdirSync(dir); } catch (e) { fail(`no se puede leer el directorio ${dir}: ${e.message}`); }
  if (entries.length === 0) fail(`el directorio ${dir} está vacío: no se descargó ningún asset`);

  const exe = `RoZze-Setup-${version}.exe`;
  const expected = [exe, 'rozze-update.json', 'SHA512SUMS'];
  const missing = expected.filter((n) => !entries.includes(n));
  if (missing.length) fail(`faltan assets: ${missing.join(', ')}`);
  const extra = entries.filter((n) => !expected.includes(n));
  if (extra.length) fail(`sobran assets inesperados: ${extra.join(', ')}`);

  const exeBytes = readFileSync(join(dir, exe));
  const size = statSync(join(dir, exe)).size;
  const sha512 = createHash('sha512').update(exeBytes).digest('hex');

  // SHA512SUMS: «<sha512 hex>  <nombre>», con comparación insensible a mayúsculas.
  const lines = readFileSync(join(dir, 'SHA512SUMS'), 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '');
  const line = lines.map((l) => /^([0-9a-fA-F]{128}) [ *](.+)$/.exec(l)).find((m) => m && m[2] === exe);
  if (!line) fail(`SHA512SUMS no lista ${exe} con un hash válido`);
  if (line[1].toLowerCase() !== sha512) fail(`SHA512SUMS no coincide con el instalador (listado ${line[1].toLowerCase().slice(0, 16)}…, calculado ${sha512.slice(0, 16)}…)`);

  let env;
  try { env = JSON.parse(readFileSync(join(dir, 'rozze-update.json'), 'utf8')); } catch (e) { fail(`rozze-update.json no es JSON válido: ${e.message}`); }
  if (env === null || typeof env !== 'object' || Array.isArray(env)) fail('rozze-update.json no es un objeto');
  if (env.format !== 'rozze-update/1') fail(`rozze-update.json: format ${JSON.stringify(env.format)} ≠ "rozze-update/1"`);
  for (const k of ['kid', 'payload', 'sig']) if (typeof env[k] !== 'string' || env[k] === '') fail(`rozze-update.json: falta el campo ${k}`);
  let payload;
  try { payload = JSON.parse(Buffer.from(env.payload, 'base64').toString('utf8')); } catch (e) { fail(`el payload no es base64 → JSON válido: ${e.message}`); }
  if (payload === null || typeof payload !== 'object') fail('el payload no es un objeto');
  if (payload.version !== version) fail(`payload.version ${JSON.stringify(payload.version)} ≠ ${version} (tag)`);
  const inst = payload.installer;
  if (inst === null || typeof inst !== 'object') fail('el payload no tiene installer');
  if (inst.name !== exe) fail(`payload.installer.name ${JSON.stringify(inst.name)} ≠ ${exe}`);
  if (inst.size !== size) fail(`payload.installer.size ${inst.size} ≠ tamaño real ${size}`);
  if (typeof inst.sha512 !== 'string' || inst.sha512.toLowerCase() !== sha512) fail('payload.installer.sha512 no coincide con el instalador');
  return { version, size, sha512 };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-release.mjs')) {
  const [dir, tag] = process.argv.slice(2);
  try {
    if (!dir || !tag) fail('uso: check-release.mjs <directorio> <tag>');
    const r = checkRelease(dir, tag);
    process.stdout.write(`check-release: OK ${tag} · ${r.size} bytes · sha512 ${r.sha512.slice(0, 16)}…\n`);
    process.stdout.write('check-release: la firma Ed25519 NO se verifica aquí (la comprueba la app antes de ofrecer la actualización).\n');
  } catch (e) {
    if (!(e instanceof CheckError)) throw e;
    process.stderr.write(`check-release: ROJO — ${e.message}\n`);
    process.exit(1);
  }
}
