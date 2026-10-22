// Public idea list for people and AI tools: /data/ideas.json (from joinoasa/ideas, refreshed on each deploy).
import type { APIRoute } from 'astro';
import data from '../../data/ideas.json';

export const GET: APIRoute = () => {
  const body = {
    about: 'OASA ideas. Each idea has a number (IDEA-0042) and one outcome. Post new ones at https://github.com/joinoasa/ideas',
    complete: data.fetched,
    ideas: data.ideas.map(({ id, title, url, open, outcome, nodes, date }) => ({ id, title, url, open, outcome, nodes, date })),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
