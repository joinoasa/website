// Prints one application in full, readable form.
// Usage: npm run apps:show -- 12            (live database)
//        npm run apps:show -- 12 --local    (wrangler dev's local database)
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const id = Number(args.find((a) => /^\d+$/.test(a)));
if (!Number.isInteger(id) || id < 1) {
  console.error('Usage: npm run apps:show -- <application number> [--local]');
  process.exit(1);
}
const where = args.includes('--local') ? '--local' : '--remote';
const sql = `SELECT * FROM applications WHERE id = ${id}`;

let rows;
try {
  const out = execSync(`npx wrangler d1 execute DB ${where} --json --command "${sql}"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  rows = JSON.parse(out)[0]?.results ?? [];
} catch (err) {
  console.error('Could not read the database. Are you logged in (npx wrangler login)?');
  process.exit(1);
}
if (!rows.length) {
  console.log(`No application #${id}.`);
  process.exit(0);
}
const row = rows[0];
const width = Math.max(...Object.keys(row).map((k) => k.length));
for (const [key, value] of Object.entries(row)) {
  const text = value === null || value === '' ? '-' : String(value);
  const [first, ...rest] = text.split('\n');
  console.log(`${key.padEnd(width)}  ${first}`);
  for (const line of rest) console.log(`${' '.repeat(width)}  ${line}`);
}
