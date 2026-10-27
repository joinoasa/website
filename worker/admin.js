// Admin automation for applications. Plain JavaScript with no imports, so the Worker, the
// apps:* scripts and the tests (scripts/worker-admin.test.mjs) all share it.
//
//  - New application  -> an "Applicant" issue in the private joinoasa/admin repo.
//  - Weekly (cron)    -> a digest in Discord #staff: interviews, trials ending, applications waiting.
//
// Personal data rule (joinoasa/admin AGENTS.md): application number, first name and handles only.
// Never emails, ages, locations or answers. Applicants aged 15 to 17 get the number only.

export const ADMIN_REPO = 'joinoasa/admin';
export const WAIT_DAYS = 7;
const YOUTH = '15-17';
const HANDLE_RE = /^[A-Za-z0-9._-]{1,39}$/;

/** @typedef {{ title: string, body: string, labels: string[] }} IssueDraft */

/** APP-0007 */
export function appNumber(id) {
  return `APP-${String(id).padStart(4, '0')}`;
}

/** First word of the name, letters and simple punctuation only, at most 40 characters. */
export function firstName(name) {
  const word = String(name ?? '').trim().split(/\s+/)[0] ?? '';
  const safe = word.normalize('NFC').replace(/[^\p{L}\p{M}'’.-]/gu, '').slice(0, 40);
  return safe || 'applicant';
}

function handle(value) {
  const v = String(value ?? '').trim().replace(/^@/, '');
  return HANDLE_RE.test(v) ? v : null;
}

const CHECKLIST = [
  '- [ ] First look (`apps:set -- ID reviewing`)',
  '- [ ] Work review',
  '- [ ] Interview booked (`apps:interview`)',
  '- [ ] Interview scored (`apps:score`)',
  '- [ ] Trial started (`apps:set -- ID trial`) or fast-track noted',
  '- [ ] Weekly check-ins',
  '- [ ] Decision (`apps:set -- ID accepted|declined`)',
  '- [ ] Onboarding done, roster and log updated',
];

/** The issue opened in joinoasa/admin for a new application. */
/** @returns {IssueDraft} */
export function applicantIssue(id, v) {
  const app = appNumber(id);
  const youth = v.age_group === YOUTH;
  const lines = [
    `<!-- oasa-app:${id} -->`,
    `**${app}** · applicant tracking issue.`,
    '',
    `Full application: \`npm run apps:show -- ${id}\` (in the website repo). Don't copy answers, emails or ages here.`,
    '',
  ];
  if (youth) {
    lines.push('Number only. Parent or guardian consent is needed before any trial.', '');
  } else {
    const gh = handle(v.github_username);
    const dc = handle(v.discord_handle);
    lines.push(`- GitHub: ${gh ? `\`${gh}\`` : '—'}`, `- Discord: ${dc ? `\`${dc}\`` : '—'}`, '');
  }
  if (/^[a-z0-9-]{1,40}$/.test(v.role ?? '')) lines.push(`**Applying for a role:** \`${v.role}\` (https://joinoasa.org/roles/#${v.role})`, '');
  lines.push('### Pipeline', ...CHECKLIST.map((l) => l.replaceAll('ID', String(id))));
  return {
    title: youth ? `${app}: guardian consent needed` : `${app}: ${firstName(v.name)}`,
    body: lines.join('\n'),
    labels: ['applicant', 'stage:new'],
  };
}

/** Opens the issue. Never throws: a failure is logged and the application is already safe in D1.
 *  `draft` may be a function, so even building it happens inside the guard. */
export async function openApplicantIssue(token, repo, draft, fetcher = fetch) {
  try {
    if (typeof draft === 'function') draft = draft();
    const res = await fetcher(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'joinoasa-worker',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      console.error('admin issue', res.status);
      return null;
    }
    const data = await res.json();
    return data.number ?? null;
  } catch (err) {
    console.error('admin issue failed', err);
    return null;
  }
}

// ---------- Weekly digest ----------


const who = (r) => (r.age_group === YOUTH ? `#${r.id} (15–17)` : `#${r.id} ${firstName(r.name)}`);
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

export function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Discord message text (under Discord's 2000-character limit). */
export function digestText(d) {
  const out = [`**Weekly applications digest** · ${d.today}`, `New applications in the last 7 days: ${d.newThisWeek}`];
  if (d.interviews.length) {
    out.push('', `**Interviews scheduled (${d.interviews.length})**`);
    for (const r of d.interviews) {
      const at = String(r.interview_at ?? '');
      out.push(`• ${who(r)} · ${at}${at.slice(0, 10) < d.today ? ' · date passed: record the outcome' : ''}`);
    }
  }
  if (d.trials.length) {
    out.push('', `**Trials ending within 7 days or overdue (${d.trials.length})**`);
    for (const r of d.trials) {
      const left = daysBetween(d.today, String(r.trial_end));
      out.push(`• ${who(r)} · ends ${r.trial_end} · ${left < 0 ? `${-left} day(s) overdue` : left === 0 ? 'today' : `${left} day(s) left`}`);
    }
  }
  if (d.waiting.length) {
    out.push('', `**Waiting more than ${WAIT_DAYS} days (${d.waiting.length})**`);
    for (const r of d.waiting) out.push(`• ${who(r)} · ${r.status} · ${daysBetween(String(r.created_at).slice(0, 10), d.today)} days`);
  }
  if (!d.interviews.length && !d.trials.length && !d.waiting.length) out.push('', 'Nothing needs attention.');
  out.push('', 'Details: `npm run apps:due` · Tracking: github.com/joinoasa/admin/issues');
  // Whole lines only, so a long digest never splits a line or a character.
  const kept = [];
  let size = 0;
  for (const line of out) {
    if (size + line.length + 1 > 1850) { kept.push('… (more: npm run apps:due)'); break; }
    kept.push(line);
    size += line.length + 1;
  }
  return kept.join('\n');
}

/** Reads D1 and posts the digest. Never throws. */
export async function sendDigest(db, webhook, now = new Date(), fetcher = fetch) {
  try {
    const today = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const waitCutoff = new Date(now.getTime() - WAIT_DAYS * 86400000).toISOString();
    const q = (sql, ...args) => db.prepare(sql).bind(...args).all().then((r) => r.results ?? []);
    const [fresh, interviews, trials, waiting] = await Promise.all([
      q('SELECT COUNT(*) AS n FROM applications WHERE created_at >= ?1', weekAgo),
      q("SELECT id, name, age_group, interview_at FROM applications WHERE status = 'interview' AND interview_at IS NOT NULL ORDER BY interview_at"),
      q("SELECT id, name, age_group, trial_end FROM applications WHERE status = 'trial' AND trial_end IS NOT NULL AND trial_end <= ?1 ORDER BY trial_end", addDays(today, 7)),
      q("SELECT id, name, age_group, status, created_at FROM applications WHERE status IN ('new', 'reviewing') AND created_at < ?1 ORDER BY created_at", waitCutoff),
    ]);
    const content = digestText({ today, newThisWeek: Number(fresh[0]?.n ?? 0), interviews, trials, waiting });
    const res = await fetcher(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
    if (!res.ok) console.error('digest webhook', res.status);
  } catch (err) {
    console.error('digest failed', err);
  }
}
