// Shared helpers for the apps:* scripts. These handle personal data, so:
//  - SQL values are always escaped here (sqlText) or checked to be plain numbers (sqlInt);
//  - wrangler is started without a shell, so nothing typed on the command line is interpreted.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const STATUSES = ['new', 'reviewing', 'interview', 'trial', 'accepted', 'declined', 'withdrawn'];
export const TRIAL_DAYS = 30;
export const RETENTION_MONTHS = 12;   // declined/withdrawn applications are deleted after this (privacy page)
export const WAIT_DAYS = 7;           // apps:due flags applications waiting longer than this

/** A string as an SQL literal: quotes doubled, control characters (including NUL) removed. */
export function sqlText(value) {
  const s = String(value).normalize('NFC').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, ' ');
  return `'${s.replaceAll("'", "''")}'`;
}

/** An integer as SQL. Anything that is not a whole number is refused. */
export function sqlInt(value) {
  if (!/^\d{1,9}$/.test(String(value))) throw new Error(`Not a whole number: ${value}`);
  return String(Number(value));
}

export const nowIso = () => new Date().toISOString();
export const today = () => new Date().toISOString().slice(0, 10);

export function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Parses the shared flags: --local, --dry (print the SQL, run nothing). Returns the rest as `args`. */
export function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => /^--[a-z]+$/.test(a)));
  const args = argv.filter((a) => !/^--[a-z]+$/.test(a));
  return { args, local: flags.has('--local'), dry: flags.has('--dry'), apply: flags.has('--apply') };
}

/** Runs SQL on D1 through wrangler (no shell). Returns the result sets, one per statement. */
export function d1(sql, { local = false, dry = false } = {}) {
  if (dry) {
    console.log(sql);
    return [];
  }
  const require = createRequire(import.meta.url);
  // The package does not export its bin file, so find it from package.json.
  const pkgPath = require.resolve('wrangler/package.json');
  const bin = JSON.parse(readFileSync(pkgPath, 'utf8')).bin;
  const wrangler = join(dirname(pkgPath), typeof bin === 'string' ? bin : bin.wrangler);
  try {
    const out = execFileSync(process.execPath, [wrangler, 'd1', 'execute', 'DB', local ? '--local' : '--remote', '--json', '--command', sql], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
      maxBuffer: 20 * 1024 * 1024,
    });
    return JSON.parse(out).map((r) => r.results ?? []);
  } catch {
    console.error('The database command failed. Are you logged in (npx wrangler login)? See the message above.');
    process.exit(1);
  }
}

export function fail(message) {
  console.error(message);
  process.exit(1);
}

/** Application number from the command line. */
export function appId(value, usage) {
  if (!/^\d{1,9}$/.test(String(value ?? '')) || Number(value) < 1) fail(usage);
  return Number(value);
}
