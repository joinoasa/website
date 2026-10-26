// Tests for the pure parts of build-techtree.mjs. Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIssueForm, parseTask, fetchTasks, TASK_REPOS } from './build-techtree.mjs';

const BODY = `### Node

R-COM2 (the encrypted link)

### Goal

Add replay tests.

### Done when

- \`cargo test\` passes
- new test covers replay

### Start here

_No response_

### Evidence

Checks table.

### Out of scope

Noise pattern.

### Size

Small (hours)

### Needs

_No response_`;

const issue = (over = {}) => ({
  number: 7, title: ' Replay tests ', html_url: 'https://github.com/joinoasa/oasa-sec/issues/7',
  body: BODY, updated_at: '2026-10-25T10:00:00Z',
  labels: [{ name: 'task' }, { name: 'agent-ready' }, { name: 'security-review' }],
  assignees: [{ login: 'ada' }], ...over,
});

test('parseIssueForm splits sections and blanks _No response_', () => {
  const f = parseIssueForm(BODY);
  assert.equal(f.Node, 'R-COM2 (the encrypted link)');
  assert.equal(f['Done when'], '- `cargo test` passes\n- new test covers replay');
  assert.equal(f['Start here'], '');
  assert.equal(f.Needs, '');
  assert.equal(f.Size, 'Small (hours)');
});

test('parseIssueForm handles CRLF, empty and missing bodies', () => {
  assert.equal(parseIssueForm('### Goal\r\n\r\nx\r\n').Goal, 'x');
  assert.deepEqual(parseIssueForm(''), {});
  assert.deepEqual(parseIssueForm(null), {});
});

test('parseTask maps fields, labels and assignees', () => {
  const t = parseTask(issue(), 'joinoasa/oasa-sec');
  assert.equal(t.repo, 'joinoasa/oasa-sec');
  assert.equal(t.number, 7);
  assert.equal(t.title, 'Replay tests');
  assert.equal(t.node, 'R-COM2');
  assert.equal(t.agentReady, true);
  assert.equal(t.needsHardware, false);
  assert.equal(t.securityReview, true);
  assert.deepEqual(t.assignees, ['ada']);
  assert.equal(t.goal, 'Add replay tests.');
  assert.equal(t.startHere, '');
  assert.equal(t.outOfScope, 'Noise pattern.');
  assert.equal(t.size, 'Small (hours)');
  assert.equal(t.updated, '2026-10-25T10:00:00Z');
});

test('parseTask node: section wins, then node: label, else null', () => {
  const lab = [{ name: 'task' }, { name: 'node:T-DOCK2' }];
  assert.equal(parseTask(issue({ body: '### Node\n\n_No response_', labels: lab }), 'r').node, 'T-DOCK2');
  assert.equal(parseTask(issue({ labels: lab }), 'r').node, 'R-COM2');
  assert.equal(parseTask(issue({ body: '', labels: ['task'] }), 'r').node, null);
  assert.equal(parseTask(issue({ body: '### Node\n\nnone yet', labels: ['task'] }), 'r').node, null);
});

test('parseTask skips pull requests and tolerates a free-form body', () => {
  assert.equal(parseTask(issue({ pull_request: {} }), 'r'), null);
  const t = parseTask(issue({ body: 'just text', labels: [] }), 'r');
  assert.equal(t.goal, '');
  assert.deepEqual(t.labels, []);
});

test('fetchTasks reads every repo and sorts', async () => {
  const seen = [];
  const fetchFn = async (url) => {
    seen.push(url);
    const repo = url.match(/repos\/([^/]+\/[^/]+)\//)[1];
    return { ok: true, json: async () => [issue({ number: repo.endsWith('lab') ? 2 : 1 }), issue({ number: 9, pull_request: {} })] };
  };
  const tasks = await fetchTasks({ fetchFn, repos: ['joinoasa/oasa-sec', 'joinoasa/oasa-lab'], token: '' });
  assert.equal(seen.length, 2);
  assert.ok(seen.every((u) => u.includes('state=open') && u.includes('labels=task')));
  assert.deepEqual(tasks.map((t) => `${t.repo}#${t.number}`), ['joinoasa/oasa-lab#2', 'joinoasa/oasa-sec#1']);
});

test('fetchTasks throws on a GitHub error', async () => {
  await assert.rejects(fetchTasks({ fetchFn: async () => ({ ok: false, status: 403 }), repos: ['a/b'], token: '' }), /403/);
});

test('TASK_REPOS lists the five code repos', () => {
  assert.equal(TASK_REPOS.length, 5);
});
