// Deletes declined and withdrawn applications past the retention period (12 months; see /privacy/).
// Usage: npm run apps:purge                 dry run: lists what would be deleted
//        npm run apps:purge -- --apply      deletes it (history rows go too)
//        add --local for wrangler dev's database, --dry to print the SQL only
// Accepted members' data is not touched here: it is kept while they are a member and deleted
// (DELETE FROM applications WHERE id = N) within 90 days of leaving.
import { d1, sqlText, sqlInt, parseArgs, nowIso, RETENTION_MONTHS } from './apps-lib.mjs';

const { local, dry, apply } = parseArgs(process.argv.slice(2));
const cutoffDate = new Date();
cutoffDate.setUTCMonth(cutoffDate.getUTCMonth() - RETENTION_MONTHS);
const cutoff = cutoffDate.toISOString();
// The retention clock starts at the decision; older rows without one fall back to the last update.
const due = `status IN ('declined', 'withdrawn') AND COALESCE(decision_at, updated_at, created_at) < ${sqlText(cutoff)}`;

if (dry) {
  d1(`SELECT id, status FROM applications WHERE ${due};`, { dry });
  d1(`DELETE FROM application_events WHERE app_id IN (SELECT id FROM applications WHERE ${due});\nDELETE FROM applications WHERE ${due};`, { dry });
  process.exit(0);
}

const [rows] = d1(`SELECT id, status, COALESCE(decision_at, updated_at, created_at) AS since FROM applications WHERE ${due} ORDER BY id;`, { local });
console.log(`Retention: ${RETENTION_MONTHS} months. Cutoff ${cutoff.slice(0, 10)}. ${rows.length} application(s) past it.`);
for (const r of rows) console.log(`  #${r.id}  ${r.status}  since ${String(r.since).slice(0, 10)}`);
if (!rows.length) process.exit(0);
if (!apply) {
  console.log('\nDry run: nothing deleted. Run again with --apply to delete these. Afterwards delete their Discord alert messages too.');
  process.exit(0);
}
// Delete exactly the rows listed above, by number.
const ids = rows.map((r) => sqlInt(r.id)).join(', ');
d1(`DELETE FROM application_events WHERE app_id IN (${ids});\nDELETE FROM applications WHERE id IN (${ids}) AND status IN ('declined', 'withdrawn');`, { local });
console.log(`\nDeleted ${rows.length} application(s) at ${nowIso().slice(0, 16)}Z.`);
console.log(`Now also delete, for ${rows.map((r) => '#' + r.id).join(', ')}: the Discord alert messages, any #staff messages naming them, and the joinoasa/admin issues (${rows.map((r) => `APP-${String(r.id).padStart(4, '0')}`).join(', ')}).`);
