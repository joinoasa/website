// Tests for the home page tree drawing's layout (src/components/home/tree-layout.mjs). Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { treeLayout, tally, spread, shortName, fanSlots, VIEW } from '../src/components/home/tree-layout.mjs';

const BRANCHES = { 'Roots': 21, 'Sensing': 13, 'Trunk': 46, 'Air': 10, 'Lighter-than-air & wind': 7, 'Ground': 10, 'Surface water': 7, 'Underwater': 7, 'Manipulation': 14, 'Operations': 26, 'Infrastructure inspection': 11, 'Commercial services': 6, 'Space': 5 };
const OPEN = new Set(['Roots-0', 'Roots-2', 'Roots-4', 'Roots-6', 'Roots-8', 'Sensing-0', 'Trunk-3', 'Trunk-9', 'Trunk-20', 'Manipulation-5']);

function makeTree(branches = BRANCHES, statusOf = (id) => (OPEN.has(id) ? 'available' : 'locked')) {
  const nodes = [];
  for (const [branch, n] of Object.entries(branches)) for (let i = 0; i < n; i++) { const id = `${branch}-${i}`; nodes.push({ id, name: `Node ${id}`, branch, status: statusOf(id) }); }
  return { nodes, branches: Object.keys(branches), moonshots: Array(24).fill({}), starshots: Array(5).fill({}) };
}
const allDots = (L) => [...L.trunk.dots, ...L.roots.dots, ...L.roots.tips, ...L.branches.flatMap((b) => b.dots)];
const inView = (d) => Number.isFinite(d.x) && Number.isFinite(d.y) && d.x >= 0 && d.x <= VIEW.width && d.y >= 0 && d.y <= VIEW.height;

test('every technology is exactly one dot, and statuses are kept', () => {
  const tree = makeTree(), L = treeLayout(tree), dots = allDots(L);
  assert.equal(dots.length, tree.nodes.length);
  assert.equal(dots.filter((d) => d.status === 'available').length, OPEN.size);
  assert.equal(dots.filter((d) => d.status === 'locked').length, tree.nodes.length - OPEN.size);
  assert.ok(dots.every(inView));
  assert.deepEqual(L.totals, { total: 183, available: 10, 'in-progress': 0, done: 0, locked: 173 });
});

test('the usual eleven branches use the hand-placed canopy with their own glyphs and short labels', () => {
  const L = treeLayout(makeTree());
  assert.equal(L.branches.length, 11);
  const space = L.branches.find((b) => b.name === 'Space');
  assert.deepEqual([space.x, space.y, space.glyph, space.count], [500, 186, 'cubesat', 5]);
  assert.equal(L.branches.find((b) => b.name === 'Infrastructure inspection').label, 'Inspection');
  assert.equal(new Set(L.branches.map((b) => `${b.x},${b.y}`)).size, 11, 'no two branches share a tip');
  for (const b of L.branches) assert.equal(b.dots.length, b.count);
});

test('root tips name up to five roots, open ones first, in source order', () => {
  const L = treeLayout(makeTree());
  assert.deepEqual(L.roots.tips.map((t) => t.id), ['Roots-0', 'Roots-2', 'Roots-4', 'Roots-6', 'Roots-8']);
  assert.ok(L.roots.tips.every((t) => t.status === 'available'));
  assert.equal(L.roots.dots.length, 21 - 5);
  assert.equal(L.roots.paths.length, 5);

  const few = treeLayout(makeTree({ Roots: 3, Trunk: 2, Air: 4 }, (id) => (id === 'Roots-2' ? 'done' : 'locked')));
  assert.deepEqual(few.roots.tips.map((t) => t.id), ['Roots-0', 'Roots-1', 'Roots-2']);
  assert.equal(few.roots.dots.length, 0);
});

test('a renamed or new branch still gets a slot, a label and a glyph', () => {
  const b = { ...BRANCHES }; delete b['Space']; b['Swarm logistics'] = 4;
  const L = treeLayout(makeTree(b));
  const extra = L.branches.find((x) => x.name === 'Swarm logistics');
  assert.deepEqual([extra.x, extra.y, extra.label, extra.glyph], [500, 186, 'Swarm logistics', 'tower']);
  assert.equal(allDots(L).length, L.totals.total);
});

test('any other number of branches fans out inside the drawing', () => {
  for (const n of [0, 1, 4, 12, 15]) {
    const b = { Roots: 6, Trunk: 9 };
    for (let i = 0; i < n; i++) b[`Branch ${i}`] = 3 + i;
    const tree = makeTree(b), L = treeLayout(tree);
    assert.equal(L.branches.length, n);
    assert.equal(new Set(L.branches.map((x) => `${x.x},${x.y}`)).size, n);
    const dots = allDots(L);
    assert.equal(dots.length, tree.nodes.length);
    assert.ok(dots.every(inView), `dots in view for ${n} branches`);
  }
  assert.equal(fanSlots(1)[0].x, 500);
});

test('in-progress and done nodes show up, and unknown statuses count as locked', () => {
  const tree = makeTree({ Roots: 6, Trunk: 12, Air: 8 }, (id) => ({ 'Trunk-1': 'in-progress', 'Trunk-2': 'done', 'Air-0': 'done', 'Air-1': 'mystery' })[id] ?? 'locked');
  const L = treeLayout(tree), dots = allDots(L);
  assert.equal(dots.filter((d) => d.status === 'in-progress').length, 1);
  assert.equal(dots.filter((d) => d.status === 'done').length, 2);
  assert.equal(L.totals.locked, 26 - 3);
  assert.ok(dots.every((d) => ['available', 'in-progress', 'done', 'locked'].includes(d.status)));
});

test('moonshots and starshots: counts are kept, and none is fine', () => {
  const L = treeLayout(makeTree());
  assert.equal(L.sky.moonshots.dots.length, 24);
  assert.equal(L.sky.starshots.stars.length, 5);
  const bare = treeLayout({ nodes: [], moonshots: [], starshots: [] });
  assert.deepEqual([bare.sky.moonshots.dots.length, bare.sky.starshots.stars.length, bare.branches.length, bare.trunk.dots.length], [0, 0, 0, 0]);
  const many = treeLayout({ ...makeTree(), starshots: Array(40).fill({}) });
  assert.equal(many.sky.starshots.count, 40);
  assert.ok(many.sky.starshots.stars.length <= 8, 'only as many stars as there is room for');
});

test('helpers', () => {
  assert.deepEqual(tally([{ status: 'available' }, { status: 'done' }, { status: '?' }]), { total: 3, available: 1, 'in-progress': 0, done: 1, locked: 1 });
  assert.deepEqual(spread({ total: 4, available: 4, 'in-progress': 0, done: 0, locked: 0 }), Array(4).fill('available'));
  assert.equal(spread({ total: 9, available: 1, 'in-progress': 1, done: 1, locked: 6 }).filter((s) => s !== 'locked').length, 3);
  assert.equal(shortName('Device identity, keys, pairing'), 'Device identity');
  assert.equal(shortName('Basic radio link (off-the-shelf)'), 'Basic radio link');
  assert.equal(shortName('Batteries and BMS basics'), 'Batteries');
  assert.ok(shortName('An extremely long technology name with no breaks').length <= 18);
  assert.equal(shortName('<script>alert(1)</script>'), '<script>alert(1)<…', 'names are data: the page escapes them, the layout only shortens');
});
