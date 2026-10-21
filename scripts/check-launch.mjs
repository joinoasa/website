// Lists every value the owner still has to supply (lines marked TODO(owner) in src/config/site.ts).
// Usage: npm run check:launch [-- --strict]   (--strict exits 1 when anything is open)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../src/config/site.ts', import.meta.url));
const lines = readFileSync(file, 'utf8').split('\n');
const strict = process.argv.includes('--strict');

let section = '';
const open = [];
lines.forEach((line, i) => {
  const sec = line.match(/^  (\w+): \{\s*$/);
  if (sec) section = sec[1];
  else if (/^  \},?\s*$/.test(line)) section = '';
  if (!line.includes('TODO(owner)') || line.trimStart().startsWith('//')) return;
  const key = line.match(/^\s*(\w+)\s*:/)?.[1] ?? '';
  const full = [section, key].filter(Boolean).join('.');
  const note = line.slice(line.indexOf('TODO(owner)')).trim();
  open.push({ n: i + 1, full, note, text: line.trim() });
});

console.log(`Owner values still open in src/config/site.ts (${open.length}):\n`);
for (const o of open) console.log(`  line ${String(o.n).padStart(3)}  ${o.full.padEnd(24)} ${o.note}`);

const m = lines.join('\n').match(/securityTxtExpires:\s*'([^']+)'/);
if (m) {
  const days = Math.round((Date.parse(m[1]) - Date.now()) / 86400000);
  if (Number.isNaN(days)) console.log('\nWARNING: security.securityTxtExpires is not a valid date.');
  else if (days < 60) console.log(`\nWARNING: security.txt expires in ${days} days (${m[1]}). Renew security.securityTxtExpires.`);
}
if (strict && open.length) process.exit(1);
