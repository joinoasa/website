// What needs attention: interviews scheduled, trials ending soon or overdue, applications waiting too long.
// Usage: npm run apps:due  [--local] [--dry]
// Shows application numbers and first names only, never emails.
import { d1, sqlText, parseArgs, today, addDays, nowIso, WAIT_DAYS } from './apps-lib.mjs';

const { local, dry } = parseArgs(process.argv.slice(2));
const day = today();
const waitCutoff = new Date(Date.now() - WAIT_DAYS * 86400000).toISOString();

const sql = [
  `SELECT id, name, interview_at FROM applications WHERE status = 'interview' AND interview_at IS NOT NULL ORDER BY interview_at;`,
  `SELECT id, name, trial_end FROM applications WHERE status = 'trial' AND trial_end IS NOT NULL AND trial_end <= ${sqlText(addDays(day, 7))} ORDER BY trial_end;`,
  `SELECT id, name, status, created_at FROM applications WHERE status IN ('new', 'reviewing') AND created_at < ${sqlText(waitCutoff)} ORDER BY created_at;`,
].join('\n');

const sets = d1(sql, { local, dry });
if (dry) process.exit(0);
const [interviews, trials, waiting] = sets;
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
const first = (name) => String(name).split(/\s+/)[0];

console.log(`As of ${nowIso().slice(0, 16)}Z\n`);
console.log(`Interviews scheduled (${interviews.length})`);
for (const r of interviews) console.log(`  #${r.id} ${first(r.name)}  ${r.interview_at}${r.interview_at.slice(0, 10) < day ? '  (date has passed: record the outcome)' : ''}`);
console.log(`\nTrials ending within 7 days or overdue (${trials.length})`);
for (const r of trials) {
  const left = daysBetween(day, r.trial_end);
  console.log(`  #${r.id} ${first(r.name)}  ends ${r.trial_end}  ${left < 0 ? `${-left} day(s) overdue` : left === 0 ? 'ends today' : `${left} day(s) left`}`);
}
console.log(`\nWaiting more than ${WAIT_DAYS} days in new or reviewing (${waiting.length})`);
for (const r of waiting) console.log(`  #${r.id} ${first(r.name)}  ${r.status}  ${daysBetween(r.created_at.slice(0, 10), day)} days`);
if (!interviews.length && !trials.length && !waiting.length) console.log('\nNothing needs attention.');
