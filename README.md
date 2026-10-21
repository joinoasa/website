# joinoasa.org

Website for the Open Autonomous Systems Alliance. Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build) (docs). Static files hosted on Cloudflare (Workers static assets, free plan).

## Run locally

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
```

## How it's organized

| Path | What it is |
|---|---|
| `src/config/site.ts` | Every owner-supplied value: domain, mailboxes, links, org facts, nav. Read this first |
| `src/pages/` | Site pages: home, tech tree, moonshots, join, chapters, about, contact, partners, privacy, security, 404 |
| `src/pages/robots.txt.ts`, `src/pages/.well-known/security.txt.ts` | Generated from the config |
| `src/content/docs/docs/` | Docs pages (Markdown). Edit these to update /docs |
| `src/components/docs/` | Starlight overrides (header links, footer, head tags) |
| `src/components/descent/` | Home page hero (the Descent: space to seabed) |
| `src/layouts/Base.astro` | Page shell: meta, canonical, social tags, JSON-LD, fonts |
| `src/styles/global.css` | Colors, type, shared utilities (`.cta-strip`, `.prose`, `.note`) and print rules |
| `source/OASA-techtree.md` | Tech tree source of truth |
| `scripts/build-techtree.mjs` | Turns the tech tree doc into `src/data/techtree.json` |
| `scripts/sync-techtree.mjs` | Rewrites the derived Unlocks and availability cells in the tech tree doc |
| `scripts/check-launch.mjs` | Lists every value in the config still marked `TODO(owner)` |
| `scripts/brand/` | Share image and icon sources, and the script that renders them into `public/` |
| `.github/workflows/deploy.yml` | Builds and deploys on every merge and nightly |
| `worker/index.ts` | The only server code: `POST /api/apply` (application form) |
| `src/data/application.ts` | Application questions; drives the form, the server check and the privacy page |
| `migrations/` | Application database tables (Cloudflare D1) |

## Owner settings

All placeholders live in `src/config/site.ts`. Each one is marked `TODO(owner)`; `null` hides the link or sentence that uses it. Never put a guessed value there.

```bash
npm run check:launch             # lists every open value (and warns when security.txt is near expiry)
npm run check:launch -- --strict # same, but exits 1 while anything is open
```

Set these before launch: the production domain (`site.url`), the four mailboxes (and make sure they are live), the Turnstile site key (`apply.turnstileSiteKey`, see Applications below), and the GitHub org (`links.github`, `links.websiteRepo`). Renew `security.securityTxtExpires` at least once a year; the deploy log warns when it is within 60 days.

## Updating the tech tree

Edit `source/OASA-techtree.md`, then keep `/home/claude/OASA-techtree.md` (the master copy) byte-identical to it.

**Requires is the single source of truth.** Grammar of a Requires cell:

- Commas (and `+`) separate terms; every term is required.
- `A or B` inside a term: any one of them (alternatives may be free text, for example "air-data sensors").
- `two of X/Y/Z` (a number word or digit): at least N of the listed IDs.
- A parenthetical after an ID is a note: `A-1 (heavy-lift)`.

**Unlocks is derived** from Requires (plus the moonshots whose key-node list names the node). Moonshot key-node lists are the source of truth for node-to-moonshot links. Status ✅ done and 🟡 in progress are set by hand; 🟢 available and 🔒 locked are computed.

```bash
npm run techtree:sync   # rewrites Unlocks and 🟢/🔒 cells in source/OASA-techtree.md, then copy it to the master
npm run techtree        # parses the doc into src/data/techtree.json (the build runs this)
```

The build never writes the source. It warns when the Unlocks column is stale and fails on unknown IDs, duplicate IDs or unknown status emoji.

### Tech tree details (briefs, GitHub links, leads, team)

`source/techtree-details.json` holds the per-node extras the popups show: a short `brief`, an optional `github` link, a `lead` and a `team` list. It is keyed by node or moonshot ID (for example `"R-COM1"`) and merged into `src/data/techtree.json` by `npm run techtree`. Starshot entries are kept for later and are not shown yet.

```json
"R-COM1": {
  "brief": "One or two plain sentences, 35 words at most.",
  "github": "https://github.com/<owner>/<repo>/issues/12",
  "lead": "Name or handle",
  "team": ["Name or handle", "Another name"]
}
```

- **Add a GitHub link:** set `github` to a `https://github.com/<owner>/<repo>...` URL (issue, project or repo). The popup and the list then say "See the work on GitHub".
- **Add a lead or team:** `lead` is one name; `team` is a list of strings. Both show under "Who's on it".
- Leave a field `null` (or `[]`) until it exists. Do not add other fields.
- The build prints a `techtree warning` and skips the bad value for: a missing file, an entry that is not an object, an unknown ID or field, a `team` that is not a list of strings, or a `github` that is not `https://github.com/<owner>/<repo>`.
- **`site.links.techtreeIssues`** (in `src/config/site.ts`): when set to a public repo URL, available nodes with no `github` link get "Start this on GitHub", which opens a new issue prefilled with the node ID and name. While it is `null`, those nodes link to the Apply page ("Apply to work on this").
- Briefs are drafts until the owner signs them off.

### Owner review lists (open questions for the tech tree source)

1. **Unlocks claims removed by the sync (no matching Requires; add to the child's Requires if they are real prerequisites):** R-PWR5→A-9, T-NET4→O-4, T-LOG1→T-SIM1, T-LOG1→O-4, T-TSK2→S-6, T-TSK2→L-7, T-TSK2→G-4, T-SIM1→O-4, A-1→X-4, X-3→X-6, O-3→O-4, I-1→I-5, I-2→I-5, I-3→I-5, I-4→I-2.
2. **Moonshot key-node additions (from the doc's own Unlocks column; not reachable otherwise):** MS-2 + T-NODE1, A-4, X-9, X-10, X-11; MS-5 + T-VID1, T-TSK2; MS-13 + O-20; MS-15 + X-10; MS-23 + O-19. (T-DOCK2→MS-2, S-1→MS-4, X-2→MS-2, X-2→MS-3 are already indirect and need no edit.)

Also open for the owner: the Wildlink/name trademark question (no press kit until it is cleared).

## Brand images

`public/og.png` (1200x630 share image), `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `favicon.ico` (16/32/48) are rendered once and committed. To change them, edit `scripts/brand/og.html` or `scripts/brand/icon.svg` and run:

```bash
python3 scripts/brand/render.py   # needs Python Playwright (Chromium) and Pillow
```

`public/favicon.svg` and `public/site.webmanifest` are edited by hand.

## Discord server

`scripts/discord/layout.mjs` describes the server: roles, categories, channels, who can see what, and the first welcome and rules posts. `npm run discord:setup` builds it. It matches by name, creates what's missing, updates the rest and never deletes anything.

**One-time bot setup**

1. https://discord.com/developers/applications → **New Application** (name it `OASA Setup`) → **Bot** → **Reset Token** → copy the token. Keep it secret.
2. **OAuth2 → URL Generator**: scope `bot`, permission `Administrator`. Open the generated URL and add the bot to your server.
3. In Discord: User Settings → Advanced → turn on **Developer Mode**. Right-click your server icon → **Copy Server ID**.

**Run it (PowerShell, in the project folder)**

```powershell
$env:DISCORD_BOT_TOKEN = "paste-the-token"
$env:DISCORD_GUILD_ID  = "paste-the-server-id"
npm run discord:setup              # dry run: shows the plan
npm run discord:setup -- --apply   # makes the changes
```

Afterwards: give yourself the **Core** role, delete any leftover default channels the script lists, and either remove the bot from the server or reset its token (Developer Portal → Bot → Reset Token) until you need it again.

**Access:** anyone who joins sees *Start here* (welcome, rules, announcements, lobby). Applicants also see #applicants. Trial and up see *Community* and *Projects*. *Staff* is Core and Moderators; #applications (website alerts) is Core only; #leads is Leads and Core. Members, Builders and Leads can create invites; @everyone can't.

## Hosting: Cloudflare (free plan)

The site is static files served by **Cloudflare Workers static assets**. GitHub Actions builds the site and deploys it on every push to `main` and nightly. Cost: the free plan, plus the domain registration.

| File | What it does |
|---|---|
| `wrangler.jsonc` | Cloudflare config: serve `./dist`, real 404s via `/404.html`, `/techtree` redirects to `/techtree/`, run the Worker for `/api/*`, D1 binding, custom domains |
| `public/_headers` | Security headers and caching (copied into `dist/` at build) |
| `.github/workflows/deploy.yml` | Build, then `npx wrangler deploy` |

### One-time setup

1. **Account:** create a free Cloudflare account.
2. **Domain:** add `joinoasa.org` to Cloudflare (Free plan). Register it with Cloudflare Registrar, or keep your registrar and switch its nameservers to the two Cloudflare gives you.
3. **API token:** My Profile → API Tokens → Create Token → use the **Edit Cloudflare Workers** template, limited to your account. Copy the token. Copy your **Account ID** from the dashboard overview.
4. **GitHub secrets** (repo → Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
5. **First deploy:** push to `main` (or run the workflow by hand). The site appears at `https://joinoasa.<your-subdomain>.workers.dev`.
6. **Attach the domain:** uncomment the `routes` block in `wrangler.jsonc` and push. Or, in the dashboard: Workers & Pages → `joinoasa` → Settings → Domains & Routes → Add → Custom domain, for both `joinoasa.org` and `www.joinoasa.org`.
7. **www to apex:** Rules → Redirect Rules → use the **Redirect from WWW to root** template (301, keep path and query string).
8. **HTTPS:** SSL/TLS → Edge Certificates → turn on **Always Use HTTPS**. HSTS is already sent by `public/_headers`; don't enable HSTS preload yet.
9. **Email forwarding (free):** Email → Email Routing → enable, then add `hello@`, `membership@`, `chapters@` and `security@` (and any others in `src/config/site.ts`) forwarding to your own inbox. This only receives mail. To *send* as these addresses, add a mail provider later (Google Workspace, Proton, etc.).

### Headers and caching

`public/_headers` sets, for every page:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (no `preload` yet) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests` |

`/_astro/*` (hashed build files) is cached for a year; pages are revalidated on every request, which Cloudflare does by default.

The site uses small inline scripts, so `script-src` allows `'unsafe-inline'` for now. If you add a form service, analytics or embeds, update `connect-src`, `form-action` and `frame-src` first. Example: **Cloudflare Web Analytics** (free, no cookies) needs `https://static.cloudflareinsights.com` added to `script-src` and `https://cloudflareinsights.com` to `connect-src`.

### Preview on Cloudflare's runtime

```bash
npm run preview:cf   # builds, then serves dist/ with Cloudflare's local runtime, including _headers and 404s
npm run deploy       # build and deploy from your machine (needs `npx wrangler login` first)
```

When upgrading `wrangler`, keep `compatibility_date` in `wrangler.jsonc` at or before the newest date that version supports.

## Applications

`/join/apply/` posts to `worker/index.ts`, which checks the answers, saves them in a Cloudflare **D1** database (free plan) and posts a short alert to a private Discord channel. Only `/api/*` runs code; every page is still a static file. Applicants aged 15 to 17 must give a parent or guardian email; their row is saved with `guardian_consent = pending` and their Discord alert shows only the application number.

### One-time setup (from the project folder)

```bash
npx wrangler login
npx wrangler d1 create oasa-applications --location enam
# paste the database_id it prints into wrangler.jsonc (replace REPLACE_WITH_DATABASE_ID)
npm run db:migrate                                # creates the applications table
npx wrangler secret put DISCORD_WEBHOOK_URL       # optional: paste the channel webhook URL
npm run deploy
```

**Discord alerts:** in your server, make a private channel (for example `#applications`, visible to reviewers only) → Edit Channel → Integrations → Webhooks → New Webhook → Copy Webhook URL. Alerts never include email addresses.

**Spam check (optional, free):** Cloudflare dashboard → Turnstile → Add widget, hostname `joinoasa.org`, mode Managed. Put the **site key** in `apply.turnstileSiteKey` in `src/config/site.ts`, run `npx wrangler secret put TURNSTILE_SECRET` with the **secret key**, then deploy. Set both or neither. The form also has a hidden spam-trap field and ignores a second submission from the same email within a day.

### Reading applications

```bash
npm run apps:list            # newest 50: number, date, status, name, city, age group, guardian consent
npm run apps:show -- 12      # one application in full
npx wrangler d1 execute DB --remote --command "UPDATE applications SET status = 'interview' WHERE id = 12"
npx wrangler d1 execute DB --remote --command "UPDATE applications SET guardian_consent = 'received' WHERE id = 13"
```

Statuses: `new`, `reviewing`, `interview`, `trial`, `accepted`, `declined`, `withdrawn`. A review page (behind Cloudflare Access) is planned. You can also browse the table in the dashboard: Storage & Databases → D1 → `oasa-applications`.

**Adding a question:** add it to `src/data/application.ts`, add a migration (`migrations/0002_….sql` with `ALTER TABLE applications ADD COLUMN …`), run `npm run db:migrate`, then deploy.

**Test locally:** `npm run build && npm run db:migrate:local && npx wrangler dev`, then use `npm run apps:show -- 1 --local`. For local Discord tests, put `DISCORD_WEBHOOK_URL=...` in a `.dev.vars` file (git-ignored).

**Deleting an application on request:** `npx wrangler d1 execute DB --remote --command "DELETE FROM applications WHERE id = 12"`.

### Yearly chores

- Renew `security.securityTxtExpires` in `src/config/site.ts`.
- Renew the domain (Cloudflare Registrar can auto-renew at cost).
- Re-run `npm run check:launch` before each release.
