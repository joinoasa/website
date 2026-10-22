// Moves an application to a new status, with a history entry.
// Usage: npm run apps:set -- <id> <status> [note]  [--local] [--dry]
//   statuses: new, reviewing, interview, trial, accepted, declined, withdrawn
// Entering "trial" sets trial_start to today and trial_end to 30 days later.
// Accepted, declined and withdrawn record decision_at (the retention clock starts then).
import { STATUSES, TRIAL_DAYS, d1, sqlText, sqlInt, nowIso, today, addDays, parseArgs, appId, fail } from './apps-lib.mjs';

const usage = `Usage: npm run apps:set -- <id> <${STATUSES.join('|')}> [note] [--local] [--dry]`;
const { args, local, dry } = parseArgs(process.argv.slice(2));
const id = appId(args[0], usage);
const status = args[1];
if (!STATUSES.includes(status)) fail(usage);
const note = args.slice(2).join(' ').trim();

const at = nowIso();
const day = today();
const sets = [`status = ${sqlText(status)}`, `updated_at = ${sqlText(at)}`];
if (status === 'trial') {
  // Keep the original dates if the trial is already running.
  sets.push(
    `trial_start = CASE WHEN status = 'trial' AND trial_start IS NOT NULL THEN trial_start ELSE ${sqlText(day)} END`,
    `trial_end = CASE WHEN status = 'trial' AND trial_end IS NOT NULL THEN trial_end ELSE ${sqlText(addDays(day, TRIAL_DAYS))} END`,
  );
}
if (['accepted', 'declined', 'withdrawn'].includes(status)) sets.push(`decision_at = ${sqlText(at)}`);

// The history row is written first so it can read the old status.
const sql = [
  `INSERT INTO application_events (app_id, at, from_status, to_status, note) SELECT id, ${sqlText(at)}, status, ${sqlText(status)}, ${note ? sqlText(note) : 'NULL'} FROM applications WHERE id = ${sqlInt(id)};`,
  `UPDATE applications SET ${sets.join(', ')} WHERE id = ${sqlInt(id)};`,
].join('\n');

if (!dry) {
  const [rows] = d1(`SELECT status FROM applications WHERE id = ${sqlInt(id)}`, { local });
  if (!rows.length) fail(`No application #${id}.`);
  if (rows[0].status === status) console.log(`#${id} is already "${status}"; recording the change anyway.`);
}
d1(sql, { local, dry });
if (!dry) console.log(`#${id} is now "${status}".${status === 'trial' ? ` Trial ends ${addDays(day, TRIAL_DAYS)} (if it was not already running).` : ''}`);
