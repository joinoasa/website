// Keeps the applicant issues in joinoasa/admin in step with D1, using the GitHub CLI (gh).
// Optional: if gh is missing or not logged in, the apps:* scripts still work and say so.
// No shell is used, and only the application number, first name and handles reach GitHub.
import { execFileSync } from 'node:child_process';
import { ADMIN_REPO, appNumber } from '../worker/admin.js';

const STAGE = {
  new: 'stage:new',
  reviewing: 'stage:reviewing',
  interview: 'stage:interview',
  trial: 'stage:trial',
  accepted: 'stage:onboarding',   // onboarding starts; close with outcome:accepted when it's done
  declined: 'outcome:declined',
  withdrawn: 'outcome:withdrawn',
};
const CLOSES = new Set(['declined', 'withdrawn']);

function gh(args, input) {
  return execFileSync('gh', args, { encoding: 'utf8', input, stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
}
const api = (path, ...rest) => gh(['api', ...rest, `repos/${ADMIN_REPO}/${path}`]);

/** The applicant issue for an application, or null. Throws if gh can't run. */
export function findIssue(id) {
  const app = appNumber(id);
  const out = gh(['api', '--paginate', `repos/${ADMIN_REPO}/issues?labels=applicant&state=all&per_page=100`,
    '--jq', '.[] | select(.pull_request == null) | {number, title, state, labels: [.labels[].name], marked: ((.body // "") | contains("<!-- oasa-app:' + String(Number(id)) + ' -->"))}']);
  const issues = out.split('\n').filter(Boolean).map((l) => JSON.parse(l));
  // The hidden marker survives a renamed title; the title prefix covers issues made with the form.
  return issues.find((i) => i.marked) ?? issues.find((i) => i.title.startsWith(`${app}:`)) ?? null;
}

/** Moves the issue to the label for `status`. Never throws; prints what happened.
 *  With dry, it still reads the issue from GitHub (a GET) but changes nothing. */
export function syncIssue(id, status, { dry = false } = {}) {
  const label = STAGE[status];
  if (!label) return;
  let issue;
  try {
    issue = findIssue(id);
  } catch {
    console.log(`GitHub: not updated (gh missing or not logged in). Move ${appNumber(id)} to ${label} in ${ADMIN_REPO} by hand.`);
    return;
  }
  if (!issue) {
    console.log(`GitHub: no issue for ${appNumber(id)} in ${ADMIN_REPO}. Create one with: npm run apps:issue -- ${id}`);
    return;
  }
  // Onboarding finished (closed with outcome:accepted): a later "accepted" changes nothing.
  if (status === 'accepted' && issue.state === 'closed' && issue.labels.includes('outcome:accepted')) {
    console.log(`GitHub: ${ADMIN_REPO}#${issue.number} is already onboarded and closed; left as is.`);
    return;
  }
  const add = issue.labels.includes(label) ? null : label;
  // outcome:accepted is set by hand at the end of onboarding; only a decline or withdrawal removes it.
  const old = issue.labels.filter((n) => /^(stage|outcome):/.test(n) && n !== label && (n !== 'outcome:accepted' || CLOSES.has(status)));
  const close = CLOSES.has(status) && issue.state !== 'closed';
  // Reopen only when a declined or withdrawn applicant comes back.
  const reopen = !CLOSES.has(status) && issue.state === 'closed' && issue.labels.some((n) => n === 'outcome:declined' || n === 'outcome:withdrawn');
  if (!add && !old.length && !close && !reopen) {
    console.log(`GitHub: ${ADMIN_REPO}#${issue.number} is already ${label}.`);
    return;
  }
  if (dry) {
    console.log(`GitHub (dry): #${issue.number}${add ? ` add ${add}` : ''}${old.length ? `, remove ${old.join(', ')}` : ''}${close ? ', close' : ''}${reopen ? ', reopen' : ''}`);
    return;
  }
  try {
    if (add) api(`issues/${issue.number}/labels`, '-X', 'POST', '-f', `labels[]=${add}`, '--silent');
    for (const n of old) api(`issues/${issue.number}/labels/${encodeURIComponent(n)}`, '-X', 'DELETE', '--silent');
    if (close || reopen) api(`issues/${issue.number}`, '-X', 'PATCH', '-f', `state=${close ? 'closed' : 'open'}`, '--silent');
    console.log(`GitHub: ${ADMIN_REPO}#${issue.number} is now ${label}${close ? ' (closed)' : ''}.`);
  } catch (err) {
    console.log(`GitHub: update failed (${String(err.stderr ?? err.message).trim().split('\n')[0]}). Move it by hand.`);
  }
}

/** Opens an applicant issue from a drafted issue. Returns the URL. Throws on failure. */
export function createIssue(draft, { dry = false } = {}) {
  if (dry) {
    console.log(`Would open in ${ADMIN_REPO}: ${draft.title} [${draft.labels.join(', ')}]\n---\n${draft.body}`);
    return '';
  }
  return gh(['api', '-X', 'POST', `repos/${ADMIN_REPO}/issues`, '--input', '-', '--jq', '.html_url'], JSON.stringify(draft)).trim();
}
