// Public task list for people and AI tools: /data/tasks.json (open `task` issues from the code repos, refreshed on each deploy).
import type { APIRoute } from 'astro';
import data from '../../data/tasks.json';

export const GET: APIRoute = () => {
  const body = {
    about: 'OASA task cards: open issues labeled "task" in the code repos. Read https://joinoasa.org/docs/agents/ first. "agentReady" tasks are scoped for an AI coding agent.',
    complete: data.fetched,
    fetched: data.fetched,
    tasks: data.tasks,
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
