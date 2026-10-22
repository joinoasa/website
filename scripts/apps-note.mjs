// Adds a private note to an application's history (kept in application_events).
// Usage: npm run apps:note -- <id> <text>  [--local] [--dry]
import { d1, sqlText, sqlInt, nowIso, parseArgs, appId, fail } from './apps-lib.mjs';

const usage = 'Usage: npm run apps:note -- <id> <text> [--local] [--dry]';
const { args, local, dry } = parseArgs(process.argv.slice(2));
const id = appId(args[0], usage);
const text = args.slice(1).join(' ').trim();
if (!text) fail(usage);
if (text.length > 4000) fail('That note is over 4000 characters. Please shorten it.');

const at = nowIso();
if (!dry) {
  const [rows] = d1(`SELECT id FROM applications WHERE id = ${sqlInt(id)}`, { local });
  if (!rows.length) fail(`No application #${id}.`);
}
// from_status and to_status are both the current status: a note is not a status change.
d1([
  `INSERT INTO application_events (app_id, at, from_status, to_status, note) SELECT id, ${sqlText(at)}, status, status, ${sqlText(text)} FROM applications WHERE id = ${sqlInt(id)};`,
  `UPDATE applications SET updated_at = ${sqlText(at)} WHERE id = ${sqlInt(id)};`,
].join('\n'), { local, dry });
if (!dry) console.log(`Note added to #${id}.`);
