-- Membership applications from /join/apply/.
-- Apply with: npm run db:migrate   (or npm run db:migrate:local for wrangler dev)
-- Column names match `name` in src/data/application.ts.

CREATE TABLE IF NOT EXISTS applications (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- Review workflow: new, reviewing, interview, trial, accepted, declined, withdrawn
  status            TEXT    NOT NULL DEFAULT 'new',
  name              TEXT    NOT NULL,
  email             TEXT    NOT NULL,
  city_state        TEXT    NOT NULL,
  nearest_chapter   TEXT,
  age_group         TEXT    NOT NULL CHECK (age_group IN ('15-17', '18+')),
  guardian_email    TEXT,
  -- not_needed (18+), pending (15-17, not yet received), received
  guardian_consent  TEXT    NOT NULL DEFAULT 'not_needed',
  skills            TEXT    NOT NULL,
  links             TEXT,
  interests         TEXT,
  time_commitment   TEXT,
  why               TEXT    NOT NULL,
  contract_interest INTEGER NOT NULL DEFAULT 0,
  invited_by        TEXT,
  consent           INTEGER NOT NULL DEFAULT 0,
  -- Private reviewer notes; never shown to applicants.
  notes             TEXT
);

CREATE INDEX IF NOT EXISTS applications_created ON applications (created_at);
CREATE INDEX IF NOT EXISTS applications_email   ON applications (email);
CREATE INDEX IF NOT EXISTS applications_status  ON applications (status);
