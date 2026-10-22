// Records when an interview is scheduled (shown by apps:due).
// Usage: npm run apps:interview -- <id> <YYYY-MM-DD or YYYY-MM-DDTHH:MM>  [--local] [--dry]
import { d1, sqlText, sqlInt, nowIso, parseArgs, appId, fail } from './apps-lib.mjs';

const usage = 'Usage: npm run apps:interview -- <id> <YYYY-MM-DD or YYYY-MM-DDTHH:MM> [--local] [--dry]';
const { args, local, dry } = parseArgs(process.argv.slice(2));
const id = appId(args[0], usage);
const when = args[1] ?? '';
if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(when) || Number.isNaN(Date.parse(when))) fail(usage);

const at = nowIso();
if (!dry) {
  const [rows] = d1(`SELECT id FROM applications WHERE id = ${sqlInt(id)}`, { local });
  if (!rows.length) fail(`No application #${id}.`);
}
d1([
  `UPDATE applications SET interview_at = ${sqlText(when)}, updated_at = ${sqlText(at)} WHERE id = ${sqlInt(id)};`,
  `INSERT INTO application_events (app_id, at, from_status, to_status, note) SELECT id, ${sqlText(at)}, status, status, ${sqlText(`Interview scheduled ${when}`)} FROM applications WHERE id = ${sqlInt(id)};`,
].join('\n'), { local, dry });
if (!dry) console.log(`Interview for #${id} set to ${when}.`);
