// Tests for the pure parts of build-techtree.mjs. Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIssueForm, parseTask, fetchTasks, TASK_REPOS, mergeEstimates } from './build-techtree.mjs';

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

test('mergeEstimates validates nodes and rolls up moonshots over the nodes still needed', () => {
  const json = {
    nodes: [{ id: 'A-1', status: 'done' }, { id: 'A-2', status: 'locked' }, { id: 'A-3', status: 'available' }, { id: 'A-4', status: 'locked' }],
    moonshots: [{ id: 'MS-1', needs: { nodes: ['A-1', 'A-2', 'A-3', 'A-4'], moonshots: [] } }],
    starshots: [],
  };
  const e = (h, r) => ({ hours: h, parts_usd: [10, 20], lab_hours: [1, 2], field_days: [0, 1], resources: r, skills: ['RF'] });
  const warnings = mergeEstimates(json, {
    $comment: 'ignored',
    'A-1': e([1, 2, 3], ['SDR']),
    'A-2': e([10, 20, 40], ['SDR', 'Oscilloscope']),
    'A-3': { ...e([5, 5, 5], ['Oscilloscope']), basis: ' checked ' },
    'A-4': { hours: [3, 2, 1] },
    'Z-9': e([1, 1, 1], []),
  });
  assert.ok(warnings.some((w) => w.includes('unknown node Z-9')));
  assert.ok(warnings.some((w) => w.includes('A-4 hours must be 3 ascending')));
  assert.equal(json.nodes[3].estimate, null);
  assert.equal(json.nodes[2].estimate.basis, 'checked');
  const m = json.moonshots[0].estimate;
  assert.deepEqual(m.hours, [15, 25, 45]); // A-1 is done, A-4 has no valid estimate
  assert.deepEqual(m.parts_usd, [20, 40]);
  assert.equal(m.nodes, 2);
  assert.equal(m.missing, 1);
  assert.equal(m.done, 1);
  assert.deepEqual(m.resources, [{ name: 'Oscilloscope', nodes: 2 }, { name: 'SDR', nodes: 1 }]);
  assert.deepEqual(m.skills, ['RF']);
});

test('mergeEstimates without a file: no node estimates, moonshots count what is missing', () => {
  const json = { nodes: [{ id: 'A-1', status: 'locked' }], moonshots: [{ id: 'MS-1', needs: { nodes: ['A-1'], moonshots: [] } }], starshots: [] };
  assert.deepEqual(mergeEstimates(json, undefined), []);
  assert.equal(json.nodes[0].estimate, null);
  assert.equal(json.moonshots[0].estimate.nodes, 0);
  assert.equal(json.moonshots[0].estimate.missing, 1); // still says how many aren't estimated
});

test('mergeEstimates takes only the cheapest alternative and checks names and lab hours', () => {
  const e = (likely, r = []) => ({ hours: [likely, likely, likely], parts_usd: [0, 0], lab_hours: [0, 0], field_days: [0, 0], resources: r, skills: [] });
  const json = {
    nodes: [
      { id: 'B-1', status: 'locked', requiresGroups: [{ kind: 'any', ids: ['B-2', 'B-3'], text: [] }, { kind: 'atLeast', n: 1, ids: ['B-4', 'B-5'] }] },
      { id: 'B-2', status: 'locked' }, { id: 'B-3', status: 'locked' }, { id: 'B-4', status: 'done' }, { id: 'B-5', status: 'locked' },
      { id: 'B-6', status: 'locked' },
    ],
    moonshots: [{ id: 'MS-1', needs: { nodes: ['B-1'], moonshots: [] } }],
    starshots: [{ id: 'ST-1', needs: { nodes: [], moonshots: ['MS-1'] } }],
  };
  const warnings = mergeEstimates(json, {
    $resources: ['SDR'],
    'B-1': e(10, ['SDR']), 'B-2': e(100), 'B-3': e(5, ['Typo']), 'B-5': e(50),
    'B-6': { ...e(1), lab_hours: [0, 9] },
  });
  assert.ok(warnings.includes('estimates: B-3 resource "Typo" is not in $resources'));
  assert.ok(warnings.includes('estimates: no entry for B-4'));
  assert.ok(warnings.includes('estimates: B-6 lab_hours can\'t exceed hours'));
  const m = json.moonshots[0].estimate;
  assert.deepEqual(m.hours, [15, 15, 15]); // B-1 + cheaper B-3; B-4 (done) beats B-5
  assert.equal(m.done, 1);
  assert.deepEqual(json.starshots[0].estimate.hours, [15, 15, 15]); // through MS-1
});
