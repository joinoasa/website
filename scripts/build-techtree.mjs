// Parses source/OASA-techtree.md into src/data/techtree.json.
// Run by `npm run techtree`, and by the nightly GitHub Action.
// Government (company-track) sections are excluded from the public site.
//
// Data model: the Requires column is the single source of truth.
//   - commas and "+" separate terms; every term is required
//   - "A or B" in a term: any one of them (alternatives may be free text)
//   - "two of A/B/C": at least N of the listed IDs
//   - a parenthetical after an ID is a note: "A-1 (heavy-lift)"
// Unlocks is derived (inverse of Requires, plus moonshots whose key-node list names the node).
// Status: 🟡 and ✅ are set by hand; 🟢 and 🔒 are computed from Requires.
// This script never writes the source document. `scripts/sync-techtree.mjs` does that.
//
// Live status: in GitHub Actions (GITHUB_ACTIONS=true) or with TECHTREE_GITHUB=1, issue labels and
// assignees from joinoasa/techtree are merged in (see fetchGithubNodes / applyGithub), and ideas from
// joinoasa/ideas are linked to the nodes they were sorted onto (src/data/ideas.json), and open `task`
// issues from the code repos are written to src/data/tasks.json. A failure only warns.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const SRC = new URL('../source/OASA-techtree.md', import.meta.url);
const OUT_DIR = new URL('../src/data/', import.meta.url);
const OUT = new URL('techtree.json', OUT_DIR);
// Optional per-node details: brief, GitHub link, lead and team. Keyed by node or moonshot ID.
const DETAILS = new URL('../source/techtree-details.json', import.meta.url);
const DETAIL_KEYS = ['brief', 'github', 'lead', 'team'];

/** Merge source/techtree-details.json into nodes and moonshots. Returns warnings. */
export function mergeDetails(json, details) {
  const warnings = [];
  const items = new Map([...json.nodes, ...json.moonshots, ...json.starshots].map((x) => [x.id, x]));
  for (const x of items.values()) Object.assign(x, { brief: '', github: null, lead: null, team: [] });
  if (!details || typeof details !== 'object' || Array.isArray(details)) return ['details: file must contain an object keyed by ID'];
  for (const [id, d] of Object.entries(details)) {
    if (id.startsWith('$')) continue; // "$comment" and friends
    const item = items.get(id);
    if (!item) { warnings.push(`details: unknown ID ${id}`); continue; }
    if (!d || typeof d !== 'object' || Array.isArray(d)) { warnings.push(`details: ${id} must be an object`); continue; }
    for (const k of Object.keys(d)) if (!DETAIL_KEYS.includes(k)) warnings.push(`details: ${id} has unknown field "${k}"`);
    if (typeof d.brief === 'string') item.brief = d.brief.trim();
    if (d.github) {
      if (typeof d.github === 'string' && /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+/.test(d.github.trim())) item.github = d.github.trim();
      else warnings.push(`details: ${id} github must look like https://github.com/<owner>/<repo>`);
    }
    if (d.lead) item.lead = String(d.lead).trim() || null;
    if (d.team !== undefined && d.team !== null && !Array.isArray(d.team)) warnings.push(`details: ${id} team must be a list of names`);
    if (Array.isArray(d.team)) {
      if (d.team.some((t) => t !== null && t !== '' && typeof t !== 'string')) warnings.push(`details: ${id} team entries must be strings`);
      item.team = d.team.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim());
    }
  }
  return warnings;
}

const STATUS = { '🟢': 'available', '🔒': 'locked', '🟡': 'in-progress', '✅': 'done' };
export const EMOJI = { available: '🟢', locked: '🔒', 'in-progress': '🟡', done: '✅' };
const EXCLUDE_HEADINGS = [/government/i];

const BRANCH_BY_PREFIX = {
  R: 'Roots', T: 'Trunk', A: 'Air', L: 'Lighter-than-air & wind', G: 'Ground',
  S: 'Surface water', U: 'Underwater', X: 'Sensing', M: 'Manipulation',
  O: 'Operations', I: 'Infrastructure inspection', C: 'Commercial services', SP: 'Space',
};

const NUM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5 };
const ID_SRC = '[A-Z]{1,3}-[A-Z]*\\d+';
const ID_RE = new RegExp(`^${ID_SRC}$`);
const IDS_RE = new RegExp(`\\b${ID_SRC}\\b`, 'g');

const clean = (s) => s.replace(/\*\*/g, '').trim();
const idsIn = (s) => s.match(IDS_RE) ?? [];
const isId = (s) => ID_RE.test(s);
const isMs = (id) => id.startsWith('MS-');
const isSt = (id) => id.startsWith('ST-');
const num = (id) => Number(id.replace(/\D+/g, ''));

/** Split on a separator, ignoring separators inside parentheses. */
function splitTop(s, sep) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === sep && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  out.push(cur.trim());
  return out.filter(Boolean);
}

/** Parse a Requires cell into groups. Errors are pushed to `errors`. */
export function parseRequires(cell, where, errors) {
  const text = clean(cell);
  if (!text || text === '—' || text === '-') return { text: '', groups: [], ids: [], note: undefined };
  const groups = [];
  const notes = [];
  // Notes: "A-1 (heavy-lift)" -> note on A-1.
  const noteFor = new Map();
  const stripped = text.replace(new RegExp(`(${ID_SRC})\\s*\\(([^)]*)\\)`, 'g'), (_, id, note) => {
    noteFor.set(id, note.trim());
    notes.push(note.trim());
    return id;
  });
  for (const term of stripped.split(/\s*[,+]\s*/).filter(Boolean)) {
    const atLeast = term.match(/^(one|two|three|four|five|\d+) of (.+)$/i);
    if (atLeast) {
      const n = NUM_WORDS[atLeast[1].toLowerCase()] ?? Number(atLeast[1]);
      const list = atLeast[2].split(/\s*\/\s*/).map((s) => s.trim());
      if (!list.every(isId)) errors.push(`${where}: "${term}" must list IDs`);
      groups.push({ kind: 'atLeast', n, ids: list.filter(isId) });
      continue;
    }
    const alts = term.split(/\s+or\s+/i).map((s) => s.trim()).filter(Boolean);
    if (alts.length > 1) {
      const g = { kind: 'any', ids: alts.filter(isId), text: alts.filter((a) => !isId(a)) };
      const note = g.ids.map((i) => noteFor.get(i)).filter(Boolean).join('; ');
      groups.push(note ? { ...g, note } : g);
    } else if (isId(alts[0])) {
      const g = { kind: 'all', ids: [alts[0]] };
      groups.push(noteFor.has(alts[0]) ? { ...g, note: noteFor.get(alts[0]) } : g);
    } else {
      errors.push(`${where}: cannot parse Requires term "${term}"`);
    }
  }
  const ids = [...new Set(groups.flatMap((g) => g.ids))];
  return { text, groups, ids, note: notes.length ? notes.join('; ') : undefined };
}

/** Parse a moonshot / starshot key-node cell. */
export function parseNeeds(cell, where, errors) {
  const nodes = [];
  const moonshots = [];
  const texts = [];
  for (const term of splitTop(clean(cell), ',')) {
    let m;
    if ((m = term.match(new RegExp(`^(${ID_SRC}) to (${ID_SRC})$`)))) {
      const [a, b] = [m[1], m[2]];
      const pa = a.slice(0, a.lastIndexOf('-') + 1);
      const pb = b.slice(0, b.lastIndexOf('-') + 1);
      if (pa !== pb) { errors.push(`${where}: range "${term}" mixes prefixes`); continue; }
      for (let i = num(a); i <= num(b); i++) nodes.push(`${pa}${i}`);
    } else if ((m = term.match(/^((?:MS|ST)-\d+)(?: nodes)?$/))) {
      moonshots.push(m[1]);
    } else if (new RegExp(`^${ID_SRC}(?:\\s*/\\s*${ID_SRC})*$`).test(term)) {
      nodes.push(...term.split(/\s*\/\s*/));
    } else {
      texts.push(term);
    }
  }
  return { nodes: [...new Set(nodes)], moonshots: [...new Set(moonshots)], text: texts.join(', ') };
}

/** Parse the markdown into raw records. Pure. */
export function parseTechtree(md) {
  const lines = md.split('\n');
  const out = { nodes: [], moonshots: [], starshots: [], prefixes: [], criticalPath: [], errors: [] };
  let h2 = '';
  let h3 = '';
  let header = null;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].trim();
    if (line.startsWith('## ')) { h2 = line.slice(3); h3 = ''; header = null; continue; }
    if (line.startsWith('### ')) { h3 = line.slice(4); header = null; continue; }
    const section = `${h2} ${h3}`;

    if (/critical path/i.test(h2)) {
      const m = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*(?:\(([^)]*)\))?\s*:?\s*(.*)$/);
      if (m) out.criticalPath.push({ ids: idsIn(m[1]), label: (m[2] ?? '').trim(), text: m[3].trim() });
      continue;
    }
    if (!line.startsWith('|')) { header = null; continue; }

    const cells = line.slice(1, -1).split('|').map((c) => c.trim());
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    if (!header) { header = cells.map((c) => c.toLowerCase()); continue; }
    if (EXCLUDE_HEADINGS.some((r) => r.test(section))) continue;

    if (header[0] === 'prefix') {
      const prefix = cells[0].replace(/`/g, '');
      if (/^[A-Z]{1,3}-$/.test(prefix)) out.prefixes.push({ prefix, area: clean(cells[1]) });
      continue;
    }

    const id = cells[0];
    if (!ID_RE.test(id)) continue;
    const where = `line ${li + 1} (${id})`;

    if (header.includes('requires')) {
      const unlocksRaw = clean(cells[3]);
      const emoji = cells[5].trim();
      if (!(emoji in STATUS)) { out.errors.push(`${where}: unknown status "${emoji}"`); continue; }
      const req = parseRequires(cells[2], where, out.errors);
      const prefix = id.split('-')[0];
      out.nodes.push({
        id, line: li, cells,
        name: clean(cells[1]),
        requiresParsed: req,
        unlocksRaw,
        crossRef: unlocksRaw.startsWith('(see'),
        sciences: clean(cells[4]),
        statusSource: STATUS[emoji],
        branch: BRANCH_BY_PREFIX[prefix] ?? 'Other',
      });
    } else if (isMs(id) || isSt(id)) {
      const [title, ...rest] = cells[1].split(' — ');
      const item = { id, title: clean(title), summary: clean(rest.join(' — ')), needs: parseNeeds(cells[2], where, out.errors) };
      (isMs(id) ? out.moonshots : out.starshots).push(item);
    }
  }
  return out;
}

/** Derive unlocks, status, downstream views. Pure. */
export function deriveTree(parsed, overrides = new Map()) {
  const errors = [...parsed.errors];
  const warnings = [];

  // Duplicate IDs: a "(see Roots)" cross-reference row is skipped; anything else is an error.
  const seen = new Set();
  const nodes = [];
  for (const n of parsed.nodes) {
    if (n.crossRef) continue;
    if (seen.has(n.id)) { errors.push(`duplicate node ID ${n.id} (line ${n.line + 1})`); continue; }
    seen.add(n.id);
    nodes.push(n);
  }
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const shots = [...parsed.moonshots, ...parsed.starshots];
  const shotById = new Map(shots.map((s) => [s.id, s]));
  const known = (id) => byId.has(id) || shotById.has(id);

  for (const n of nodes) for (const id of n.requiresParsed.ids) if (!known(id)) errors.push(`${n.id}: unknown ID ${id} in Requires`);
  for (const s of shots) {
    for (const id of s.needs.nodes) if (!byId.has(id)) errors.push(`${s.id}: unknown node ${id} in key nodes`);
    for (const id of s.needs.moonshots) if (!shotById.has(id)) errors.push(`${s.id}: unknown moonshot ${id}`);
  }

  const order = new Map(nodes.map((n, i) => [n.id, i]));
  const bySource = (a, b) => order.get(a) - order.get(b);

  // Unlocks = inverse of Requires.
  const unlocks = new Map(nodes.map((n) => [n.id, []]));
  for (const n of nodes) for (const r of n.requiresParsed.ids) unlocks.get(r)?.push(n.id);
  for (const list of unlocks.values()) list.sort(bySource);

  // Direct moonshot / starshot links come from the key lists.
  const directMs = new Map(nodes.map((n) => [n.id, []]));
  const directSt = new Map(nodes.map((n) => [n.id, []]));
  for (const s of parsed.moonshots) for (const id of s.needs.nodes) directMs.get(id)?.push(s.id);
  for (const s of parsed.starshots) for (const id of s.needs.nodes) directSt.get(id)?.push(s.id);

  // Status: 🟡 and ✅ by hand; 🟢 / 🔒 computed. Free-text alternatives never count as satisfied.
  const done = new Set(nodes.filter((n) => (overrides.get(n.id) ?? n.statusSource) === 'done').map((n) => n.id));
  const satisfied = (g) =>
    g.kind === 'all' ? g.ids.every((i) => done.has(i))
    : g.kind === 'any' ? g.ids.some((i) => done.has(i))
    : g.ids.filter((i) => done.has(i)).length >= g.n;
  const status = new Map();
  for (const n of nodes) {
    const hand = overrides.get(n.id) ?? n.statusSource; // GitHub can only raise a status, never lower it
    if (hand === 'done' || hand === 'in-progress') status.set(n.id, hand);
    else status.set(n.id, n.requiresParsed.groups.every(satisfied) ? 'available' : 'locked');
  }

  // Ancestors (everything a node needs) and descendants (everything that needs it).
  const ancMemo = new Map();
  const ancestors = (id, trail = new Set()) => {
    if (ancMemo.has(id)) return ancMemo.get(id);
    if (trail.has(id)) { errors.push(`Requires cycle through ${id}`); return new Set(); }
    trail.add(id);
    const set = new Set();
    for (const r of byId.get(id).requiresParsed.ids) {
      if (!byId.has(r)) continue;
      set.add(r);
      for (const a of ancestors(r, trail)) set.add(a);
    }
    trail.delete(id);
    ancMemo.set(id, set);
    return set;
  };
  for (const n of nodes) ancestors(n.id);
  const descendants = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const n of nodes) for (const a of ancMemo.get(n.id)) descendants.get(a).add(n.id);

  // Full requirement set of a moonshot/starshot: key nodes, their ancestors, and dependent moonshots' sets.
  const closureMemo = new Map();
  const closure = (sid, trail = new Set()) => {
    if (closureMemo.has(sid)) return closureMemo.get(sid);
    if (trail.has(sid)) { errors.push(`Moonshot cycle through ${sid}`); return new Set(); }
    trail.add(sid);
    const s = shotById.get(sid);
    const set = new Set();
    for (const id of s.needs.nodes) {
      if (!byId.has(id)) continue;
      set.add(id);
      for (const a of ancMemo.get(id)) set.add(a);
    }
    for (const m of s.needs.moonshots) if (shotById.has(m)) for (const x of closure(m, trail)) set.add(x);
    trail.delete(sid);
    closureMemo.set(sid, set);
    return set;
  };
  for (const s of shots) closure(s.id);

  // Derived Unlocks cell text: node IDs, direct moonshots, direct starshots, then preserved non-ID text.
  const preserved = (raw) => (raw === '—' || raw.startsWith('(see') ? [] : splitTop(raw, ',').filter((t) => !isId(t)));
  const unlocksCell = (n) => {
    const parts = [...unlocks.get(n.id), ...directMs.get(n.id), ...directSt.get(n.id), ...preserved(n.unlocksRaw)];
    return parts.length ? parts.join(', ') : '—';
  };

  // Stale-source warnings.
  const stale = [];
  for (const n of nodes) {
    const want = unlocksCell(n);
    const have = n.unlocksRaw || '—';
    if (want !== have) stale.push(`${n.id} Unlocks: "${have}" -> "${want}"`);
    const wantEmoji = EMOJI[status.get(n.id)];
    const haveEmoji = n.cells[5].trim();
    // With GitHub overrides the doc is expected to differ, so only check statuses on offline builds.
    if (!overrides.size && wantEmoji !== haveEmoji) stale.push(`${n.id} Status: ${haveEmoji} -> ${wantEmoji}`);
  }
  if (stale.length) {
    warnings.push(`${stale.length} source cell(s) are out of date. Run npm run techtree:sync`);
    warnings.push(...stale.map((s) => `  ${s}`));
  }

  const outNodes = nodes.map((n) => {
    const id = n.id;
    const desc = descendants.get(id);
    const enables = preserved(n.unlocksRaw).join(', ');
    const msAll = shots.filter((s) => isMs(s.id) && closureMemo.get(s.id).has(id)).map((s) => s.id);
    const node = {
      id,
      name: n.name,
      branch: n.branch,
      sciences: n.sciences,
      status: status.get(id),
      requires: n.requiresParsed.ids,
      requiresText: n.requiresParsed.text,
      requiresGroups: n.requiresParsed.groups,
    };
    if (n.requiresParsed.note) node.note = n.requiresParsed.note;
    node.unlocks = unlocks.get(id);
    node.unlocksText = unlocksCell(n);
    node.enables = enables;
    node.moonshots = directMs.get(id);
    node.starshots = directSt.get(id);
    node.neededBy = { direct: unlocks.get(id).length, total: desc.size, moonshots: msAll };
    return node;
  });

  const statusOf = (id) => status.get(id);
  const outShot = (s) => {
    const cl = closureMemo.get(s.id);
    const progress = { total: s.needs.nodes.length, done: 0, inProgress: 0, available: 0, locked: 0 };
    for (const id of s.needs.nodes) {
      const st = statusOf(id);
      if (st === 'done') progress.done++;
      else if (st === 'in-progress') progress.inProgress++;
      else if (st === 'available') progress.available++;
      else progress.locked++;
    }
    return {
      id: s.id,
      title: s.title,
      summary: s.summary,
      builds: [...s.needs.nodes, ...s.needs.moonshots],
      needs: s.needs,
      progress,
      startWith: [...cl].filter((id) => statusOf(id) === 'available').sort(bySource),
    };
  };

  const branches = [...new Set(nodes.map((n) => n.branch))];
  const json = {
    branches,
    nodes: outNodes,
    moonshots: parsed.moonshots.map(outShot),
    starshots: parsed.starshots.map(outShot),
    prefixes: parsed.prefixes,
    criticalPath: parsed.criticalPath,
  };

  // Details for the sync script.
  const rows = nodes.map((n) => ({
    id: n.id, line: n.line, cells: n.cells,
    oldUnlocks: n.unlocksRaw || '—', newUnlocks: unlocksCell(n),
    oldEmoji: n.cells[5].trim(), newEmoji: EMOJI[status.get(n.id)],
    oldIds: idsIn(n.unlocksRaw), newIds: [...unlocks.get(n.id), ...directMs.get(n.id), ...directSt.get(n.id)],
  }));
  return { json, errors, warnings, rows };
}

// ---- Live status from GitHub ----------------------------------------------------------------------
const GH_REPO = 'joinoasa/techtree';
const RANK = { locked: 0, available: 0, 'in-progress': 1, done: 2 };

/**
 * Read the node issues (open and closed) from GitHub.
 * Returns Map(nodeId -> { labels: string[], assignees: string[] }). Throws on any failure.
 */
export async function fetchGithubNodes({ fetchFn = fetch, repo = GH_REPO, token = process.env.GITHUB_TOKEN, timeoutMs = 10_000 } = {}) {
  const map = new Map();
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'joinoasa-website-build' };
  if (token) headers.authorization = `Bearer ${token}`;
  for (let page = 1; page <= 20; page++) { // 20 pages x 100 = 2000 issues, far above the ~140 nodes
    const res = await fetchFn(`https://api.github.com/repos/${repo}/issues?state=all&per_page=100&page=${page}`, {
      headers, signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const items = await res.json();
    if (!Array.isArray(items)) throw new Error('unexpected GitHub response');
    for (const i of items) {
      if (i.pull_request) continue; // the issues API also lists pull requests
      const m = (i.body ?? '').match(/<!-- oasa-node:([A-Z0-9-]+) -->/);
      if (!m) continue;
      map.set(m[1], {
        labels: (i.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name)),
        assignees: (i.assignees ?? []).map((a) => a.login),
      });
    }
    if (items.length < 100) break;
  }
  return map;
}

/**
 * Effective status = the stronger of the doc and the issue (status:in-progress / status:done;
 * an assignee on an unfinished node also counts as in progress, as in sync-issues). Pure.
 * Returns Map(nodeId -> 'in-progress' | 'done') for nodes GitHub raises.
 */
export function githubStatusOverrides(nodes, gh) {
  const out = new Map();
  for (const n of nodes) {
    const g = gh.get(n.id);
    if (!g) continue;
    let st = n.statusSource;
    if (g.labels.includes('status:done')) st = 'done';
    else if (RANK[st] < 1 && (g.labels.includes('status:in-progress') || g.assignees.length)) st = 'in-progress';
    if (RANK[st] > RANK[n.statusSource]) out.set(n.id, st);
  }
  return out;
}

/** Team = details team plus issue assignees; lead = details lead, else the first assignee. Pure. Run after mergeDetails. */
export function applyGithubPeople(json, gh) {
  for (const n of json.nodes) {
    const a = gh.get(n.id)?.assignees ?? [];
    if (!a.length) continue;
    const have = new Set(n.team.map((t) => t.toLowerCase()));
    n.team = [...n.team, ...a.filter((x) => !have.has(x.toLowerCase()))];
    n.lead ??= a[0];
  }
}

// ---------- Ideas (joinoasa/ideas) ----------
const IDEAS_REPO = 'joinoasa/ideas';
const IDEAS_OUT = new URL('ideas.json', OUT_DIR);
const OUTCOMES = ['on-tree', 'expands-node', 'new-node', 'connects-nodes', 'operations', 'parked'];

/** One idea from an ideas-repo issue, or null for pull requests. Pure. */
export function parseIdea(i) {
  if (i.pull_request) return null;
  const labels = (i.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name));
  const outcome = OUTCOMES.find((o) => labels.includes(`outcome:${o}`)) ?? null;
  let nodes = [];
  const m = (i.body ?? '').match(/<!-- oasa-triage (\{.*?\}) -->/s);
  if (m) {
    try {
      const t = JSON.parse(m[1]);
      if (Array.isArray(t.nodes)) nodes = t.nodes.filter((n) => typeof n === 'string' && /^[A-Z]+-[A-Z]*\d+$/.test(n));
    } catch { /* ignore a malformed block */ }
  }
  return {
    n: i.number,
    id: `IDEA-${String(i.number).padStart(4, '0')}`,
    title: String(i.title ?? '').replace(/^\s*IDEA-\d+\s*[:·-]\s*/i, '').trim(),
    url: i.html_url,
    open: i.state === 'open',
    outcome,
    nodes,
    // Imported ideas keep the date they were first noted; others use the day they were posted.
    date: (i.body ?? '').match(/First noted (\d{4}-\d{2}-\d{2})/)?.[1] ?? String(i.created_at ?? '').slice(0, 10),
  };
}

/** Read every idea (open and closed) from GitHub. Throws on any failure. */
export async function fetchIdeas({ fetchFn = fetch, repo = IDEAS_REPO, token = process.env.GITHUB_TOKEN, timeoutMs = 10_000 } = {}) {
  const out = [];
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'joinoasa-website-build' };
  if (token) headers.authorization = `Bearer ${token}`;
  for (let page = 1; page <= 50; page++) {
    const res = await fetchFn(`https://api.github.com/repos/${repo}/issues?state=all&per_page=100&page=${page}&sort=created&direction=asc`, {
      headers, signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const items = await res.json();
    if (!Array.isArray(items)) throw new Error('unexpected GitHub response');
    for (const i of items) { const x = parseIdea(i); if (x) out.push(x); }
    if (items.length < 100) break;
  }
  return out.sort((a, b) => a.n - b.n);
}

/** Each node and moonshot lists the ideas sorted onto it. Pure. Run after mergeDetails. */
export function applyIdeas(json, ideas) {
  const by = new Map();
  for (const x of ideas) for (const n of x.nodes) {
    if (!by.has(n)) by.set(n, []);
    by.get(n).push({ id: x.id, title: x.title, url: x.url });
  }
  for (const item of [...json.nodes, ...json.moonshots, ...json.starshots]) item.ideas = by.get(item.id) ?? [];
}

async function loadIdeas() {
  if (process.env.GITHUB_ACTIONS !== 'true' && process.env.TECHTREE_GITHUB !== '1') return { ideas: [], fetched: false, warning: null };
  try {
    return { ideas: await fetchIdeas(), fetched: true, warning: null };
  } catch (e) {
    return { ideas: [], fetched: false, warning: `could not read ideas from GitHub (${e.message})` };
  }
}

// ---------- Tasks (agent task cards in the code repos) ----------
export const TASK_REPOS = ['joinoasa/oasa-sec', 'joinoasa/oasa-radio', 'joinoasa/oasa-lab', 'joinoasa/website', 'joinoasa/techtree'];
const TASKS_OUT = new URL('tasks.json', OUT_DIR);
const TASK_SECTIONS = {
  Node: 'node', Goal: 'goal', 'Done when': 'doneWhen', 'Start here': 'startHere',
  Evidence: 'evidence', 'Out of scope': 'outOfScope', Size: 'size', Needs: 'needs',
};

/** Split a GitHub issue-form body (`### Heading` then a value) into { heading: value }. "_No response_" is empty. Pure. */
export function parseIssueForm(body) {
  const out = {};
  const parts = String(body ?? '').replace(/\r\n?/g, '\n').split(/^### +(.+?)[ \t]*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const v = parts[i + 1].trim();
    out[parts[i].trim()] = v === '_No response_' ? '' : v;
  }
  return out;
}

/** One task card from a code-repo issue, or null for pull requests. Pure. */
export function parseTask(i, repo) {
  if (i.pull_request) return null;
  const labels = (i.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name)).filter(Boolean);
  const f = parseIssueForm(i.body);
  const t = { repo, number: i.number, title: String(i.title ?? '').trim(), url: i.html_url, node: null, labels };
  const fromSection = (f.Node ?? '').split(/[\s,;]+/).map((x) => x.replace(/[^A-Za-z0-9-]/g, '')).find((x) => ID_RE.test(x));
  const fromLabel = labels.map((l) => l.match(/^node:(.+)$/)?.[1]?.trim()).find((x) => x && ID_RE.test(x));
  t.node = fromSection ?? fromLabel ?? null;
  t.agentReady = labels.includes('agent-ready');
  t.needsHardware = labels.includes('needs-hardware');
  t.securityReview = labels.includes('security-review');
  t.size = f.Size ?? '';
  t.assignees = (i.assignees ?? []).map((a) => a.login);
  for (const [h, k] of Object.entries(TASK_SECTIONS)) if (!(k in t)) t[k] = f[h] ?? '';
  t.updated = i.updated_at ?? null;
  return t;
}

/** Open issues labeled `task` in one repo. Throws on any failure. */
export async function fetchTasks({ fetchFn = fetch, repos = TASK_REPOS, token = process.env.GITHUB_TOKEN, timeoutMs = 10_000 } = {}) {
  const out = [];
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'joinoasa-website-build' };
  if (token) headers.authorization = `Bearer ${token}`;
  for (const repo of repos) {
    for (let page = 1; page <= 10; page++) {
      const res = await fetchFn(`https://api.github.com/repos/${repo}/issues?state=open&labels=task&per_page=100&page=${page}`, {
        headers, signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`GitHub answered ${res.status} for ${repo}`);
      const items = await res.json();
      if (!Array.isArray(items)) throw new Error('unexpected GitHub response');
      for (const i of items) { const x = parseTask(i, repo); if (x) out.push(x); }
      if (items.length < 100) break;
    }
  }
  return out.sort((a, b) => a.repo.localeCompare(b.repo) || a.number - b.number);
}

async function loadTasks() {
  if (process.env.GITHUB_ACTIONS !== 'true' && process.env.TECHTREE_GITHUB !== '1') return { tasks: [], fetched: false, warning: null };
  try {
    return { tasks: await fetchTasks(), fetched: true, warning: null };
  } catch (e) {
    return { tasks: [], fetched: false, warning: `could not read tasks from GitHub (${e.message})` };
  }
}

async function loadGithub() {
  if (process.env.GITHUB_ACTIONS !== 'true' && process.env.TECHTREE_GITHUB !== '1') return { gh: new Map(), warning: null };
  try {
    return { gh: await fetchGithubNodes(), warning: null };
  } catch (e) {
    return { gh: new Map(), warning: `could not read GitHub issues, using the doc only (${e.message})` };
  }
}

async function main() {
  const md = readFileSync(SRC, 'utf8');
  const parsed = parseTechtree(md);
  const { gh, warning: ghWarning } = await loadGithub();
  const overrides = githubStatusOverrides(parsed.nodes.filter((n) => !n.crossRef), gh);
  const { json, errors, warnings } = deriveTree(parsed, overrides);
  if (ghWarning) warnings.push(ghWarning);
  if (errors.length) {
    console.error(`techtree: ${errors.length} error(s)`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  if (existsSync(DETAILS)) warnings.push(...mergeDetails(json, JSON.parse(readFileSync(DETAILS, 'utf8'))));
  else {
    mergeDetails(json, {});
    warnings.push(`source/techtree-details.json is missing: every brief, lead and team is blank`);
  }
  applyGithubPeople(json, gh);
  const { ideas, fetched, warning: ideasWarning } = await loadIdeas();
  if (ideasWarning) warnings.push(ideasWarning);
  const { tasks, fetched: tasksFetched, warning: tasksWarning } = await loadTasks();
  if (tasksWarning) warnings.push(tasksWarning);
  // Only public tree IDs: an idea pointing at a hidden (government) node isn't linked from the site.
  const known = new Set([...json.nodes, ...json.moonshots, ...json.starshots].map((x) => x.id));
  const publicIdeas = ideas.map((x) => ({ ...x, nodes: x.nodes.filter((n) => known.has(n)) }));
  applyIdeas(json, publicIdeas);
  if (warnings.length) for (const w of warnings) console.error(`techtree warning: ${w}`);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, JSON.stringify(json, null, 2) + '\n');
  writeFileSync(IDEAS_OUT, JSON.stringify({ fetched, repo: IDEAS_REPO, ideas: publicIdeas }, null, 2) + '\n');
  writeFileSync(TASKS_OUT, JSON.stringify({ fetched: tasksFetched, tasks }, null, 2) + '\n');
  const available = json.nodes.filter((n) => n.status === 'available').length;
  console.log(`techtree: ${json.nodes.length} nodes, ${json.moonshots.length} moonshots, ${json.starshots.length} starshots, ${available} available, ${fetched ? `${ideas.length} ideas, ` : ''}${tasksFetched ? `${tasks.length} tasks, ` : ''}${warnings.length ? warnings.length + ' warning line(s)' : '0 warnings'}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
