// Public tech tree data for people and AI tools: /data/techtree.json
// Same data the site uses (government sections are already excluded by the build).
import type { APIRoute } from 'astro';
import tree from '../../data/techtree.json';

export const GET: APIRoute = () => {
  const body = {
    about: 'OASA tech tree. Requires is the source of truth; Unlocks is derived. Estimates are rough ranges (https://joinoasa.org/docs/estimates/). Guide: https://joinoasa.org/docs/brainstorm/',
    prefixes: tree.prefixes,
    nodes: tree.nodes.map((n) => ({
      id: n.id, name: n.name, branch: n.branch, status: n.status,
      requires: n.requiresText || '', unlocks: n.unlocks, sciences: n.sciences,
      brief: n.brief, moonshots: n.moonshots, ideas: (n.ideas ?? []).map((x) => x.id), github: n.github, estimate: n.estimate,
    })),
    moonshots: tree.moonshots.map((m) => ({ id: m.id, title: m.title, summary: m.summary, needs: m.builds, brief: m.brief, estimate: m.estimate })),
    starshots: tree.starshots.map((m) => ({ id: m.id, title: m.title, summary: m.summary, buildsOn: m.builds })),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
