// Tests for worker/admin.js.
// Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { appNumber, firstName, applicantIssue, openApplicantIssue, digestText, sendDigest } from '../worker/admin.js';

test('app numbers are zero-padded', () => {
  assert.equal(appNumber(7), 'APP-0007');
  assert.equal(appNumber(12345), 'APP-12345');
});

test('first name keeps letters only and never comes back empty', () => {
  assert.equal(firstName('Daniel Polk'), 'Daniel');
  assert.equal(firstName("  Ana-María O'Neil"), 'Ana-María');
  assert.equal(firstName('**bold** [x](http://evil)'), 'bold');
  assert.equal(firstName(''), 'applicant');
  assert.equal(firstName('<script>'), 'script');
});

test('adult issue: first name and handles, no email, age or answers', () => {
  const issue = applicantIssue(3, {
    name: 'Daniel Polk', age_group: '18+', github_username: 'Dpolk98', discord_handle: 'dan.p',
    email: 'dan@example.com', city_state: 'Reston, VA', why: 'secret answer',
  });
  assert.equal(issue.title, 'APP-0003: Daniel');
  assert.deepEqual(issue.labels, ['applicant', 'stage:new']);
  assert.match(issue.body, /`Dpolk98`/);
  assert.match(issue.body, /`dan\.p`/);
  assert.match(issue.body, /apps:show -- 3/);
  assert.match(issue.body, /<!-- oasa-app:3 -->/);
  for (const leak of ['dan@example.com', 'Reston', 'secret answer', 'Polk', '18+']) assert.ok(!issue.body.includes(leak), leak);
});

test('youth issue: number only', () => {
  const issue = applicantIssue(9, { name: 'Kid Name', age_group: '15-17', github_username: 'kidgh', discord_handle: 'kiddc' });
  assert.equal(issue.title, 'APP-0009: guardian consent needed');
  for (const leak of ['Kid', 'kidgh', 'kiddc']) assert.ok(!issue.body.includes(leak), leak);
});

test('role: shown when picked, dropped when odd', () => {
  assert.match(applicantIssue(5, { name: 'A', age_group: '18+', role: 'network-engineer' }).body, /Applying for a role:\*\* `network-engineer`/);
  assert.ok(!applicantIssue(6, { name: 'A', age_group: '18+', role: 'x`](evil)' }).body.includes('role'));
  assert.ok(!applicantIssue(7, { name: 'A', age_group: '18+' }).body.includes('Applying for'));
});

test('odd handles are dropped, not pasted', () => {
  const issue = applicantIssue(4, { name: 'A', age_group: '18+', github_username: 'bad name`](x)', discord_handle: '' });
  assert.match(issue.body, /- GitHub: —/);
  assert.match(issue.body, /- Discord: —/);
});

test('openApplicantIssue posts to the admin repo and never throws', async () => {
  let seen;
  const ok = async (url, init) => { seen = { url, init }; return new Response(JSON.stringify({ number: 42 }), { status: 201 }); };
  assert.equal(await openApplicantIssue('t0k', 'joinoasa/admin', applicantIssue(1, { name: 'X', age_group: '18+' }), ok), 42);
  assert.equal(seen.url, 'https://api.github.com/repos/joinoasa/admin/issues');
  assert.equal(seen.init.headers.Authorization, 'Bearer t0k');
  const quiet = console.error; console.error = () => {};
  try {
    assert.equal(await openApplicantIssue('t', 'r', { title: '', body: '', labels: [] }, async () => new Response('', { status: 403 })), null);
    assert.equal(await openApplicantIssue('t', 'r', { title: '', body: '', labels: [] }, async () => { throw new Error('down'); }), null);
  } finally { console.error = quiet; }
});

test('digest lists what needs attention and hides youth names', () => {
  const text = digestText({
    today: '2026-11-02', newThisWeek: 2,
    interviews: [{ id: 5, name: 'Sam Lee', interview_at: '2026-11-01T15:00' }],
    trials: [{ id: 6, name: 'Kid', age_group: '15-17', trial_end: '2026-11-04' }],
    waiting: [{ id: 7, name: 'Pat Q', status: 'new', created_at: '2026-10-20T10:00:00Z' }],
  });
  assert.match(text, /New applications in the last 7 days: 2/);
  assert.match(text, /#5 Sam · 2026-11-01T15:00 · date passed/);
  assert.match(text, /#6 \(15–17\) · ends 2026-11-04 · 2 day\(s\) left/);
  assert.match(text, /#7 Pat · new · 13 days/);
  assert.ok(!text.includes('Kid'));
  assert.ok(!text.includes('Lee'));
  assert.ok(text.length < 2000);
});

test('empty digest says so', () => {
  assert.match(digestText({ today: '2026-11-02', newThisWeek: 0, interviews: [], trials: [], waiting: [] }), /Nothing needs attention/);
});

test('sendDigest queries D1 and posts once', async () => {
  const sqls = [];
  const db = { prepare(sql) { return { bind(...args) { sqls.push([sql, args]); return { all: async () => ({ results: sql.includes('COUNT') ? [{ n: 1 }] : [] }) }; } }; } };
  let body;
  await sendDigest(db, 'https://discord.test/hook', new Date('2026-11-02T13:05:00Z'), async (_u, init) => { body = JSON.parse(init.body); return new Response('', { status: 204 }); });
  assert.equal(sqls.length, 4);
  assert.match(body.content, /last 7 days: 1/);
  assert.deepEqual(body.allowed_mentions, { parse: [] });
  assert.ok(sqls.every(([sql]) => !/email/i.test(sql)), 'digest never reads email');
});

test('openApplicantIssue builds the draft inside its guard', async () => {
  const quiet = console.error; console.error = () => {};
  try {
    assert.equal(await openApplicantIssue('t', 'r', () => { throw new Error('bad'); }, async () => new Response('{}')), null);
  } finally { console.error = quiet; }
});

test('long digests are cut at whole lines', () => {
  const many = Array.from({ length: 80 }, (_, i) => ({ id: i + 1, name: '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙', status: 'new', created_at: '2026-10-01T00:00:00Z' }));
  const text = digestText({ today: '2026-11-02', newThisWeek: 80, interviews: [], trials: [], waiting: many });
  assert.ok(text.length <= 1900);
  assert.match(text, /… \(more: npm run apps:due\)$/);
  assert.ok(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(text), 'no lone surrogates');
});
