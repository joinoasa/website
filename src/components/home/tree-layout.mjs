// Layout for the home page drawing of the tech tree as a tree.
// Pure data in, plain numbers out, so it can be tested with `npm test` (no Astro needed).
// Every technology is one dot: roots in the soil, the trunk, then one ring per branch.
// Coordinates use a 1000 x 1240 viewBox; the ground line is at y = 880.

export const VIEW = { width: 1000, height: 1240, ground: 880 };

const STATUSES = ['available', 'in-progress', 'done', 'locked'];
const r1 = (v) => Math.round(v * 10) / 10;
const rand = (n) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); };

/** How each known branch is shown. Unknown branches get the next free slot, their own name and a tower glyph. */
const BRANCH_ART = {
  'Sensing': { slot: 0, glyph: 'pole' },
  'Operations': { slot: 1, glyph: 'hive', dx: 16 },
  'Ground': { slot: 2, glyph: 'rover' },
  'Infrastructure inspection': { slot: 3, glyph: 'crawler', label: 'Inspection' },
  'Air': { slot: 4, glyph: 'quad' },
  'Space': { slot: 5, glyph: 'cubesat' },
  'Lighter-than-air & wind': { slot: 6, glyph: 'blimp', label: 'Lighter than air', dx: 40 },
  'Surface water': { slot: 7, glyph: 'boat' },
  'Underwater': { slot: 8, glyph: 'sub' },
  'Commercial services': { slot: 9, glyph: 'snowbot', label: 'Services' },
  'Manipulation': { slot: 10, glyph: 'reefbot' },
};

/** Hand-placed canopy for the usual eleven branches: tip x/y, where the branch leaves the trunk, label side. */
const SLOTS_11 = [
  { x: 128, y: 526, sy: 716, lab: 'below' },
  { x: 231, y: 437, sy: 676, lab: 'below' },
  { x: 171, y: 335, sy: 640, lab: 'above' },
  { x: 320, y: 378, sy: 610, lab: 'above' },
  { x: 388, y: 252, sy: 588, lab: 'above' },
  { x: 500, y: 186, sy: 572, lab: 'above' },
  { x: 612, y: 252, sy: 588, lab: 'above' },
  { x: 680, y: 378, sy: 610, lab: 'above' },
  { x: 829, y: 335, sy: 640, lab: 'above' },
  { x: 769, y: 437, sy: 676, lab: 'below' },
  { x: 872, y: 526, sy: 716, lab: 'below' },
];

/** Any other branch count: fan the tips over the trunk on two alternating arcs. */
export function fanSlots(n) {
  return Array.from({ length: n }, (_, i) => {
    const deg = n === 1 ? 90 : 192 - (i * 204) / (n - 1);
    const a = (deg * Math.PI) / 180, f = i % 2 ? 0.68 : 1;
    return { x: r1(500 + 380 * f * Math.cos(a)), y: r1(470 - 270 * f * Math.sin(a)), sy: r1(572 + 144 * Math.abs(Math.cos(a))), lab: deg > 160 || deg < 20 ? 'below' : 'above' };
  });
}

/** Count nodes by status. */
export function tally(nodes) {
  const t = { total: nodes.length, available: 0, 'in-progress': 0, done: 0, locked: 0 };
  for (const n of nodes) t[STATUSES.includes(n.status) ? n.status : 'locked']++;
  return t;
}

/**
 * Statuses for `n` dots. Dots are anonymous, so the few that aren't locked are
 * spread evenly through the run where they can be seen, in the order open, in progress, done.
 */
export function spread(t, n = t.total) {
  const special = [...Array(t.available).fill('available'), ...Array(t['in-progress']).fill('in-progress'), ...Array(t.done).fill('done')].slice(0, n);
  const out = Array(n).fill('locked');
  special.forEach((s, j) => {
    let i = Math.min(n - 1, Math.floor(((j + 0.5) * n) / special.length));
    while (out[i] !== 'locked') i = (i + 1) % n;
    out[i] = s;
  });
  return out;
}

/** Short label for a node name: "Device identity, keys, pairing" becomes "Device identity". */
export function shortName(name, max = 18) {
  const s = String(name).split(/ \(|: |, | and /)[0].trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

const cubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
};

const ROOT_STARTS = [472, 486, 500, 514, 528];
const ROOT_TIPS = [[216, 1040], [346, 1108], [500, 1124], [654, 1108], [784, 1040]];
const STAR_SPOTS = [[118, 96, 15], [214, 52, 10], [52, 190, 9], [282, 132, 8], [352, 58, 11], [430, 124, 7], [30, 92, 7], [176, 204, 7]];
const MOON = { x: 852, y: 122, r: 56, orbit: 84 };

/**
 * @param {{ nodes: {id: string, name: string, branch: string, status: string}[], moonshots?: unknown[], starshots?: unknown[], branches?: string[] }} tree
 */
export function treeLayout(tree) {
  const byBranch = new Map();
  for (const n of tree.nodes) (byBranch.get(n.branch) ?? byBranch.set(n.branch, []).get(n.branch)).push(n);
  const rootNodes = byBranch.get('Roots') ?? [];
  const trunkNodes = byBranch.get('Trunk') ?? [];
  const order = (tree.branches ?? [...byBranch.keys()]).filter((b) => b !== 'Roots' && b !== 'Trunk' && byBranch.has(b));

  // ---- roots: up to five named tips (open ones first), the rest as dots along the roots
  const rank = (n) => { const i = STATUSES.indexOf(n.status); return i < 0 ? 3 : i; };
  const tipNodes = [...rootNodes].sort((a, b) => rank(a) - rank(b)).slice(0, ROOT_TIPS.length)
    .sort((a, b) => rootNodes.indexOf(a) - rootNodes.indexOf(b));
  const curves = ROOT_TIPS.map(([tx, ty], i) => {
    const sx = ROOT_STARTS[i];
    return [[sx, VIEW.ground - 2], [sx, 968], [r1(tx + (500 - tx) * 0.34), ty - 84], [tx, ty]];
  });
  const rest = rootNodes.filter((n) => !tipNodes.includes(n));
  const restStatus = spread(tally(rest));
  // Share the rest between the five roots, centre root first.
  const per = ROOT_TIPS.map(() => Math.floor(rest.length / ROOT_TIPS.length));
  [2, 1, 3, 0, 4].slice(0, rest.length % ROOT_TIPS.length).forEach((i) => per[i]++);
  const rootDots = [];
  let ri = 0;
  curves.forEach((c, i) => {
    for (let k = 0; k < per[i]; k++) { const [x, y] = cubic(...c, 0.3 + (k * 0.5) / per[i]); rootDots.push({ x: r1(x), y: r1(y), status: restStatus[ri++] }); }
  });
  const roots = {
    count: rootNodes.length,
    paths: curves.map(([p0, p1, p2, p3]) => `M${p0[0]} ${p0[1]}C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`),
    dots: rootDots,
    tips: tipNodes.map((n, i) => ({ x: ROOT_TIPS[i][0], y: ROOT_TIPS[i][1], id: n.id, name: shortName(n.name), status: STATUSES.includes(n.status) ? n.status : 'locked' })),
  };

  // ---- trunk: three columns of dots, bottom up
  const rows = Math.ceil(trunkNodes.length / 3);
  const step = rows > 1 ? Math.min(19, 296 / (rows - 1)) : 19;
  const trunkStatus = spread(tally(trunkNodes));
  const trunkDots = trunkStatus.map((status, i) => {
    const row = Math.floor(i / 3), inRow = Math.min(3, trunkNodes.length - row * 3), col = i % 3;
    const x = inRow === 3 ? [481, 500, 519][col] : inRow === 2 ? [490.5, 509.5][col] : 500;
    return { x, y: r1(862 - row * step), status };
  });

  // ---- branches: one ring of dots per branch around a badge
  const slots = order.length === SLOTS_11.length ? SLOTS_11 : fanSlots(order.length);
  const taken = new Set();
  const placed = order.map((name) => {
    const art = BRANCH_ART[name];
    if (art && slots === SLOTS_11 && !taken.has(art.slot)) { taken.add(art.slot); return { name, art, slot: art.slot }; }
    return { name, art, slot: -1 };
  });
  const free = slots.map((_, i) => i).filter((i) => !taken.has(i));
  for (const p of placed) if (p.slot < 0) p.slot = free.shift();
  const branches = placed.sort((a, b) => a.slot - b.slot).map(({ name, art, slot }) => {
    const s = slots[slot], nodes = byBranch.get(name), n = nodes.length;
    const side = Math.sign(s.x - 500), sx = 500 + side * 14;
    const c1 = [r1(sx + (s.x - sx) * 0.1), r1(s.sy - (s.sy - s.y) * 0.6)], c2 = [r1(s.x - (s.x - sx) * 0.42), r1(s.y + (s.sy - s.y) * 0.2)];
    const R = Math.max(40, (n * 12.6) / (2 * Math.PI));
    const status = spread(tally(nodes));
    const labelY = s.lab === 'above' ? s.y - R - 13 : s.y + R + 31;
    return {
      name, label: art?.label ?? name, glyph: art?.glyph ?? 'tower', count: n, x: s.x, y: s.y,
      path: `M${sx} ${s.sy}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${s.x} ${s.y}`,
      width: r1(5 + (s.sy - 572) / 26),
      dots: status.map((st, k) => { const a = -Math.PI / 2 + 0.2 + (k / n) * Math.PI * 2; return { x: r1(s.x + R * Math.cos(a)), y: r1(s.y + R * Math.sin(a)), status: st }; }),
      labelX: s.x + (art?.dx ?? 0), labelY: r1(labelY), countY: r1(labelY + (s.lab === 'above' ? -25 : 23)),
    };
  });

  // ---- sky
  const moonshots = tree.moonshots?.length ?? 0, starshots = tree.starshots?.length ?? 0;
  const sky = {
    specks: Array.from({ length: 110 }, (_, i) => ({ x: r1(rand(i + 3) * VIEW.width), y: r1(rand(i + 51) * 820), r: r1(0.5 + rand(i + 17) * 1.1), o: r1(0.25 + rand(i + 5) * 0.55) })),
    moon: MOON,
    moonshots: { count: moonshots, dots: Array.from({ length: moonshots }, (_, i) => { const a = (i / moonshots) * Math.PI * 2 + 0.13; return { x: r1(MOON.x + MOON.orbit * Math.cos(a)), y: r1(MOON.y + MOON.orbit * Math.sin(a)) }; }) },
    starshots: { count: starshots, stars: STAR_SPOTS.slice(0, starshots).map(([x, y, r]) => ({ x, y, r })) },
  };

  return { view: VIEW, roots, trunk: { count: trunkNodes.length, dots: trunkDots }, branches, sky, totals: tally(tree.nodes) };
}

/** Four-point star like the one in the OASA mark. */
export const star4 = (x, y, r, k = 0.28) => {
  const q = r1(r * k);
  return `M${x} ${y - r}L${x + q} ${y - q}L${x + r} ${y}L${x + q} ${y + q}L${x} ${y + r}L${x - q} ${y + q}L${x - r} ${y}L${x - q} ${y - q}Z`;
};
