// Plain-text formatting for tech tree estimates (see source/techtree-estimates.json and /docs/estimates/).

export type NodeEstimate = {
  hours: number[]; parts_usd: number[]; lab_hours: number[]; field_days: number[];
  resources: string[]; skills: string[]; basis?: string;
};
export type ShotEstimate = Omit<NodeEstimate, 'resources' | 'basis'> & {
  nodes: number; missing: number; done: number; resources: { name: string; nodes: number }[];
};

const num = (n: number) => (n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(Math.round(n)));
const money = (n: number) => `$${num(n)}`;
const span = (r: number[], f: (n: number) => string = num) => (r[0] === r[r.length - 1] ? f(r[0]) : `${f(r[0])}–${f(r[r.length - 1])}`);

/** "120–400 h (likely 200) · parts $300–900 · lab 20–40 h · field 2–4 days" */
export function formatEstimate(e: Pick<NodeEstimate, 'hours' | 'parts_usd' | 'lab_hours' | 'field_days'>): string {
  const parts = [`${span(e.hours)} h${e.hours.length === 3 && e.hours[1] !== e.hours[0] ? ` (likely ${num(e.hours[1])})` : ''}`];
  parts.push(e.parts_usd[1] > 0 ? `parts ${span(e.parts_usd, money)}` : 'no parts cost');
  if (e.lab_hours[1] > 0) parts.push(`lab ${span(e.lab_hours)} h`);
  if (e.field_days[1] > 0) parts.push(`field ${span(e.field_days)} ${e.field_days[1] === 1 ? 'day' : 'days'}`);
  return parts.join(' · ');
}

/** Moonshot roll-up: the estimate plus how many nodes it covers. */
export function formatShotEstimate(e: ShotEstimate | null | undefined): string {
  if (!e) return '';
  const counted = `${e.nodes} ${e.nodes === 1 ? 'node' : 'nodes'} to go${e.missing ? `, ${e.missing} not estimated yet` : ''}`;
  return `${formatEstimate(e)} (${counted})`;
}

/** "Spectrum analyzer, Test range" (moonshots: most-needed first, top n). */
export function formatResources(e: NodeEstimate | ShotEstimate | null | undefined, n = 6): string {
  if (!e?.resources.length) return '';
  const names = e.resources.map((r) => (typeof r === 'string' ? r : r.name));
  return names.slice(0, n).join(', ') + (names.length > n ? `, and ${names.length - n} more` : '');
}
