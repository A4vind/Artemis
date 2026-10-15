// Reports translation coverage for Hindi and Marathi against the English source.
import { readFileSync } from 'node:fs';

const keysOf = (file) =>
  new Set([...readFileSync(new URL(`../src/i18n/${file}`, import.meta.url), 'utf8').matchAll(/^\s*'([\w.]+)':/gm)].map((m) => m[1]));

const en = keysOf('en.ts');
let ok = true;
for (const lang of ['hi', 'mr']) {
  const k = keysOf(`${lang}.ts`);
  const missing = [...en].filter((x) => !k.has(x));
  const extra = [...k].filter((x) => !en.has(x));
  console.log(`${lang}: ${en.size - missing.length}/${en.size} keys translated`);
  if (missing.length) console.log('  missing:', missing.join(', '));
  if (extra.length) {
    ok = false;
    console.log('  unknown keys:', extra.join(', '));
  }
}
process.exit(ok ? 0 : 1);
