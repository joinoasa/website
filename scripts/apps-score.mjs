// Records the interview rubric: five scores from 1 to 5.
// Usage: npm run apps:score -- <id> <skill> <talent> <ambition> <initiative> <collaboration>  [--local] [--dry]
import { d1, sqlText, sqlInt, nowIso, parseArgs, appId, fail } from './apps-lib.mjs';

const traits = ['skill', 'talent', 'ambition', 'initiative', 'collaboration'];
const usage = `Usage: npm run apps:score -- <id> ${traits.map((t) => `<${t}>`).join(' ')} [--local] [--dry]\nEach score is a whole number from 1 to 5.`;
const { args, local, dry } = parseArgs(process.argv.slice(2));
const id = appId(args[0], usage);
const scores = args.slice(1);
if (scores.length !== traits.length || !scores.every((s) => /^[1-5]$/.test(s))) fail(usage);

const at = nowIso();
if (!dry) {
  const [rows] = d1(`SELECT id FROM applications WHERE id = ${sqlInt(id)}`, { local });
  if (!rows.length) fail(`No application #${id}.`);
}
const summary = traits.map((t, i) => `${t} ${scores[i]}`).join(', ');
d1([
  `UPDATE applications SET ${traits.map((t, i) => `score_${t} = ${sqlInt(scores[i])}`).join(', ')}, updated_at = ${sqlText(at)} WHERE id = ${sqlInt(id)};`,
  `INSERT INTO application_events (app_id, at, from_status, to_status, note) SELECT id, ${sqlText(at)}, status, status, ${sqlText(`Scores: ${summary}`)} FROM applications WHERE id = ${sqlInt(id)};`,
].join('\n'), { local, dry });
if (!dry) console.log(`Scores saved for #${id}: ${summary}.`);
