-- Waitlist sign-ups from project pages (first: /phone-radio/).
-- Additive only. Applied by deploy.yml (or: npm run db:migrate).
-- Holds an email address and which list it joined, nothing else.

CREATE TABLE IF NOT EXISTS waitlist (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- Which list: a slug from WAITLISTS in worker/index.ts.
  list        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  UNIQUE (list, email)
);

CREATE INDEX IF NOT EXISTS waitlist_list ON waitlist (list, created_at);
