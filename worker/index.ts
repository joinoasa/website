// Cloudflare Worker for joinoasa.org.
// Only /api/* reaches this code (see run_worker_first in wrangler.jsonc); every other
// request is served straight from the built site in ./dist.
//
// POST /api/apply  stores a membership application in D1, posts a short alert to Discord and
//                  opens an "Applicant" issue in the private joinoasa/admin repo.
// Cron (Mondays)   posts the weekly applications digest to Discord #staff (worker/admin.js).
//
// Bindings and secrets (README → "Applications"):
//   DB                    D1 database (wrangler.jsonc)
//   ASSETS                the built site (wrangler.jsonc)
//   DISCORD_WEBHOOK_URL   secret, optional: private Discord channel webhook for alerts
//   TURNSTILE_SECRET      secret, optional: Cloudflare Turnstile secret key (spam check)
//   ADMIN_ISSUES_TOKEN    secret, optional: fine-grained GitHub token, Issues read/write on joinoasa/admin only
//   STAFF_WEBHOOK_URL     secret, optional: Discord #staff webhook for the weekly digest

import { fields, youthOpen, YOUTH, type Field } from '../src/data/application';
import { ADMIN_REPO, applicantIssue, openApplicantIssue, sendDigest } from './admin.js';

interface D1Result { meta: { last_row_id: number } }
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}
interface Env {
  DB?: { prepare(sql: string): D1Statement };
  ASSETS: { fetch(request: Request): Promise<Response> };
  DISCORD_WEBHOOK_URL?: string;
  TURNSTILE_SECRET?: string;
  ADMIN_ISSUES_TOKEN?: string;
  STAFF_WEBHOOK_URL?: string;
}
interface Ctx { waitUntil(p: Promise<unknown>): void }

const THANKS = '/join/thanks/';
const NOT_SENT = '/join/not-sent/';
const MAX_BODY = 64 * 1024;
const EMAIL_RE = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[^\s@<>()[\],;:"]{2,}$/;

type Values = Record<string, string>;
type Errors = Record<string, string>;

export { validate, clean };

export default {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/apply' || url.pathname === '/api/apply/') {
      if (request.method !== 'POST') return json({ ok: false, message: 'Use POST.' }, 405, { Allow: 'POST' });
      try {
        return await apply(request, env, ctx);
      } catch (err) {
        console.error('apply failed', err);
        return reply(request, 500, { ok: false, reason: 'server', message: 'Something went wrong on our side. Please try again in a few minutes.' });
      }
    }
    if (url.pathname.startsWith('/api/')) return json({ ok: false, message: 'Not found.' }, 404);
    return env.ASSETS.fetch(request);
  },

  // Weekly digest (cron in wrangler.jsonc). Does nothing until STAFF_WEBHOOK_URL is set.
  async scheduled(_event: unknown, env: Env, ctx: Ctx): Promise<void> {
    if (env.DB && env.STAFF_WEBHOOK_URL) ctx.waitUntil(sendDigest(env.DB, env.STAFF_WEBHOOK_URL));
  },
};

async function apply(request: Request, env: Env, ctx: Ctx): Promise<Response> {
  // Same-site posts only (browsers send Origin on POST).
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return reply(request, 403, { ok: false, reason: 'origin', message: 'This form only accepts submissions from joinoasa.org.' });
  }
  const length = Number(request.headers.get('Content-Length') ?? 0);
  if (length > MAX_BODY) return reply(request, 413, { ok: false, reason: 'size', message: 'Your answers are too long. Please shorten them.' });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(request, 400, { ok: false, reason: 'format', message: 'We could not read the form. Please try again.' });
  }

  // Honeypot: people never see this field, so anything in it is a bot. Pretend it worked.
  if (str(form.get('website'))) return reply(request, 200, { ok: true, redirect: THANKS });

  if (!env.DB) {
    return reply(request, 503, { ok: false, reason: 'not_ready', message: 'Applications are not open yet. Please email us instead.' });
  }

  if (env.TURNSTILE_SECRET) {
    const passed = await turnstile(env.TURNSTILE_SECRET, str(form.get('cf-turnstile-response')), request.headers.get('CF-Connecting-IP'));
    if (!passed) return reply(request, 400, { ok: false, reason: 'captcha', message: 'The spam check did not pass. Please try again.' });
  }

  const { values, errors } = validate(form);
  if (Object.keys(errors).length) {
    return reply(request, 400, { ok: false, reason: 'invalid', message: 'Please fix the highlighted answers.', errors });
  }

  // Same email within a day: treat as a double submit; don't store or alert twice.
  const recent = await env.DB.prepare(
    "SELECT id FROM applications WHERE email = ?1 AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day') LIMIT 1",
  ).bind(values.email).first<{ id: number }>();
  if (recent) return reply(request, 200, { ok: true, redirect: THANKS });

  const youth = youthOpen && values.age_group === YOUTH;
  const columns = fields.map((f) => f.name);
  const params = fields.map((f) => (f.kind === 'checkbox' ? (values[f.name] ? 1 : 0) : values[f.name] || null));
  columns.push('guardian_consent');
  params.push(youth ? 'pending' : 'not_needed');

  const sql = `INSERT INTO applications (${columns.join(', ')}) VALUES (${columns.map((_, i) => `?${i + 1}`).join(', ')})`;
  const result = await env.DB.prepare(sql).bind(...params).run();
  const id = result.meta.last_row_id;

  if (env.DISCORD_WEBHOOK_URL) ctx.waitUntil(notify(env.DISCORD_WEBHOOK_URL, id, values));
  if (env.ADMIN_ISSUES_TOKEN) ctx.waitUntil(openApplicantIssue(env.ADMIN_ISSUES_TOKEN, ADMIN_REPO, () => applicantIssue(id, values)));

  return reply(request, 200, { ok: true, redirect: THANKS });
}

function validate(form: FormData): { values: Values; errors: Errors } {
  const values: Values = {};
  const errors: Errors = {};
  for (const f of fields) values[f.name] = clean(str(form.get(f.name)), f);

  for (const f of fields) {
    if (!active(f, values)) { values[f.name] = ''; continue; }
    const v = values[f.name];
    if (!v) {
      if (f.required) errors[f.name] = f.kind === 'checkbox' ? 'Please tick this box.' : f.kind === 'radio' ? 'Please choose one.' : 'Please fill this in.';
      continue;
    }
    if (v.length > f.max) errors[f.name] = `Please keep this under ${f.max} characters.`;
    else if (f.kind === 'email' && !EMAIL_RE.test(v)) errors[f.name] = 'Please enter a valid email address.';
    else if (f.kind === 'radio' && !f.options?.some((o) => o.value === v)) errors[f.name] = 'Please choose one.';
    else if (f.pattern && !new RegExp(`^(?:${f.pattern.source})$`).test(v)) errors[f.name] = f.pattern.message;
  }

  // Belt and braces: the age options already exclude 15-17 while youth membership is paused.
  if (!youthOpen && values.age_group === YOUTH) {
    errors.age_group = 'Membership for ages 15 to 17 is not open yet. It is planned and will open later.';
  }

  if (values.guardian_email && values.guardian_email.toLowerCase() === values.email.toLowerCase()) {
    errors.guardian_email = "Please use your parent or guardian's own email address.";
  }
  return { values, errors };
}

/** Whether a field applies, given the other answers. */
function active(f: Field, values: Values): boolean {
  if (f.showWhen && values[f.showWhen.field] !== f.showWhen.value) return false;
  if (f.hideWhen && values[f.hideWhen.field] === f.hideWhen.value) return false;
  return true;
}

function clean(raw: string, f: Field): string {
  if (f.kind === 'checkbox') return raw ? 'yes' : '';
  let v = raw.replace(/\r\n?/g, '\n').normalize('NFC');
  // Drop control characters except newlines and tabs in long answers.
  v = v.replace(f.kind === 'textarea' ? /[\u0000-\u0008\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '');
  v = v.trim();
  if (f.stripAt) v = v.replace(/^@/, '');
  if (f.kind === 'email' || f.name === 'discord_handle') v = v.toLowerCase();
  return v;
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v : '';
}

async function turnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

/** Short alert for the private Discord channel. No email addresses, and no Discord or GitHub usernames; youth applicants stay anonymous. */
async function notify(webhook: string, id: number, v: Values): Promise<void> {
  const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  const youth = v.age_group === YOUTH;
  const lines = youth
    ? [
        `**New application #${id}** · applicant aged 15 to 17`,
        'Parent or guardian consent needed before the trial.',
      ]
    : [
        `**New application #${id}** · ${cut(v.name, 80)} · ${cut(v.city_state, 80)}`,
        `Skills: ${cut(v.skills.replace(/\s+/g, ' '), 300)}`,
        v.contract_interest ? 'Interested in contract work.' : '',
      ];
  if (v.invited_by) lines.push(`Invited by: ${cut(v.invited_by, 80)}`);
  lines.push(`Read it: \`npm run apps:show -- ${id}\``);

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: lines.filter(Boolean).join('\n').slice(0, 1900), allowed_mentions: { parse: [] } }),
    });
    if (!res.ok) console.error('discord webhook', res.status);
  } catch (err) {
    console.error('discord webhook failed', err);
  }
}

interface Outcome { ok: boolean; redirect?: string; reason?: string; message?: string; errors?: Errors }

/** JSON for the page's script; a redirect for browsers without JavaScript. */
function reply(request: Request, status: number, body: Outcome): Response {
  if ((request.headers.get('Accept') ?? '').includes('application/json')) return json(body, status);
  const to = body.ok ? THANKS : `${NOT_SENT}?reason=${encodeURIComponent(body.reason ?? 'server')}`;
  return new Response(null, { status: 303, headers: { Location: to, 'Cache-Control': 'no-store' } });
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });
}
