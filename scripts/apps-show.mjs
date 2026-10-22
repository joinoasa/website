// Prints one application in full, readable form, with its history.
// Usage: npm run apps:show -- 12            (live database)
//        npm run apps:show -- 12 --local    (wrangler dev's local database)
import { d1, sqlInt, parseArgs, appId } from './apps-lib.mjs';

const usage = 'Usage: npm run apps:show -- <application number> [--local]';
const { args, local } = parseArgs(process.argv.slice(2));
const id = appId(args[0], usage);

const [apps, events] = d1(
  `SELECT * FROM applications WHERE id = ${sqlInt(id)};\nSELECT at, from_status, to_status, note FROM application_events WHERE app_id = ${sqlInt(id)} ORDER BY at, id;`,
  { local },
);
if (!apps.length) {
  console.log(`No application #${id}.`);
  process.exit(0);
}
const row = apps[0];
const width = Math.max(...Object.keys(row).map((k) => k.length));
for (const [key, value] of Object.entries(row)) {
  const text = value === null || value === '' ? '-' : String(value);
  const [first, ...rest] = text.split('\n');
  console.log(`${key.padEnd(width)}  ${first}`);
  for (const line of rest) console.log(`${' '.repeat(width)}  ${line}`);
}
console.log('\nHistory');
if (!events.length) console.log('  (none)');
for (const e of events) {
  const move = e.from_status === e.to_status ? e.to_status : `${e.from_status ?? '-'} -> ${e.to_status ?? '-'}`;
  console.log(`  ${String(e.at).slice(0, 16)}  ${move}${e.note ? `  ${e.note}` : ''}`);
}
