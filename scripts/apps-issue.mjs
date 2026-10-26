// Opens the applicant issue in joinoasa/admin for an application that doesn't have one yet
// (applications from before the automation, or if the Worker couldn't reach GitHub).
// Usage: npm run apps:issue -- <id>  [--local] [--dry]
// Needs the GitHub CLI logged in (gh auth login). Sends the number, first name and handles only.
import { d1, sqlInt, parseArgs, appId, fail } from './apps-lib.mjs';
import { applicantIssue } from '../worker/admin.js';
import { findIssue, createIssue, syncIssue } from './apps-github.mjs';

const usage = 'Usage: npm run apps:issue -- <id> [--local] [--dry]';
const { args, local, dry } = parseArgs(process.argv.slice(2));
const id = appId(args[0], usage);

const [rows] = d1(`SELECT id, name, age_group, github_username, discord_handle, status FROM applications WHERE id = ${sqlInt(id)}`, { local });
const app = rows?.[0];
if (!app) fail(`No application #${id}.`);

let existing;
try {
  existing = findIssue(id);
} catch {
  fail('The GitHub CLI is missing or not logged in. Install gh and run: gh auth login');
}
if (existing) {
  console.log(`#${id} already has ${existing.title} (issue ${existing.number}). Syncing its stage.`);
  syncIssue(id, app.status, { dry });
  process.exit(0);
}

const url = createIssue(applicantIssue(id, app), { dry });
if (url) console.log(`Opened ${url}`);
if (app.status !== 'new') syncIssue(id, app.status, { dry });
